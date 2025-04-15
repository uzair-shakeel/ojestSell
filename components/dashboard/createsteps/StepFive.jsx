"use client";
import CustomMap from "../GoogleMapComponent"; // Adjust path as needed

export default function StepFive({ prevStep, handleSubmit, formData, updateFormData, loading }) {
  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-6">Step 5: Review & Submit</h2>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Location</label>
        <CustomMap
          location={formData.location}
          setLocation={(newLocation) => updateFormData({ location: newLocation })}
        />
      </div>

      {/* Grid Layout */}
      <div className="sm:grid sm:grid-cols-2 space-y-5 gap-y-5 text-gray-700">
        {/* Title & Description */}
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Title</p>
          <p className="font-medium text-black">{formData.title}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Description</p>
          <p className="font-medium text-black">{formData.description}</p>
        </div>

        {/* Car Details */}
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Make</p>
          <p className="font-medium text-black">{formData.make}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Model</p>
          <p className="font-medium text-black">{formData.model}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Trim</p>
          <p className="font-medium text-black">{formData.trim || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Type</p>
          <p className="font-medium text-black">{formData.type}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Year</p>
          <p className="font-medium text-black">{formData.year || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Mileage</p>
          <p className="font-medium text-black">{formData.mileage ? `${formData.mileage} km` : "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Drivetrain</p>
          <p className="font-medium text-black">{formData.drivetrain || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Transmission</p>
          <p className="font-medium text-black">{formData.transmission || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Fuel</p>
          <p className="font-medium text-black">{formData.fuel || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Engine</p>
          <p className="font-medium text-black">{formData.engine ? `${formData.engine}L` : "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Horsepower</p>
          <p className="font-medium text-black">{formData.horsepower ? `${formData.horsepower} HP` : "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Accident History</p>
          <p className="font-medium text-black">{formData.accidentHistory || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Service History</p>
          <p className="font-medium text-black">{formData.serviceHistory || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">VIN</p>
          <p className="font-medium text-black">{formData.vin || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Country of Origin</p>
          <p className="font-medium text-black">{formData.country || "N/A"}</p>
        </div>

        {/* Car Condition */}
        <div className="col-span-2 text-lg font-bold mt-4">Condition</div>
        {Object.entries(formData.condition).map(([key, value], index) => (
          <div key={index} className="grid grid-cols-2 sm:grid-cols-1 w-full">
            <p className="text-xs uppercase">{key.replace(/([A-Z])/g, " $1").trim()}</p>
            <p className="font-medium text-black">{value || "N/A"}</p>
          </div>
        ))}

        {/* Financial Information */}
        <div className="col-span-2 text-lg font-bold mt-4">Financial Information</div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Sell Options</p>
          <p className="font-medium text-black">{formData.sellOptions.join(", ") || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Invoice Options</p>
          <p className="font-medium text-black">{formData.invoiceOptions.join(", ") || "N/A"}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Seller Type</p>
          <p className="font-medium text-black">{formData.sellerType}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Price</p>
          <p className="font-medium text-black">
            {formData.invoiceOptions.includes("Invoice VAT")
              ? `Netto: ${formData.priceNetto} €, With VAT: ${formData.priceWithVat || "Auto-calculated"} €`
              : `${formData.priceNetto} €`}
          </p>
        </div>

        {/* Location */}
        <div className="col-span-2 text-lg font-bold mt-4">Location</div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Coordinates</p>
          <p className="font-medium text-black">
            {formData.location.coordinates.lat && formData.location.coordinates.lng
              ? `Lat: ${formData.location.coordinates.lat}, Lng: ${formData.location.coordinates.lng}`
              : "Not selected"}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Finish"}
        </button>
      </div>
    </div>
  );
}