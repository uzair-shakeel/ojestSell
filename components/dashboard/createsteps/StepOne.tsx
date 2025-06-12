"use client";
import { useState } from "react";
import { getCarDetailsByVin } from "../../../services/carService";
import { useAuth } from "@clerk/nextjs";
import CustomMap from "../GoogleMapComponent";
import { FaMapMarkerAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function StepOne({ nextStep, updateFormData, formData }) {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [localData, setLocalData] = useState({
    title: formData.title || "",
    description: formData.description || "",
    images: formData.images || [],
    vin: formData.vin || "",
    location: formData.location || {
      type: "Point",
      coordinates: [51.5074, -0.1278], // Default to London
    },
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
        ...formData,
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
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
      imagePreviews: formData.imagePreviews.filter((_, i) => i !== index),
    });
  };

  // Handle location change
  const handleLocationChange = (newLocation) => {
    setLocalData((prev) => ({
      ...prev,
      location: newLocation,
    }));

    updateFormData({
      ...formData,
      location: newLocation,
    });
  };

  const handleVinLookup = async () => {
    if (!localData.vin || localData.vin.length < 17) {
      alert("Please enter a valid VIN (17 characters)");
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Attempting VIN lookup for: ${localData.vin}`);

      const carDetails = await getCarDetailsByVin(localData.vin, getToken);
      console.log("VIN lookup response:", carDetails);

      // Generate a detailed title
      const title = `${carDetails.year} ${carDetails.make} ${
        carDetails.model
      } ${carDetails.trim || ""}`.trim();

      // Generate a comprehensive description
      const descriptionParts = [];
      if (carDetails.year) descriptionParts.push(`Year: ${carDetails.year}`);
      if (carDetails.make) descriptionParts.push(`Make: ${carDetails.make}`);
      if (carDetails.model) descriptionParts.push(`Model: ${carDetails.model}`);
      if (carDetails.trim) descriptionParts.push(`Trim: ${carDetails.trim}`);
      if (carDetails.engineDetails)
        descriptionParts.push(`Engine: ${carDetails.engineDetails}`);
      if (carDetails.transmission)
        descriptionParts.push(`Transmission: ${carDetails.transmission}`);
      if (carDetails.fuel)
        descriptionParts.push(`Fuel Type: ${carDetails.fuel}`);
      if (carDetails.driveType)
        descriptionParts.push(`Drive Type: ${carDetails.driveType}`);
      if (carDetails.bodyClass)
        descriptionParts.push(`Body Type: ${carDetails.bodyClass}`);
      if (carDetails.horsepower)
        descriptionParts.push(`Horsepower: ${carDetails.horsepower} HP`);

      const description = descriptionParts.join("\n");

      // Update form data with car details
      const updatedData = {
        ...localData,
        title,
        description,
        vin: carDetails.vin,
      };

      // Update local state
      setLocalData(updatedData);

      // Update parent form data with all car details for Step Two
      updateFormData({
        ...formData,
        ...updatedData,
        make: carDetails.make,
        model: carDetails.model,
        trim: carDetails.trim,
        type: carDetails.bodyClass,
        year: carDetails.year,
        fuel: carDetails.fuel,
        transmission: carDetails.transmission,
        drivetrain:
          carDetails.driveType === "All wheel drive"
            ? "AWD"
            : carDetails.driveType,
        engine: carDetails.engine,
        horsepower: carDetails.horsepower,
        country: carDetails.country,
      });

      // Show success message
      alert(
        `Car details found!\n\nTitle and description have been generated based on:\n${descriptionParts.join(
          "\n"
        )}\n\nYou can edit these details if needed.`
      );
    } catch (error: any) {
      console.error("Error fetching car details:", error);
      let errorMessage =
        "Failed to fetch car details. Please enter the details manually.";
      let details = "";

      if (error.response?.data?.details) {
        details = `\n\nDetails: ${error.response.data.details}`;
      }

      if (error.message?.includes("VIN validation failed")) {
        errorMessage = "The VIN number appears to be invalid.";
      } else if (error.message?.includes("404")) {
        errorMessage = "No vehicle found with this VIN.";
      } else if (error.message?.includes("Network Error")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      alert(errorMessage + details);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!localData.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!localData.description.trim()) {
      alert("Description is required.");
      return;
    }
    updateFormData({
      ...formData,
      ...localData,
    });
    nextStep();
  };

  return (
    <div className="bg-white rounded-lg w-full">
      <h2 className="text-xl font-bold mb-4">Step 1: Basic Information</h2>
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* VIN Input */}
        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">
            VIN (Vehicle Identification Number)
          </label>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter VIN to auto-fill all car details"
              className="border p-3 w-full rounded-l h-12"
              value={localData.vin}
              onChange={(e) =>
                setLocalData({
                  ...localData,
                  vin: e.target.value.toUpperCase(),
                })
              }
              maxLength={17}
            />
            <button
              type="button"
              onClick={handleVinLookup}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 rounded-r h-12 hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
              {isLoading ? "Loading..." : "Lookup"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter VIN to automatically fill all car details or enter manually
            below
          </p>
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">Title</label>
          <input
            type="text"
            placeholder="Enter title"
            className="border p-3 w-full rounded h-12"
            value={localData.title}
            onChange={(e) =>
              setLocalData({ ...localData, title: e.target.value })
            }
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Enter description"
            className="border p-3 w-full rounded h-32"
            value={localData.description}
            onChange={(e) =>
              setLocalData({ ...localData, description: e.target.value })
            }
          />
        </div>

        {/* Map Location Section - Collapsible */}
        <div className="col-span-2">
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Dropdown Header */}
            <div
              className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => setShowMap(!showMap)}
            >
              <div className="flex items-center">
                <div className="bg-blue-500 p-2 rounded-full mr-3">
                  <FaMapMarkerAlt className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Car Location</h3>
                  <p className="text-xs text-gray-500">
                    Set the location where the car is available
                  </p>
                </div>
              </div>
              <div
                className={`transition-transform duration-300 ${
                  showMap ? "rotate-180" : ""
                }`}
              >
                <FaChevronDown className="text-gray-500" />
              </div>
            </div>

            {/* Dropdown Content */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                showMap ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="text-sm text-gray-600 mb-3">
                  Click on the map or use the search box to set the car's
                  location
                </div>
                <CustomMap
                  location={localData.location}
                  setLocation={handleLocationChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">
            Upload Images (1-10)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="text-base text-gray-500 file:mr-4 file:py-2 file:px-7 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 file:duration-300 border border-gray-300 p-1 w-auto rounded-md"
          />
          {formData.imagePreviews?.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-2">
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

        <div className="col-span-2">
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
