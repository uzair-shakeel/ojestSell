"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMakesModels } from "../../hooks/useMakesModels";

// Car makes and models are now loaded from the JSON file via useMakesModels hook

// Car types
const CAR_TYPES = [
  "All Types",
  "hatchback",
  "sedan",
  "kombi",
  "coupe",
  "sports",
  "limousine",
  "suv",
  "convertible",
  "pickup",
  "offroad",
  "bus",
  "classic",
  "campers",
];

// Generate years for dropdown
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) =>
  (currentYear - i).toString()
);

export function FilterSearch() {
  const router = useRouter();
  const { getMakes, getModelsForMake, loading } = useMakesModels();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  // Get models for selected make
  const availableModels = make ? getModelsForMake(make) : [];

  const handleSearch = () => {
    console.log("Searching with params:", {
      make,
      model,
      type,
      startYear,
      endYear,
    });

    router.push(
      `/website/cars?make=${make}&model=${model}&type=${type}&startYear=${startYear}&endYear=${endYear}`
    );
    // TODO: Implement actual search functionality
  };

  const validateEndDate = (endDate) => {
    if (startYear && endDate < startYear) {
      setEndYear("");
    }
  };

  return (
    <div className="w-full   max-w-6xl mx-auto">
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className=" rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 space-y-3">
            {/* Make & Model in one row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Make Dropdown */}
              <select
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setModel(""); // Reset model when make changes
                }}
                className="w-full h-12 px-3 border  rounded-md bg-white/70 text-black font-medium "
                disabled={loading}
              >
                <option value="" disabled>
                Marka
                </option>
                {getMakes().map((makeName) => (
                  <option key={makeName} value={makeName}>
                    {makeName}
                  </option>
                ))}
              </select>

              {/* Model Dropdown */}
              <select
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                }}
                className="w-full h-12 px-3 border rounded-md bg-white/70 text-black font-medium "
                disabled={loading || !make || type !== ""}
              >
                <option value="" disabled>
                  Model
                </option>
                {availableModels.map((modelOption) => (
                  <option key={modelOption} value={modelOption}>
                    {modelOption}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Range - 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <select
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                className="w-full h-12 px-3 border rounded-md bg-white/70 text-black font-medium "
              >
                <option value="" disabled>
                Rok od
                </option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={endYear}
                onChange={(e) => {
                  setEndYear(e.target.value);
                  validateEndDate(e.target.value);
                }}
                className="w-full h-12 px-3 border rounded-md bg-white/70 text-black font-medium "
              >
                <option value="" disabled>
                Rok do 
                </option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <p>lub</p>

            {/* Type Dropdown - Moved to just before search button */}
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setModel("");
              }}
              className={cn(
                "w-full h-12 px-3 border bg-gray-200 rounded-md font-medium ",
                model ? "bg-gray-200 text-gray-500" : " text-black"
              )}
              disabled={model}
            >
              <option value="" disabled>
                Typ
              </option>
              {CAR_TYPES.map((carType) => (
                <option key={carType} value={carType}>
                  {carType}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Szukaj
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className=" rounded-lg shadow-lg overflow-hidden">
          {/* Using a single grid for consistent heights */}
          <div className="grid grid-cols-1 gap-4 grid-rows-2">
            {/* Top row: Make, Model, Type */}
            <div className="grid grid-cols-3 gap-4 h-[72px]">
              {/* Make Dropdown */}
              <div className="  h-full flex">
                <select
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value);
                    setModel(""); // Reset model when make changes
                  }}
                  className="w-full h-full px-4 font-semibold border-0 bg-white/70 text-black  focus:ring-0 focus:outline-none appearance-none"
                  style={{ height: "100%" }} // Inline style for Safari
                  disabled={loading}
                >
                  <option value="" disabled>
                    Marka
                  </option>
                  {getMakes().map((makeName) => (
                    <option key={makeName} value={makeName}>
                      {makeName}
                    </option>
                  ))}
                </select>
              </div>
              {/* Model Dropdown */}
              <div className="  h-full flex">
                <select
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                  }}
                  className={`w-full h-full px-4 border-0 bg-white/70 font-medium focus:ring-0 focus:outline-none appearance-none ${
                    !make || type !== ""
                      ? "text-gray-600 font-light"
                      : "text-black"
                  }`}
                  disabled={loading || !make || type !== ""}
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  <option value="" disabled>
                      Model
                  </option>
                  {availableModels.map((modelOption) => (
                    <option key={modelOption} value={modelOption}>
                      {modelOption}
                    </option>
                  ))}
                </select>
              </div>
              {/* Type Dropdown - Moved to top row */}
              <div className="h-full flex">
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setModel("");
                  }}
                  className={cn(
                    "w-full h-full px-4 border-0 font-semibold bg-gray-200  focus:ring-0 focus:outline-none appearance-none",
                    model ? "bg-gray-200 text-gray-500" : " text-black"
                  )}
                  disabled={model}
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  <option value="" disabled>
                    Typ
                  </option>
                  {CAR_TYPES.map((carType) => (
                    <option key={carType} value={carType}>
                      {carType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom row: Start Year, End Year, Search Button, Reset Button */}
            <div className="grid grid-cols-3 gap-4  h-[72px]">
              {/* Start Year Dropdown */}
              <div className=" h-full flex">
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="w-full h-full px-4 font-semibold border-0   bg-white/70 text-black  focus:ring-0 focus:outline-none appearance-none"
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  <option value="" disabled>
                    Rok od
                  </option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {/* End Year Dropdown */}
              <div className=" h-full flex">
                <select
                  value={endYear}
                  onChange={(e) => {
                    setEndYear(e.target.value);
                    validateEndDate(e.target.value);
                  }}
                  className="w-full h-full px-4 border-0  font-semibold bg-white/70 text-black  focus:ring-0 focus:outline-none appearance-none"
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  <option value="" disabled>
                    Rok do
                  </option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="flex w-full  h-full">
                <button
                  onClick={handleSearch}
                  className="w-full h-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  Szukaj
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
