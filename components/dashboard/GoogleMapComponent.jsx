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
          type: 'Point',
          coordinates: [place.geometry.location.lng(),place.geometry.location.lat()],
        });
      }
    }
  };

  // Map is not loaded yet
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
        center={{
          lat: location.coordinates[1],
          lng: location.coordinates[0],
        }}
        mapContainerClassName="w-full min-h-96 h-auto rounded-lg"
        onClick={(e) => {
          setLocation({
            ...location,
            coordinates: [e.latLng.lng(), e.latLng.lat()],
          });
        }}
      >
        {location.coordinates[0] && location.coordinates[1] && (
          <Marker position={{ lng: location.coordinates[0], lat: location.coordinates[1] }} />
        )}
      </GoogleMap>
    </div>
  );
};

export default CustomMap;
