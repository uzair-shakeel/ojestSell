import { useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';

const CustomMap = ({ location, setLocation }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCvL9AJCbxcJ70RN62qZjtWys9uLpIXSWY', 
    libraries: ['places'], // Required for Autocomplete
  });

  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  // Handle user selecting a location from autocomplete suggestions
  const onPlaceSelected = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setLocation({
          ...location,
          searchText: place.formatted_address,
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
        });
      }
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="w-full mb-4">
        <Autocomplete
          onLoad={(autocompleteInstance) => setAutocomplete(autocompleteInstance)}
          onPlaceChanged={onPlaceSelected}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for a location"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Autocomplete>
      </div>

      {/* Google Map */}
      <GoogleMap
        zoom={10}
        center={{ lat: location.coordinates.lat || 52.2298, lng: location.coordinates.lng || 21.0122 }}
        mapContainerClassName="w-full min-h-96 h-auto rounded-lg"
        onClick={(e) => {
          setLocation({
            ...location,
            coordinates: { lat: e.latLng.lat(), lng: e.latLng.lng() },
          });
        }}
      >
        {location.coordinates.lat && location.coordinates.lng && (
          <Marker position={{ lat: location.coordinates.lat, lng: location.coordinates.lng }} />
        )}
      </GoogleMap>
    </div>
  );
};

export default CustomMap;
