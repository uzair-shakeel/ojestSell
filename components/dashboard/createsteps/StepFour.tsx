"use client";
import { useState } from "react";

export default function StepFour({ nextStep, prevStep, updateFormData, formData }) {
  // Polish label -> English value mappings expected by backend
  const SELL_OPTIONS = [
    { label: "Wynajem długoterminowy", value: "Long term rental" },
    { label: "Leasing", value: "Lease" },
    { label: "Finansowanie/Kredyt", value: "Financing" },
    { label: "Gotówka", value: "Cash" },
  ];
  const INVOICE_OPTIONS = [
    { label: "Faktura", value: "Invoice" },
    { label: "Faktura VAT", value: "Invoice VAT" },
    { label: "Umowa Kupna Sprzedaży", value: "Selling Agreement" },
  ];

  const polishToEnglishSell: Record<string, string> = {
    "Wynajem długoterminowy": "Long term rental",
    Leasing: "Lease",
    "Finansowanie/Kredyt": "Financing",
    "Gotówka": "Cash",
    // Remove unsupported: Crypto (no mapping)
  };
  const polishToEnglishInvoice: Record<string, string> = {
    "Faktura": "Invoice",
    "Faktura Vat Marża": "Invoice VAT",
    "Faktura VAT": "Invoice VAT",
    "Umowa Kupna Sprzedaży": "Selling Agreement",
  };

  const normalizeValues = (arr: any[], map: Record<string, string>) =>
    (Array.isArray(arr) ? arr : [])
      .map((v) => (map[v] ? map[v] : v))
      .filter((v) => typeof v === "string");

  const [localData, setLocalData] = useState({
    // Ensure we store ENGLISH values
    sellOptions: normalizeValues(formData.financialInfo.sellOptions, polishToEnglishSell),
    invoiceOptions: normalizeValues(formData.financialInfo.invoiceOptions, polishToEnglishInvoice),
    sellerType: formData.financialInfo.sellerType || "private",
    priceNetto: formData.financialInfo.priceNetto || "",
    isFeatured: formData.isFeatured || false,
  });

  // UI lists: show Polish labels but toggle English values in state
  const sellOptionsList = SELL_OPTIONS;
  const invoiceOptionsList = INVOICE_OPTIONS;

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
    console.log("Updating formData with (english values):", localData);
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
                checked={localData.sellOptions.includes(option.value)}
                onChange={() => handleCheckboxChange("sellOptions", option.value)}
                className="h-5 w-5"
              />
              <span>{option.label}</span>
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
                checked={localData.invoiceOptions.includes(option.value)}
                onChange={() => handleCheckboxChange("invoiceOptions", option.value)}
                className="h-5 w-5"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        {localData.invoiceOptions.includes("Invoice VAT") ? (
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