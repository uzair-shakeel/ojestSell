"use client";
import { createContext, useContext, useCallback, useMemo } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { getGeocodingData as fetchGeocode } from "./geocode";

const libraries = ["places"];

const GoogleMapsContext = createContext(null);

export function GoogleMapsProvider({ children }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
    googleMapsClientId: "ojestSell-app",
  });

  const getGeocodingData = useCallback(async (latitude, longitude) => {
    return fetchGeocode(latitude, longitude);
  }, []);

  const value = useMemo(
    () => ({ isLoaded, loadError, getGeocodingData }),
    [isLoaded, loadError, getGeocodingData]
  );

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === null) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
}
