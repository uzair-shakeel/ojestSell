'use client'
import { useState } from "react";

export default function StepOne({ nextStep, updateFormData }) {
  const [localData, setLocalData] = useState({ title: "", description: "", images: [] });

  // Handle file selection
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (localData.images.length + files.length > 5) {
      alert("You can upload a maximum of 5 images.");
      return;
    }

    const newImages = files.map((file) => ({
      id: URL.createObjectURL(file), // Temporary URL for preview
      file,
    }));

    setLocalData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  // Remove an image
  const handleRemoveImage = (id) => {
    setLocalData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  // Handle Next Button Click
  const handleNext = () => {
    // if (!localData.title.trim() || !localData.description.trim()) {
    //   alert("Please fill in all fields.");
    //   return;
    // }

    // if (localData.images.length < 1) {
    //   alert("Please add at least one image.");
    //   return;
    // }

    updateFormData({
      title: localData.title,
      description: localData.description,
      // images: localData.images.map((img) => img.file), // Store only the file for backend upload
    });

    nextStep();
  };

  return (
    <div className="bg-white max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Step 1: Basic Information</h2>

      {/* Title Input */}
      <p className="text-gray-700  mb-2">Title</p>
      <input
        type="text"
        placeholder="Car Title"
        className="border p-2 w-full rounded mb-3"
        value={localData.title}
        onChange={(e) => setLocalData({ ...localData, title: e.target.value })}
      />

      {/* Description Input */}
      <p className="text-gray-700  mb-2">Description</p>
      <textarea
        placeholder="Car Description"
        className="border p-2 w-full rounded mb-3"
        value={localData.description}
        onChange={(e) => setLocalData({ ...localData, description: e.target.value })}
      ></textarea>

      {/* Image Upload */}
      <label className="block text-gray-700 mb-2">Upload Images (Max 5)</label>
      <input
        type="file"
        accept="image/*"
        multiple
        className="block text-base text-gray-500 file:mr-4 file:py-2 file:px-7 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 file:duration-300 border border-gray-300 p-1 w-auto rounded-md"
        onChange={handleImageUpload}
      />

      {/* Image Preview */}
      {/* {localData.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {localData.images.map((img) => (
            <div key={img.id} className="relative w-24 h-24 border rounded overflow-hidden">
              <img src={img.id} alt="Uploaded" className="w-full h-full object-cover" />
              <button
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                onClick={() => handleRemoveImage(img.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )} */}

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Next
      </button>
    </div>
  );
}
