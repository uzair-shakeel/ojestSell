"use client";
import { X } from "lucide-react";
import { useState } from "react";

export default function FilterSidebar({
  onApplyFilters,
  setShowMobileFilter,
  isVisible = true,
}) {
  const [openIndex, setOpenIndex] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    maxDistance: "",
    make: "",
    model: "",
    type: "",
    yearFrom: "",
    yearTo: "",
    condition: "",
    minMileage: "",
    maxMileage: "",
    drivetrain: "",
    transmission: "",
    fuel: "",
    engine: "",
    serviceHistory: "",
    accidentHistory: "",
  });

  const closeMobileFilter = () => {
    setShowMobileFilter(false);
  };

  const toggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    // Prepare query params for the backend
    const queryParams = {
      longitude: filters.location ? "19.945" : undefined, // Placeholder; use geocoding in production
      latitude: filters.location ? "50.0647" : undefined, // Placeholder
      maxDistance: filters.maxDistance || undefined,
      make: filters.make || undefined,
      model: filters.model || undefined,
      type: filters.type || undefined,
      yearFrom: filters.yearFrom || undefined,
      yearTo: filters.yearTo || undefined,
      condition: filters.condition || undefined, // Simplification: takes first condition
      minMileage: filters.minMileage || undefined,
      maxMileage: filters.maxMileage || undefined,
      drivetrain: filters.drivetrain || undefined,
      transmission: filters.transmission || undefined,
      fuel: filters.fuel || undefined,
      engine: filters.engine || undefined,
      serviceHistory: filters.serviceHistory || undefined,
      accidentHistory: filters.accidentHistory || undefined,
    };
    onApplyFilters(queryParams); // Pass filters to parent
    closeMobileFilter(); // Hide the filter
  };

  const handleReset = () => {
    setFilters({
      location: "",
      maxDistance: "",
      make: "",
      model: "",
      type: "",
      yearFrom: "",
      yearTo: "",
      condition: "",
      minMileage: "",
      maxMileage: "",
      drivetrain: "",
      transmission: "",
      fuel: "",
      engine: "",
      serviceHistory: "",
      accidentHistory: "",
    });
    onApplyFilters({}); // Reset filters by sending empty params
  };

  return (
    <div className="w-full lg:sticky lg:top-4 lg:max-w-xs h-full">
      <div className="border rounded-md bg-white text-gray-900 flex flex-col h-[100vh] md:h-auto">
        <div className="flex justify-between items-center px-4 py-4 border-b sticky top-0 bg-white z-10">
          <div className="flex gap-6 items-center">
            <h2 className="text-2xl font-semibold">Filters</h2>
            <button
              onClick={handleReset}
              className="text-lg text-blue-600 font-medium"
            >
              Reset
            </button>
          </div>
          <button onClick={closeMobileFilter} className="text-md md:hidden">
            <X size={30} />
          </button>
        </div>

        <div
          className="divide-y overflow-auto flex-1 touch-pan-y -webkit-overflow-scrolling-touch overscroll-contain"
          style={{ height: "calc(100vh - 132px)" }}
          onClick={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* 0 - Location */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 0 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(0)}
            >
              Location
            </div>
            <div className="collapse-content space-y-2">
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleInputChange}
                placeholder="Enter location"
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              />
              <select
                name="maxDistance"
                value={filters.maxDistance}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">Select distance</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="15">15 km</option>
                <option value="20">20 km</option>
              </select>
            </div>
          </div>

          {/* 1 - Make */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 1 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(1)}
            >
              Make
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="make"
                value={filters.make}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Nissan">Nissan</option>
                <option value="BMW">BMW</option>
              </select>
            </div>
          </div>

          {/* 2 - Model */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 2 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(2)}
            >
              Model
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="model"
                value={filters.model}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="MX3">MX3</option>
                <option value="MX2">MX2</option>
                <option value="MX1">MX1</option>
                <option value="320i">320i</option>
              </select>
            </div>
          </div>

          {/* 3 - Type */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 3 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(3)}
            >
              Type
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="type"
                value={filters.type}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
          </div>

          {/* 4 - Year */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 4 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(4)}
            >
              Year
            </div>
            <div className="collapse-content space-y-2">
              <div className="flex gap-2">
                <select
                  name="yearFrom"
                  value={filters.yearFrom}
                  onChange={handleInputChange}
                  className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
                >
                  <option value="">From</option>
                  <option value="2015">2015</option>
                  <option value="2016">2016</option>
                  <option value="2017">2017</option>
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                </select>
                <select
                  name="yearTo"
                  value={filters.yearTo}
                  onChange={handleInputChange}
                  className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
                >
                  <option value="">To</option>
                  <option value="2015">2015</option>
                  <option value="2016">2016</option>
                  <option value="2017">2017</option>
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5 - Condition */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 5 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(5)}
            >
              Condition
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="condition"
                value={filters.condition}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>
          </div>

          {/* 6 - Mileage */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 6 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(6)}
            >
              Mileage
            </div>
            <div className="collapse-content space-y-2">
              <div className="flex gap-2">
                <select
                  name="minMileage"
                  value={filters.minMileage}
                  onChange={handleInputChange}
                  className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
                >
                  <option value="">From</option>
                  <option value="50000">50,000 km</option>
                  <option value="100000">100,000 km</option>
                  <option value="150000">150,000 km</option>
                  <option value="200000">200,000 km</option>
                </select>
                <select
                  name="maxMileage"
                  value={filters.maxMileage}
                  onChange={handleInputChange}
                  className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
                >
                  <option value="">To</option>
                  <option value="50000">50,000 km</option>
                  <option value="100000">100,000 km</option>
                  <option value="150000">150,000 km</option>
                  <option value="200000">200,000 km</option>
                </select>
              </div>
            </div>
          </div>

          {/* 7 - Drivetrain */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 7 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(7)}
            >
              Drivetrain
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="drivetrain"
                value={filters.drivetrain}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="FWD">FWD</option>
                <option value="RWD">RWD</option>
                <option value="AWD">AWD</option>
              </select>
            </div>
          </div>

          {/* 8 - Transmission */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 8 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(8)}
            >
              Transmission
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>

          {/* 9 - Fuel Type */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 9 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(9)}
            >
              Fuel Type
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="fuel"
                value={filters.fuel}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* 10 - Engine */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 10 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(10)}
            >
              Engine
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="engine"
                value={filters.engine}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="1.6L">1.6L</option>
                <option value="2.0L">2.0L</option>
                <option value="2.5L">2.5L</option>
                <option value="3.0L">3.0L</option>
                <option value="4.0L">4.0L</option>
                <option value="5.0L">5.0L</option>
                <option value="6.0L">6.0L</option>
                <option value="8.0L">8.0L</option>
              </select>
            </div>
          </div>

          {/* 11 - Service History */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 11 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(11)}
            >
              Service History
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="serviceHistory"
                value={filters.serviceHistory}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="Full">Full</option>
                <option value="Partial">Partial</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {/* 12 - Accident History */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 12 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer"
              onClick={() => toggle(12)}
            >
              Accident History
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="accidentHistory"
                value={filters.accidentHistory}
                onChange={handleInputChange}
                className="w-full p-4 min-h-[50px] rounded-md bg-white border border-gray-300 text-md appearance-none"
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 border-t sticky bottom-0 bg-white z-10">
          <button
            onClick={handleApplyFilters}
            className="text-md bg-blue-600 text-white px-4 py-3 rounded-md w-full font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
