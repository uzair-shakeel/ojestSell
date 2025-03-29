'use client'
import { useState } from "react";

export default function StepFour({ nextStep, prevStep, updateFormData }) {
  const [localData, setLocalData] = useState({
    sellOptions: [],
    invoiceOptions: [],
    sellerType: "private",
    priceNetto: "",
    priceWithVat: "",
  });

  const sellOptionsList = ["Long term rental", "Lease", "Financing", "Cash"];
  const invoiceOptionsList = ["Invoice", "Invoice VAT", "Selling Agreement"];

  const handleCheckboxChange = (category, value) => {
    setLocalData((prev) => {
      const updatedList = prev[category].includes(value)
        ? prev[category].filter((item) => item !== value) // Remove if already selected
        : [...prev[category], value]; // Add if not selected
      return { ...prev, [category]: updatedList };
    });
  };

  const handleNext = () => {
    // if (localData.sellOptions.length === 0) {
    //   alert("Please select at least one Sell option.");
    //   return;
    // }
    // if (localData.invoiceOptions.length === 0) {
    //   alert("Please select at least one Invoice option.");
    //   return;
    // }
    // if (!localData.priceNetto) {
    //   alert("Please enter the price.");
    //   return;
    // }

    updateFormData(localData);
    nextStep();
  };

  return (
    <div className=" bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Step 4: Financial Information</h2>

      {/* Sell Options */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Sell Options (Select at least one)</label>
        <div className="grid grid-cols-2 gap-2">
          {sellOptionsList.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.sellOptions.includes(option)}
                onChange={() => handleCheckboxChange("sellOptions", option)}
                className="h-4 w-4"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Invoice Options */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Invoice Options (Select at least one)</label>
        <div className="grid grid-cols-2 gap-2">
          {invoiceOptionsList.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.invoiceOptions.includes(option)}
                onChange={() => handleCheckboxChange("invoiceOptions", option)}
                className="h-4 w-4"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Seller Type Selection */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Seller Type</label>
        <select
          className="border p-3 w-full rounded h-12"
          value={localData.sellerType}
          onChange={(e) => setLocalData({ ...localData, sellerType: e.target.value })}
        >
          <option value="private">Private</option>
          <option value="company">Company</option>
        </select>
      </div>

      {/* Pricing - Different for Private and Company Sellers */}
      <div className="mb-4">
        {localData.sellerType === "private" ? (
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Price</label>
            <input
              type="number"
              placeholder="Enter Price"
              className="border p-3 w-full rounded h-12"
              value={localData.priceNetto}
              onChange={(e) => setLocalData({ ...localData, priceNetto: e.target.value })}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Price (Netto)</label>
              <input
                type="number"
                placeholder="Enter Netto Price"
                className="border p-3 w-full rounded h-12"
                value={localData.priceNetto}
                onChange={(e) => setLocalData({ ...localData, priceNetto: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Price (With VAT)</label>
              <input
                type="number"
                placeholder="Enter Price with VAT"
                className="border p-3 w-full rounded h-12"
                value={localData.priceWithVat}
                onChange={(e) => setLocalData({ ...localData, priceWithVat: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded">
          Back
        </button>
        <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
          Next
        </button>
      </div>
    </div>
  );
}
