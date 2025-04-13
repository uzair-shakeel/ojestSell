"use client";
import { useState } from "react";

export default function StepOne({ nextStep, updateFormData, formData }) {
  const [localData, setLocalData] = useState({
    title: formData.title,
    description: formData.description,
    images: formData.images,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length + localData.images.length > 10) {
        alert("You can upload a maximum of 10 images.");
        return;
      }
      setLocalData((prev) => ({
        ...prev,
        images: [...prev.images, ...selectedFiles],
      }));

      // Generate previews
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      updateFormData({
        images: [...formData.images, ...selectedFiles],
        imagePreviews: [...formData.imagePreviews, ...previews],
      });
    }
  };

  const removeImage = (index: number) => {
    setLocalData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    updateFormData({
      images: formData.images.filter((_, i) => i !== index),
      imagePreviews: formData.imagePreviews.filter((_, i) => i !== index),
    });
  };

  const handleNext = () => {
    if (!localData.title) {
      alert("Title is required.");
      return;
    }
    if (!localData.description) {
      alert("Description is required.");
      return;
    }
    if (localData.images.length === 0) {
      alert("At least 1 image is required.");
      return;
    }
    updateFormData(localData);
    nextStep();
  };

  return (
    <div className="bg-white rounded-lg w-full">
      <h2 className="text-xl font-bold mb-4">Step 1: Car Details</h2>
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="col-span-2 w-full">
          <label className="block text-gray-700 mb-1">Title</label>
          <input
            type="text"
            placeholder="Enter title"
            className="border p-3 w-full rounded h-12"
            value={localData.title}
            onChange={(e) => setLocalData({ ...localData, title: e.target.value })}
          />
        </div>
        <div className="col-span-2 w-full">
          <label className="block text-gray-700 mb-1">Description</label>
          <input
            type="text"
            placeholder="Enter description"
            className="border p-3 w-full rounded h-12"
            value={localData.description}
            onChange={(e) => setLocalData({ ...localData, description: e.target.value })}
          />
        </div>
        <div className="col-span-2 w-full">
          <label className="block text-gray-700 mb-1">Upload Images (1-10)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="text-base text-gray-500 file:mr-4 file:py-2 file:px-7 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 file:duration-300 border border-gray-300 p-1 w-auto rounded-md"
          />
          {formData.imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {formData.imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <button
            onClick={handleNext}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}