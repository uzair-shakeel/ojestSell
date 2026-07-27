/**
 * Lightweight reverse-geocode with shared in-memory + sessionStorage cache.
 * Does not load the Google Maps JS SDK (CarCard only needs city names).
 */

const memoryCache = new Map();
const inflight = new Map();
const STORAGE_KEY = "ojest:geocode:v1";

function roundCoord(n) {
  return Math.round(Number(n) * 10000) / 10000;
}

function cacheKey(lat, lng) {
  return `${roundCoord(lat)},${roundCoord(lng)}`;
}

function readSessionCache() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSessionCache(key, value) {
  if (typeof window === "undefined") return;
  try {
    const store = readSessionCache();
    store[key] = value;
    const keys = Object.keys(store);
    if (keys.length > 200) {
      keys.slice(0, keys.length - 200).forEach((k) => delete store[k]);
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota / private mode
  }
}

function parseAddressComponents(components = []) {
  let city = "";
  let state = "";
  for (const component of components) {
    if (component.types?.includes("locality")) city = component.long_name;
    if (component.types?.includes("administrative_area_level_1")) {
      state = component.long_name;
    }
  }
  if (!city) {
    const fallback = components.find(
      (c) =>
        c.types?.includes("postal_town") ||
        c.types?.includes("administrative_area_level_2")
    );
    if (fallback) city = fallback.long_name;
  }
  return { city, state };
}

export async function getGeocodingData(latitude, longitude) {
  if (latitude == null || longitude == null) {
    return { city: "", state: "" };
  }

  const key = cacheKey(latitude, longitude);

  if (memoryCache.has(key)) return memoryCache.get(key);

  const sessionHit = readSessionCache()[key];
  if (sessionHit) {
    memoryCache.set(key, sessionHit);
    return sessionHit;
  }

  if (inflight.has(key)) return inflight.get(key);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { city: "", state: "" };
  }

  const promise = (async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const data = await response.json();
      const result =
        data.status === "OK" && data.results?.[0]
          ? parseAddressComponents(data.results[0].address_components)
          : { city: "", state: "" };

      memoryCache.set(key, result);
      writeSessionCache(key, result);
      return result;
    } catch (error) {
      console.error("Error fetching address:", error);
      return { city: "", state: "" };
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
