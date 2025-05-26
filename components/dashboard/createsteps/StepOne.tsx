"use client";
import { useState, useEffect } from "react";
import { getCarDetailsByVin } from "../../../services/carService";
import { useAuth } from "@clerk/nextjs";

export default function StepOne({ nextStep, updateFormData, formData }) {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [localData, setLocalData] = useState({
    title: formData.title || "",
    description: formData.description || "",
    images: formData.images || [],
    condition: formData.condition || "",
    vin: formData.vin || "",
    make: formData.make || "",
    model: formData.model || "",
    trim: formData.trim || "",
    type: formData.type || "",
    year: formData.year || "",
    color: formData.color || "",
    mileage: formData.mileage || "",
    drivetrain: formData.drivetrain || "",
    transmission: formData.transmission || "",
    fuel: formData.fuel || "",
    engine: formData.engine || "",
    horsepower: formData.horsepower || "",
    accidentHistory: formData.accidentHistory || "",
    serviceHistory: formData.serviceHistory || "",
    country: formData.country || "",
  });

  const [makes, setMakes] = useState<string[]>([]); // State for car makes
  const [models, setModels] = useState<string[]>([]); // State for car models
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
        const makes = Object.keys(data.makesAndModels);
        setMakes(makes);
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
          const models = data.makesAndModels[localData.make];
          setModels(models || []);
        })
        .catch((error) => {
          console.error("Error fetching car data:", error);
        });
    } else {
      setModels([]);
    }
  }, [localData.make]);

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
    if (!localData.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!localData.description.trim()) {
      alert("Description is required.");
      return;
    }
    if (!localData.condition) {
      alert("Condition is required.");
      return;
    }
    if (!localData.make) {
      alert("Make is required.");
      return;
    }
    if (!localData.model) {
      alert("Model is required.");
      return;
    }
    if (!localData.type) {
      alert("Type is required.");
      return;
    }
    updateFormData(localData);
    nextStep();
  };

  // VIN lookup function
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

      // Format the data to ensure we have strings
      const formattedDetails = {
        make: String(carDetails.make || ""),
        model: String(carDetails.model || ""),
        year: String(carDetails.year || ""),
        engine: String(carDetails.engine || ""),
        transmission: String(carDetails.transmission || ""),
        fuel: String(carDetails.fuel || ""),
        type: String(carDetails.bodyClass || carDetails.vehicleType || ""),
        color: String(carDetails.color || ""),
        horsepower: String(carDetails.horsepower || ""),
        drivetrain: String(carDetails.driveType || ""),
        vin: String(carDetails.vin || localData.vin),
      };

      // Generate title
      const title =
        `${formattedDetails.year} ${formattedDetails.make} ${formattedDetails.model}`.trim();

      // Generate description
      const descriptionParts = [];
      if (formattedDetails.year)
        descriptionParts.push(`Year: ${formattedDetails.year}`);
      if (formattedDetails.make)
        descriptionParts.push(`Make: ${formattedDetails.make}`);
      if (formattedDetails.model)
        descriptionParts.push(`Model: ${formattedDetails.model}`);
      if (formattedDetails.engine)
        descriptionParts.push(`Engine: ${formattedDetails.engine}`);
      if (formattedDetails.transmission)
        descriptionParts.push(`Transmission: ${formattedDetails.transmission}`);
      if (formattedDetails.fuel)
        descriptionParts.push(`Fuel Type: ${formattedDetails.fuel}`);
      if (formattedDetails.type)
        descriptionParts.push(`Body Type: ${formattedDetails.type}`);

      const description = descriptionParts.join("\n");

      // Update form data with formatted details
      setLocalData((prev) => ({
        ...prev,
        ...formattedDetails,
        title: title || prev.title,
        description: description || prev.description,
      }));

      // Show success message with the actual values
      const filledFields = Object.entries(formattedDetails)
        .filter(([_, value]) => value && value.trim() !== "")
        .map(
          ([key, value]) =>
            `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
        )
        .join("\n");

      alert(
        `Vehicle details found!\n\nFilled fields:\n${filledFields}\n\nPlease review and edit the information as needed.`
      );
    } catch (error: any) {
      console.error("Error fetching car details:", error);
      let errorMessage =
        "Failed to fetch car details. Please enter the details manually.";

      if (error.message?.includes("not found")) {
        errorMessage =
          "No vehicle found with this VIN. Please enter the details manually.";
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add New Car</h2>
      <div className="space-y-4">
        {/* VIN Input */}
        <div className="border-b pb-4 mb-4">
          <label className="block text-gray-700 mb-1">
            VIN (Vehicle Identification Number)
          </label>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter VIN to fill car details"
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
              {isLoading ? "Loading..." : "Fill Details"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter VIN to automatically fill car details or enter details
            manually below
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
          </div>

          {/* Title */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="Title"
              className="border p-3 w-full rounded h-12"
              value={localData.title}
              onChange={(e) =>
                setLocalData({ ...localData, title: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Description"
              className="border p-3 w-full rounded h-32"
              value={localData.description}
              onChange={(e) =>
                setLocalData({ ...localData, description: e.target.value })
              }
            />
          </div>

          {/* Images */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Images (Max 10)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="border p-3 w-full rounded"
              onChange={handleImageUpload}
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

          {/* Vehicle Details */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-3">Vehicle Details</h3>
          </div>

          {/* Make */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Make</label>
            <select
              className="border p-3 w-full rounded h-12"
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
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Model</label>
            <select
              className="border p-3 w-full rounded h-12"
              value={localData.model}
              onChange={(e) =>
                setLocalData({ ...localData, model: e.target.value })
              }
              disabled={!localData.make}
            >
              <option value="">Select Model</option>
              {models.map((model, index) => (
                <option key={index} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Type</label>
            <select
              className="border p-3 w-full rounded h-12"
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
              <option value="Van">Van</option>
              <option value="Wagon">Wagon</option>
              <option value="Convertible">Convertible</option>
              <option value="Hatchback">Hatchback</option>
            </select>
          </div>

          {/* Year */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Year</label>
            <select
              className="border p-3 w-full rounded h-12"
              value={localData.year}
              onChange={(e) =>
                setLocalData({ ...localData, year: e.target.value })
              }
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Condition</label>
            <select
              className="border p-3 w-full rounded h-12"
              value={localData.condition}
              onChange={(e) =>
                setLocalData({ ...localData, condition: e.target.value })
              }
            >
              <option value="">Select Condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </div>

          {/* Color */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Color</label>
            <input
              type="text"
              placeholder="Color"
              className="border p-3 w-full rounded h-12"
              value={localData.color}
              onChange={(e) =>
                setLocalData({ ...localData, color: e.target.value })
              }
            />
          </div>

          {/* Technical Details */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-3">Technical Details</h3>
          </div>

          {/* Engine */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">
              Engine Displacement
            </label>
            <input
              list="engines"
              type="text"
              placeholder="Engine Displacement"
              className="border p-3 w-full rounded h-12"
              value={localData.engine}
              onChange={(e) =>
                setLocalData({ ...localData, engine: e.target.value })
              }
            />
            <datalist id="engines">
              {engines.map((engine) => (
                <option key={engine} value={engine} />
              ))}
            </datalist>
          </div>

          {/* Horsepower */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Horsepower</label>
            <input
              type="number"
              placeholder="Horsepower"
              className="border p-3 w-full rounded h-12"
              value={localData.horsepower}
              onChange={(e) =>
                setLocalData({ ...localData, horsepower: e.target.value })
              }
            />
          </div>

          {/* Transmission */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Transmission</label>
            <select
              className="border p-3 w-full rounded h-12"
              value={localData.transmission}
              onChange={(e) =>
                setLocalData({ ...localData, transmission: e.target.value })
              }
            >
              <option value="">Select Transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Fuel Type</label>
            <select
              className="border p-3 w-full rounded h-12"
              value={localData.fuel}
              onChange={(e) =>
                setLocalData({ ...localData, fuel: e.target.value })
              }
            >
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Additional Details */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-3">Additional Details</h3>
          </div>

          {/* Mileage */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Mileage (KM)</label>
            <input
              type="number"
              placeholder="Mileage"
              className="border p-3 w-full rounded h-12"
              value={localData.mileage}
              onChange={(e) =>
                setLocalData({ ...localData, mileage: e.target.value })
              }
            />
          </div>

          {/* Country */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">
              Country of Origin
            </label>
            <input
              type="text"
              placeholder="Country"
              className="border p-3 w-full rounded h-12"
              value={localData.country}
              onChange={(e) =>
                setLocalData({ ...localData, country: e.target.value })
              }
            />
          </div>

          {/* Service History */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Service History</label>
            <select
              className="border p-3 w-full rounded h-12"
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

          {/* Accident History */}
          <div className="col-span-1">
            <label className="block text-gray-700 mb-1">Accident History</label>
            <select
              className="border p-3 w-full rounded h-12"
              value={localData.accidentHistory}
              onChange={(e) =>
                setLocalData({ ...localData, accidentHistory: e.target.value })
              }
            >
              <option value="">Select Accident History</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Button */}
      <div className="flex justify-end mt-6">
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
