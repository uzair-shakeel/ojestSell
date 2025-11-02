"use client";
import { useState } from "react";

export default function StepThree({ nextStep, prevStep, updateFormData, formData }) {
  const [localData, setLocalData] = useState({
    interior: formData.condition.interior,
    mechanical: formData.condition.mechanical,
    paintandBody: formData.condition.paintandBody,
    frameandUnderbody: formData.condition.frameandUnderbody,
    overall: formData.condition.overall,
  });

  const conditionOptions = ["Nowy", "Bardzo Dobry", "Dobry", "Normalny", "Zły"];

  const handleNext = () => {
    updateFormData({ condition: localData });
    nextStep();
  };

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Krok 4: Stan Auta</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Condition Interior */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Stan Wnętrza</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.interior}
            onChange={(e) => setLocalData({ ...localData, interior: e.target.value })}
          >
            <option value="">Wybierz Stan Wnętrza</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Mechanical */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Stan Mechaniczny</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.mechanical}
            onChange={(e) => setLocalData({ ...localData, mechanical: e.target.value })}
          >
            <option value="">Wybierz Stan Mechaniczny</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Paint & Body */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Stan Lakieru i Karoserii</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.paintandBody}
            onChange={(e) => setLocalData({ ...localData, paintandBody: e.target.value })}
          >
            <option value="">Select Condition</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Frame & Underbody */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Stan Ramy i Podwozia</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.frameandUnderbody}
            onChange={(e) => setLocalData({ ...localData, frameandUnderbody: e.target.value })}
          >
            <option value="">Select Condition</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Overall */}
        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">Stan Ogólny</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.overall}
            onChange={(e) => setLocalData({ ...localData, overall: e.target.value })}
          >
            <option value="">Select Condition</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
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