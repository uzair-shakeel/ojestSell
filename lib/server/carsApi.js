/**
 * Server-only car API helpers for RSC pages / Link prefetch.
 * Uses native fetch so Next can cache & stream the result into navigations.
 */

function apiBase() {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  return `${base}/api`;
}

function toQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || Number.isNaN(value)) return;
    qs.set(key, String(value));
  });
  return qs.toString();
}

export async function serverSearchCars(params = {}) {
  const query = toQuery({
    page: 1,
    limit: 12,
    sortBy: "best-match",
    ...params,
  });

  try {
    const res = await fetch(`${apiBase()}/cars/search?${query}`, {
      next: { revalidate: 30 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return { cars: [], total: 0, page: 1, limit: 12, totalPages: 1 };
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      return {
        cars: data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
      };
    }

    return {
      cars: Array.isArray(data.cars) ? data.cars : [],
      total: Number(data.total ?? 0),
      page: Number(data.page ?? 1),
      limit: Number(data.limit ?? 12),
      totalPages: Number(data.totalPages ?? 1),
    };
  } catch (error) {
    console.error("serverSearchCars error:", error);
    return { cars: [], total: 0, page: 1, limit: 12, totalPages: 1 };
  }
}

export async function serverGetCarById(carId) {
  if (!carId) return null;
  try {
    const res = await fetch(`${apiBase()}/cars/${carId}`, {
      next: { revalidate: 15 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("serverGetCarById error:", error);
    return null;
  }
}

export async function serverGetPublicUser(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${apiBase()}/users/public/${userId}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Map URL searchParams (Record or URLSearchParams-like) to API filters */
export function mapCarsSearchParams(sp = {}) {
  const get = (key) => {
    const v = typeof sp.get === "function" ? sp.get(key) : sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const filters = {};
  if (get("make")) filters.make = get("make");
  if (get("model")) filters.model = get("model");
  if (get("bodyType") || get("type")) filters.type = get("bodyType") || get("type");
  if (get("fuel")) filters.fuel = get("fuel");
  if (get("drivetrain")) filters.drivetrain = get("drivetrain");
  if (get("transmission")) filters.transmission = get("transmission");
  if (get("condition") || get("stan")) filters.condition = get("condition") || get("stan");
  if (get("color")) filters.color = get("color");
  if (get("serviceHistory")) filters.serviceHistory = get("serviceHistory");
  if (get("accidentHistory")) filters.accidentHistory = get("accidentHistory");
  if (get("priceFrom")) filters.minPrice = Number(get("priceFrom"));
  if (get("priceTo")) filters.maxPrice = Number(get("priceTo"));
  if (get("yearFrom") || get("minYear")) filters.yearFrom = Number(get("yearFrom") || get("minYear"));
  if (get("yearTo") || get("maxYear")) filters.yearTo = Number(get("yearTo") || get("maxYear"));
  if (filters.yearFrom && !filters.yearTo) filters.yearTo = new Date().getFullYear() + 1;
  if (!filters.yearFrom && filters.yearTo) filters.yearFrom = 1900;
  if (get("maxDistance") || get("distance")) {
    filters.maxDistance = Number(get("maxDistance") || get("distance"));
  }

  const mileageRange = get("mileageRange");
  if (mileageRange) {
    if (mileageRange.includes("+")) {
      filters.minMileage = parseInt(mileageRange.replace("+", ""), 10);
    } else if (mileageRange.includes("-")) {
      const [min, max] = mileageRange.split("-");
      filters.minMileage = parseInt(min, 10);
      filters.mileage = parseInt(max, 10);
    }
  }

  const engineRange = get("engineCapacityRange");
  if (engineRange) {
    if (engineRange.includes("+")) {
      filters.minEngine = parseInt(engineRange.replace("+", ""), 10);
    } else if (engineRange.includes("-")) {
      const [min, max] = engineRange.split("-");
      filters.minEngine = parseInt(min, 10);
      filters.maxEngine = parseInt(max, 10);
    }
  }

  if (get("krajPochodzenia") || get("country") || get("origin")) {
    filters.country = get("krajPochodzenia") || get("country") || get("origin");
  }
  if (get("krajProducenta") || get("countryOfManufacturer")) {
    filters.countryOfManufacturer =
      get("krajProducenta") || get("countryOfManufacturer");
  }

  filters.page = Number(get("page")) || 1;
  filters.limit = Number(get("limit")) || 12;
  if (get("sortBy")) filters.sortBy = get("sortBy");

  return filters;
}
