'use client'
import { useState } from "react";

export default function StepOne({ nextStep, updateFormData }) {
  const [localData, setLocalData] = useState({ title: "", description: "", images: [] });


  // Handle Next Button Click
  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="bg-white rounded-lg w-full">
      <h2 className="text-xl font-bold mb-4">Step 1: Car Details</h2>
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="col-span-2 w-full ">
          <label className="block text-gray-700 mb-1">Title</label>
          <input
            type="text"
            placeholder="Enter title"
            className="border p-3 w-full rounded h-12 "
          />
        </div>
        <div className="col-span-2 w-full ">
          <label className="block text-gray-700 mb-1">Description</label>
          <input
            type="text"
            placeholder="Enter description"
            className="border p-3 w-full rounded h-12 "
          />
        </div>
        <div className="col-span-2 w-full ">
          <label className="block text-gray-700 mb-1">Upload images</label>
          <input
            type="file"
            placeholder="Enter description"
            className="text-base text-gray-500 file:mr-4 file:py-2 file:px-7 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 file:duration-300 border border-gray-300 p-1 w-auto rounded-md"
            />
        </div>
        <div>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>        </div>
      </div>
    </div>
  );
}
