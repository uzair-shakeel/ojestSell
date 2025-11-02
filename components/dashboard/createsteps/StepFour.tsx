"use client";
import { useState } from "react";

export default function StepFour({ nextStep, prevStep, updateFormData, formData }) {
  const [localData, setLocalData] = useState({
    sellOptions: Array.isArray(formData.financialInfo.sellOptions) ? formData.financialInfo.sellOptions : [],
    invoiceOptions: Array.isArray(formData.financialInfo.invoiceOptions) ? formData.financialInfo.invoiceOptions : [],
    sellerType: formData.financialInfo.sellerType || "private",
    priceNetto: formData.financialInfo.priceNetto || "",
    isFeatured: formData.isFeatured || false,
  });

  const sellOptionsList = ["Wynajem długoterminowy", "Leasing", "Finansowanie/Kredyt", "Gotówka", "Crypto"];
  const invoiceOptionsList = ["Faktura", "Faktura Vat Marża", "Umowa Kupna Sprzedaży"];

  const handleCheckboxChange = (category: "sellOptions" | "invoiceOptions", value: string) => {
    setLocalData((prev) => {
      const updatedList = prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updatedList };
    });
  };

  const handleNext = () => {
    if (localData.sellOptions.length === 0) {
      alert("Please select at least one Sell option.");
      return;
    }
    if (localData.invoiceOptions.length === 0) {
      alert("Please select at least one Invoice option.");
      return;
    }
    if (!localData.priceNetto) {
      alert("Please enter the price.");
      return;
    }
    console.log("Updating formData with:", localData);
    // Persist financial info and isFeatured into parent formData
    const { isFeatured, ...financialLocal } = localData as any;
    updateFormData({ 
      financialInfo: { ...formData.financialInfo, ...financialLocal },
      isFeatured: Boolean(isFeatured),
    });
    nextStep();
  };

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Krok 4: Finansowe Informacje</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">
          Opcje Sprzedaży (Wybierz przynajmniej jedną)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sellOptionsList.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.sellOptions.includes(option)}
                onChange={() => handleCheckboxChange("sellOptions", option)}
                className="h-5 w-5"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">
          Sposób Sprzedaży (Wybierz przynajmniej jedną)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {invoiceOptionsList.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.invoiceOptions.includes(option)}
                onChange={() => handleCheckboxChange("invoiceOptions", option)}
                className="h-5 w-5"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        {localData.invoiceOptions.includes("Faktura Vat Marża") ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Cena (Netto)</label>
              <input
                type="number"
                placeholder="Wprowadź cenę netto"
                className="border p-3 w-full rounded h-12"
                value={localData.priceNetto}
                onChange={(e) =>
                  setLocalData({ ...localData, priceNetto: e.target.value })
                }
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Cena</label>
            <input
              type="number"
              placeholder="Wprowadź cenę"
              className="border p-3 w-full rounded h-12"
              value={localData.priceNetto}
              onChange={(e) =>
                setLocalData({ ...localData, priceNetto: e.target.value })
              }
            />
          </div>
        )}
      </div>

      {/* Featured Car */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFeatured"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            checked={localData.isFeatured}
            onChange={(e) => setLocalData({ ...localData, isFeatured: e.target.checked })}
          />
          <label htmlFor="isFeatured" className="text-gray-700 font-medium">
            Oznacz jako polecany samochód
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
Polecane samochody zostaną wyróżnione i wyeksponowane na stronie internetowej        </p>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cofnij
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Następna
        </button>
      </div>
    </div>
  );
}