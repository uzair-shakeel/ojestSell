"use client";
import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { GoogleMapsProvider, useGoogleMaps } from "../../lib/GoogleMapsContext";

const LocationTabInner = ({ location }) => {
  const { isLoaded } = useGoogleMaps();

  if (!isLoaded) return <div>Loading...</div>;

  const coordinates = location.coordinates;
  const lat = coordinates[1];
  const lng = coordinates[0];

  return (
    <div className="w-full">
      <GoogleMap
        zoom={10}
        center={{ lat: lat, lng: lng }}
        mapContainerClassName="w-full h-96 rounded-lg"
      >
        {lat && lng && <Marker position={{ lat: lat, lng: lng }} />}
      </GoogleMap>
    </div>
  );
};

const LocationTab = ({ location }) => (
  <GoogleMapsProvider>
    <LocationTabInner location={location} />
  </GoogleMapsProvider>
);

export default LocationTab;
