'use client'
import { useState } from "react";

export default function StepThree({ nextStep, prevStep, updateFormData }) {
  const [localData, setLocalData] = useState({
    interior: "",
    mechanical: "",
    paint: "",
    frame: "",
    overall: "",
  });

  const conditionOptions = ["New", "Very Good", "Good", "Normal", "Bad"];

  const handleNext = () => {
    updateFormData({ condition: localData });
    nextStep();
  };

  return (
    <div className="bg-white  rounded-lg">
      <h2 className="text-xl font-bold mb-4">Step 3: Car Condition</h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Condition Interior */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Interior Condition </label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.interior}
            onChange={(e) => setLocalData({ ...localData, interior: e.target.value })}
          >
            <option value="">Select Condition</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Condition Mechanical */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Mechanical Condition </label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.mechanical}
            onChange={(e) => setLocalData({ ...localData, mechanical: e.target.value })}
          >
            <option value="">Select Condition</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Condition Paint & Body */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Paint and Body Condition </label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.paint}
            onChange={(e) => setLocalData({ ...localData, paint: e.target.value })}
          >
            <option value="">Select Condition</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Condition Frame & Underbody */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Frame and Underbody Condition </label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.frame}
            onChange={(e) => setLocalData({ ...localData, frame: e.target.value })}
          >
            <option value="">Select Condition</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Condition Overall */}
        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">Overall Condition </label>
          <select
            className="border p-3 w-full rounded h-12 "
            value={localData.overall}
            onChange={(e) => setLocalData({ ...localData, overall: e.target.value })}
          >
            <option value="">Select Condition</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
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
