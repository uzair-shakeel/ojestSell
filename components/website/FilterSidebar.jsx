"use client";
import { useState } from "react";

export default function FilterSidebar() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <div className="w-full border rounded-md bg-white lg:max-w-xs text-gray-900">
      <div className="flex justify-between items-center px-4 py-4 border-b">
        <h2 className="text-2xl font-semibold">Filters</h2>
        <button className="text-base text-blue-600 font-medium">Reset</button>
      </div>

      <div className="divide-y overflow-auto max-h-[calc(100vh-150px)] scrollbar-hide">
        {/* 0 - Location */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 0 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(0)}
          >
            Location
          </div>
          <div className="collapse-content space-y-2">
            <input
              type="text"
              placeholder="Enter location"
              className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
            />
            <select className="w-full p-2 rounded-md bg-white border border-gray-300 text-base">
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="15">15 km</option>
              <option value="20">20 km</option>
            </select>
          </div>
        </div>

        {/* 1 - Make */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 1 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(1)}
          >
            Make
          </div>
          <div className="collapse-content space-y-2">
            <select className="w-full p-2 rounded-md bg-white border border-gray-300 text-base">
              <option value="">All</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Nissan">Nissan</option>
            </select>
          </div>
        </div>

        {/* 2 - Model */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 2 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(2)}
          >
            Model
          </div>
          <div className="collapse-content space-y-2">
            <select className="w-full p-2 rounded-md bg-white border border-gray-300 text-base">
              <option value="">All</option>
              <option value="MX3">MX3</option>
              <option value="MX2">MX2</option>
              <option value="MX1">MX1</option>
            </select>
          </div>
        </div>

        {/* 3 - Type */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 3 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(3)}
          >
            Type
          </div>
          <div className="collapse-content space-y-2">
            <select className="w-full p-2 rounded-md bg-white border border-gray-300 text-base">
              <option value="">All</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Truck">Truck</option>
            </select>
          </div>
        </div>

        {/* 4 - Year */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 4 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(4)}
          >
            Year
          </div>
          <div className="collapse-content space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="From"
                className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
              />
              <input
                type="number"
                placeholder="To"
                className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
              />
            </div>
          </div>
        </div>

        {/* 5 - Condition */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 5 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(5)}
          >
            Condition
          </div>
          <div className="collapse-content space-y-2">
            <div className="flex flex-col items-start gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 bg-white border border-gray-300"
                  value="new"
                />
                <span className="text-lg">New</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 bg-white border border-gray-300"
                  value="used"
                />
                <span className="text-lg">Used</span>
              </label>
            </div>
          </div>
        </div>

        {/* 6 - Mileage */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 6 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(6)}
          >
            Mileage
          </div>
          <div className="collapse-content space-y-2">
            <select
              name="mileage"
              className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
            >
              <option value="50000">50,000 km</option>
              <option value="100000">100,000 km</option>
              <option value="150000">150,000 km</option>
              <option value="200000">200,000 km</option>
            </select>
          </div>
        </div>

        {/* 7 - Drivetrain */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 7 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(7)}
          >
            Drivetrain
          </div>
          <div className="collapse-content space-y-2">
            <select
              name="drivetrain"
              className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
            >
              <option value="FWD">FWD</option>
              <option value="RWD">RWD</option>
              <option value="AWD">AWD</option>
            </select>
          </div>
        </div>

        {/* 8 - Transmission */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 8 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(8)}
          >
            Transmission
          </div>
          <div className="collapse-content space-y-2">
            <select
              name="transmission"
              className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        {/* 9 - Fuel type */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 9 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(9)}
          >
            Fuel type
          </div>
          <div className="collapse-content space-y-2">
            <select
              name="fuel_type"
              className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* 10 - Engine */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 10 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(10)}
          >
            Engine
          </div>
          <div className="collapse-content space-y-2">
            <select
              name="engine"
              className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
            >
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
          className={`collapse collapse-arrow px-2 ${
            openIndex === 11 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(11)}
          >
            Service History
          </div>
          <div className="collapse-content space-y-2">
            <select
              name="service_history"
              className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
            >
              <option value="not specified">not specified</option>
              <option value="Full">Full</option>
              <option value="Partial">Partial</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>

        {/* 12 - Accident History */}
        <div
          className={`collapse collapse-arrow px-2 ${
            openIndex === 12 ? "collapse-open" : ""
          }`}
        >
          <div
            className="collapse-title text-lg font-medium cursor-pointer"
            onClick={() => toggle(12)}
          >
            Accident History
          </div>
          <div className="collapse-content space-y-2">
            <select
              name="accident_history"
              className="w-full p-2 rounded-md bg-white border border-gray-300 text-base"
            >
              <option value="not specified">not specified</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-t">
        <button className="btn bg-blue-600 w-full border-none text-white">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
