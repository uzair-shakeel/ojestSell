import React from 'react'
import { useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';


const LocationTab = () => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: 'AIzaSyCvL9AJCbxcJ70RN62qZjtWys9uLpIXSWY', 
        libraries: ['places'], // Required for Autocomplete
      });
      if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="w-full">
    {/* Google Map */}
    <GoogleMap
      zoom={10}
      center={{ lat: 52.2298, lng: 21.0122 }}
      mapContainerClassName="w-full h-96 rounded-lg"
    >
      {/* {location.coordinates.lat && location.coordinates.lng && (
        <Marker position={{ lat: location.coordinates.lat, lng: location.coordinates.lng }} />
      )} */}
    </GoogleMap>
  </div>
  )
}

export default LocationTab