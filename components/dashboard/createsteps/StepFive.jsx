"use client";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "../../../lib/GoogleMapsContext";
import { useState, useEffect } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function StepFive({
  prevStep,
  handleSubmit,
  formData,
  updateFormData,
  loading,
}) {
  const { isLoaded, getGeocodingData } = useGoogleMaps();
  const [locationDetails, setLocationDetails] = useState({
    city: "",
    state: "",
  });

  // Fetch location details when component loads
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (formData.location?.coordinates?.length === 2) {
        try {
          const details = await getGeocodingData(
            formData.location.coordinates[1],
            formData.location.coordinates[0]
          );
          setLocationDetails(details);
        } catch (error) {
          console.error("Error fetching location details:", error);
        }
      }
    };

    if (isLoaded) {
      fetchLocationDetails();
    }
  }, [formData.location, isLoaded, getGeocodingData]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-300">
        Krok 5: Przejrzyj i Potwierdź
      </h2>

      {/* Grid Layout */}
      <div className="sm:grid sm:grid-cols-2 space-y-5 gap-y-5 text-gray-700 dark:text-gray-300 transition-colors duration-300">
        {/* Title & Description */}
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Tytuł</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.title}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Opis</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.description}
          </p>
        </div>

        {/* Car Details */}
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Marka</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.make}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Model</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.model}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Wersja</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.trim || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Typ</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.type}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Rok</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.year || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Przebieg</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.mileage ? `${formData.mileage} km` : "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Napęd</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.drivetrain || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Skrzynia Biegów</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.transmission || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Paliwo</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.fuel || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Silnik</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.engine ? `${formData.engine}L` : "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Konie Mechaniczne</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.horsepower ? `${formData.horsepower} HP` : "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Historia Bezwypadkowość</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.accidentHistory || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Historia Serwisowa</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.serviceHistory || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">VIN</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.vin || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Kraj pochodzenia</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.country || "N/A"}
          </p>
        </div>

        {/* Car Condition */}
        <div className="col-span-2 text-lg font-bold mt-4 text-gray-900 dark:text-white transition-colors duration-300">
          Condition
        </div>
        {Object.entries(formData.condition).map(([key, value], index) => (
          <div key={index} className="grid grid-cols-2 sm:grid-cols-1 w-full">
            <p className="text-xs uppercase">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <p className="font-medium text-black dark:text-white transition-colors duration-300">
              {value || "N/A"}
            </p>
          </div>
        ))}

        {/* Financial Information */}
        <div className="col-span-2 text-lg font-bold mt-4 text-gray-900 dark:text-white transition-colors duration-300">
          Financial Information
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Sell Options</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.financialInfo.sellOptions.join(", ") || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Invoice Options</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.financialInfo.invoiceOptions.join(", ") || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Seller Type</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.financialInfo.sellerType}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Price</p>
          <p className="font-medium text-black dark:text-white transition-colors duration-300">
            {formData.financialInfo.invoiceOptions.includes("Invoice VAT")
              ? `Netto: ${formData.financialInfo.priceNetto} €, With VAT: ${
                  formData.financialInfo.priceWithVat || "Auto-calculated"
                } €`
              : `${formData.financialInfo.priceNetto} €`}
          </p>
        </div>

        {/* Location Information */}
        <div className="col-span-2 text-lg font-bold mt-4 text-gray-900 dark:text-white transition-colors duration-300">
          Location
        </div>
        {locationDetails.city && (
          <div className="col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg mb-3 flex items-center transition-colors duration-300">
            <FaMapMarkerAlt className="text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0 transition-colors duration-300" />
            <div>
              <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                Car Location:
              </span>{" "}
              <span className="text-gray-900 dark:text-white transition-colors duration-300">
                {locationDetails.city}
                {locationDetails.state ? `, ${locationDetails.state}` : ""}
              </span>
            </div>
          </div>
        )}
        <div className="col-span-2">
          {isLoaded && formData.location && (
            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200 shadow-md">
              <GoogleMap
                zoom={12}
                center={{
                  lat: formData.location.coordinates[1],
                  lng: formData.location.coordinates[0],
                }}
                mapContainerClassName="w-full h-full"
                options={{
                  fullscreenControl: true,
                  streetViewControl: true,
                  mapTypeControl: false,
                  zoomControl: true,
                }}
              >
                <Marker
                  position={{
                    lat: formData.location.coordinates[1],
                    lng: formData.location.coordinates[0],
                  }}
                />
              </GoogleMap>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Cofnij
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Przesyłanie..." : "Zatwierdź"}
        </button>
      </div>
    </div>
  );
}
