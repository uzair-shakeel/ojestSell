'use client'
export default function StepFive({ prevStep, handleSubmit, formData }) {
  return (
    <div className=" bg-white p-5 rounded-lg">
      <h2 className="text-xl font-bold mb-6">Step 5: Review & Submit</h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-5 text-gray-700">
        
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
          <p className="font-medium text-black">{formData.trim}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Type</p>
          <p className="font-medium text-black">{formData.type}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Year</p>
          <p className="font-medium text-black">{formData.year}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Mileage</p>
          <p className="font-medium text-black">{formData.mileage} km</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Drivetrain</p>
          <p className="font-medium text-black">{formData.drivetrain}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Transmission</p>
          <p className="font-medium text-black">{formData.transmission}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Fuel</p>
          <p className="font-medium text-black">{formData.fuel}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Engine</p>
          <p className="font-medium text-black">{formData.engine}L</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Horsepower</p>
          <p className="font-medium text-black">{formData.horsepower} HP</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Accident History</p>
          <p className="font-medium text-black">{formData.accident}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Service History</p>
          <p className="font-medium text-black">{formData.serviceHistory}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">VIN</p>
          <p className="font-medium text-black">{formData.vin}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Registration Status</p>
          <p className="font-medium text-black">{formData.registered}</p>
        </div>

        {/* Car Condition */}
        <div className="col-span-2 text-lg font-bold mt-4">Condition</div>

        {Object.entries(formData.condition).map(([key, value], index) => (
          <div key={index} className="grid grid-cols-2 sm:grid-cols-1 w-full">
            <p className="text-xs uppercase">{key.replace("_", " ")}</p>
            <p className="font-medium text-black">{value}</p>
          </div>
        ))}

        {/* Financial Information */}
        <div className="col-span-2 text-lg font-bold mt-4">Financial Information</div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Sell Options</p>
          <p className="font-medium text-black">{formData.sellOptions.join(", ")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Invoice Options</p>
          <p className="font-medium text-black">{formData.invoiceOptions.join(", ")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Seller Type</p>
          <p className="font-medium text-black">{formData.sellerType}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Price</p>
          <p className="font-medium text-black">
            {formData.sellerType === "company"
              ? `Netto: ${formData.priceNetto} €, With VAT: ${formData.priceWithVat} €`
              : `${formData.priceNetto} €`}
          </p>
        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded">
          Back
        </button>
        <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
          Finish
        </button>
      </div>
    </div>
  );
}
