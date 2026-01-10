"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import CustomMap from "../GoogleMapComponent";
import {
  FaMapMarkerAlt,
  FaChevronDown,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function StepOne({ nextStep, prevStep, updateFormData, formData, makesModelsData }) {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);
  const [localData, setLocalData] = useState({
    title: formData.title || "",
    description: formData.description || "",
    images: formData.images || [],
    vin: formData.vin || "", // Still store VIN but don't show lookup here
    make: formData.make || "",
    model: formData.model || "",
    location: formData.location || {
      type: "Point",
      coordinates: [51.5074, -0.1278], // Default to London
    },
  });

  // State for car models
  const [models, setModels] = useState<string[]>([]);
  const makes = makesModelsData?.getMakes() || [];

  useEffect(() => {
    if (localData.make && makesModelsData) {
      let modelsList = makesModelsData.getModelsForMake(localData.make) || [];
      if (localData.model && !modelsList.includes(localData.model)) {
        modelsList = [...modelsList, localData.model];
      }
      setModels(modelsList);
    } else {
      setModels([]);
    }
  }, [localData.make, localData.model, makesModelsData]);

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

  const handleNext = () => {
    if (!localData.title.trim()) {
      alert("Tytuł jest wymagany.");
      return;
    }
    if (!localData.title.trim()) {
      alert("Tytuł jest wymagany.");
      return;
    }
    // Description check removed
    if (!localData.make) {
      alert("Marka jest wymagana.");
      return;
    }
    if (!localData.model) {
      alert("Model jest wymagany.");
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
      <h2 className="text-xl font-bold mb-4">Krok 2: Podstawowe Informacje</h2>
      <div className="grid grid-cols-2 gap-6 w-full">

        {/* Title */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">Tytuł Ogłoszenia</label>
          <input
            type="text"
            placeholder="Np. BMW M5 F90 Competition 2021"
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold"
            value={localData.title}
            onChange={(e) =>
              setLocalData({ ...localData, title: e.target.value })
            }
          />
        </div>

        {/* Make & Model Section - Read Only if VIN exists, else Selects */}
        {formData.vin ? (
          <div className="col-span-2">
            <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                DANE ZWERYFIKOWANE Z VIN
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Marka</label>
                  <p className="text-lg font-bold text-gray-900">{localData.make}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Model</label>
                  <p className="text-lg font-bold text-gray-900">{localData.model}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rok</label>
                  <p className="text-lg font-bold text-gray-900">{formData.year || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nadwozie</label>
                  <p className="text-lg font-bold text-gray-900">{formData.type || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paliwo</label>
                  <p className="text-lg font-bold text-gray-900">{formData.fuel || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Skrzynia</label>
                  <p className="text-lg font-bold text-gray-900">{formData.transmission || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Silnik</label>
                  <p className="text-lg font-bold text-gray-900">{formData.engine || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Moc</label>
                  <p className="text-lg font-bold text-gray-900">{formData.horsepower ? `${formData.horsepower} KM` : "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Napęd</label>
                  <p className="text-lg font-bold text-gray-900">{formData.drivetrain || "—"}</p>
                </div>
              </div>
              <p className="text-xs text-blue-600/60 mt-4 font-medium">
                Te dane zostały pobrane automatycznie i nie mogą być edytowane.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Make */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">Marka</label>
              <select
                className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold"
                value={localData.make}
                onChange={(e) =>
                  setLocalData({ ...localData, make: e.target.value, model: "" })
                }
                disabled={makesModelsData?.loading}
              >
                <option value="">Wybierz Markę</option>
                {makes.map((make, index) => (
                  <option key={index} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">Model</label>
              <select
                className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold"
                value={localData.model}
                onChange={(e) =>
                  setLocalData({ ...localData, model: e.target.value })
                }
                disabled={makesModelsData?.loading || !localData.make}
              >
                <option value="">Wybierz Model</option>
                {models.map((model, index) => (
                  <option key={index} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Map Location Section */}
        <div className="col-span-2">
          <div className="border-2 border-gray-50 rounded-2xl overflow-hidden shadow-sm">
            <div
              className="flex items-center justify-between bg-gray-50 p-5 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setShowMap(!showMap)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-xl">
                  <FaMapMarkerAlt className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Lokalizacja Pojazdu</h3>
                  <p className="text-sm text-gray-500 font-medium">Ustaw gdzie można obejrzeć auto</p>
                </div>
              </div>
              <div className={`transition-transform duration-300 ${showMap ? "rotate-180" : ""}`}>
                <FaChevronDown className="text-gray-400" />
              </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showMap ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="p-4 bg-white">
                <CustomMap
                  location={localData.location}
                  setLocation={handleLocationChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="col-span-2 flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
          <button
            onClick={prevStep}
            className="text-gray-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all font-bold"
          >
            Wstecz
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white font-bold px-12 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Następny Krok
          </button>
        </div>
      </div>
    </div>
  );
}
