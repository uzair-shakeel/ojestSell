"use client";
import { useState, useEffect } from "react";

export default function StepTwo({ nextStep, prevStep, updateFormData }) {
  const [localData, setLocalData] = useState({
    make: "",
    model: "",
    trim: "",
    type: "",
    year: "",
    color: "",
    mileage: "",
    drivetrain: "",
    transmission: "",
    fuel: "",
    engine: "",
    horsepower: "",
    accidentHistory: "",
    serviceHistory: "",
    vin: "",
    country: "",
  });

  const [makes, setMakes] = useState([]); // State for car makes
  const [models, setModels] = useState([]); // State for car models
  const years = Array.from(
    new Array(50),
    (_, i) => new Date().getFullYear() - i
  );
  const engines = ["0.5", "1.0", "1.5", "2.0", "3.0", "4.0", "5.0", "7.3"];

  // Fetch car makes and models from the JSON file
  useEffect(() => {
    fetch("/data/carMakesModels.json")
      .then((response) => response.json())
      .then((data) => {
        const makes = Object.keys(data.makesAndModels); // Extract all car makes
        setMakes(makes); // Set the makes state
      })
      .catch((error) => {
        console.error("Error fetching car data:", error);
      });
  }, []);

  // Update models when a make is selected
  useEffect(() => {
    if (localData.make) {
      fetch("/data/carMakesModels.json")
        .then((response) => response.json())
        .then((data) => {
          const models = data.makesAndModels[localData.make]; // Get models for the selected make
          setModels(models || []); // Set the models state
        })
        .catch((error) => {
          console.error("Error fetching car data:", error);
        });
    } else {
      setModels([]); // Reset models if no make is selected
    }
  }, [localData.make]);

  const handleNext = () => {
    updateFormData(localData);
    nextStep();
  };

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Step 2: Car Details</h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Make */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Make</label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.make}
            onChange={(e) =>
              setLocalData({ ...localData, make: e.target.value, model: "" })
            }
          >
            <option value="">Select Make</option>
            {makes.map((make, index) => (
              <option key={index} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Model</label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.model}
            onChange={(e) =>
              setLocalData({ ...localData, model: e.target.value })
            }
            disabled={!localData.make} // Disable if no make is selected
          >
            <option value="">Select Model</option>
            {models.map((model, index) => (
              <option key={index} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Trim */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Trim</label>
          <input
            type="text"
            placeholder="Trim (Daraja Kroz, Normal, etc.)"
            className="border p-3 w-full rounded h-12 "
            value={localData.trim}
            onChange={(e) =>
              setLocalData({ ...localData, trim: e.target.value })
            }
          />
        </div>

        {/* Type */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Type</label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.type}
            onChange={(e) =>
              setLocalData({ ...localData, type: e.target.value })
            }
          >
            <option value="">Select Type</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Coupe">Coupe</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        {/* Year */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Year</label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.year}
            onChange={(e) =>
              setLocalData({ ...localData, year: e.target.value })
            }
          >
            <option value="">Select Year</option>
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* color */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Color</label>
          <input
            type="text"
            placeholder="Color"
            className="border p-3 w-full rounded h-12 "
            value={localData.color}
            onChange={(e) =>
              setLocalData({ ...localData, color: e.target.value })
            }
          />
        </div>

        {/* Mileage */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Mileage (KM)</label>
          <input
            type="number"
            placeholder="Mileage"
            className="border p-3 w-full rounded h-12 "
            value={localData.mileage}
            onChange={(e) =>
              setLocalData({ ...localData, mileage: e.target.value })
            }
          />
        </div>

        {/* Drivetrain */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Drivetrain</label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.drivetrain}
            onChange={(e) =>
              setLocalData({ ...localData, drivetrain: e.target.value })
            }
          >
            <option value="">Select Drivetrain</option>
            <option value="FWD">FWD</option>
            <option value="RWD">RWD</option>
            <option value="4X4">4X4</option>
          </select>
        </div>

        {/* Transmission */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Transmission</label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.transmission}
            onChange={(e) =>
              setLocalData({ ...localData, transmission: e.target.value })
            }
          >
            <option value="">Select Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>

        {/* Fuel */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Fuel Type</label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.fuel}
            onChange={(e) =>
              setLocalData({ ...localData, fuel: e.target.value })
            }
          >
            <option value="">Select Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
            <option value="LPG">LPG</option>
          </select>
        </div>

        {/* Horsepower */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Horsepower</label>
          <input
            type="number"
            placeholder="Horsepower"
            className="border p-3 w-full rounded h-12 "
            value={localData.horsepower}
            onChange={(e) =>
              setLocalData({ ...localData, horsepower: e.target.value })
            }
          />
        </div>

        {/* Engine Displacement */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">
            Engine Displacement
          </label>
          <input
            list="engines"
            type="number"
            placeholder="Engine Displacement"
            className="border p-3 w-full rounded h-12 "
            value={localData.engine}
            onChange={(e) =>
              setLocalData({ ...localData, engine: e.target.value })
            }
          />
          <datalist id="engines">
            {engines.map((engine, index) => (
              <option key={index} value={engine} />
            ))}
          </datalist>
        </div>
        {/* Service History */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Service History</label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.serviceHistory}
            onChange={(e) =>
              setLocalData({ ...localData, serviceHistory: e.target.value })
            }
          >
            <option value="">Select Service History</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* accidentHistory */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Accident History</label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.accidentHistory}
            onChange={(e) =>
              setLocalData({ ...localData, accidentHistory: e.target.value })
            }
          >
            <option value="">Select accidentHistory</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        {/* VIN */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">VIN</label>
          <input
            type="text"
            placeholder="VIN"
            className="border p-3 w-full rounded h-12 "
            value={localData.vin}
            onChange={(e) =>
              setLocalData({ ...localData, vin: e.target.value })
            }
          />
        </div>

        {/* Country of Origin */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Country of Origin</label>
           <input
            type="text"
            placeholder="Poland"
            className="border p-3 w-full rounded h-12 "
            value={localData.country}
            onChange={(e) =>
              setLocalData({ ...localData, country: e.target.value })
            }
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
