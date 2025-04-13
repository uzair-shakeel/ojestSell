"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { addCar } from "../../../../services/carService";
import StepFive from "../../../../components/dashboard/createsteps/StepFive";
import StepFour from "../../../../components/dashboard/createsteps/StepFour";
import StepThree from "../../../../components/dashboard/createsteps/StepThree";
import StepTwo from "../../../../components/dashboard/createsteps/StepTwo";
import StepOne from "../../../../components/dashboard/createsteps/StepOne";

export default function MultiStepForm() {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    images: [] as File[], // Store File objects
    title: "",
    description: "",
    imagePreviews: [] as string[], // For image previews

    // Step 2: Car Details
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

    // Step 3: Car Condition
    condition: {
      interior: "",
      mechanical: "",
      paintandBody: "", // Renamed from paint to match backend
      frameandUnderbody: "", // Renamed from frame to match backend
      overall: "",
    },

    // Step 4: Financial Information
    sellOptions: [] as string[], // ["Long term rental", "Lease", "Financing", "Cash"]
    invoiceOptions: [] as string[], // ["Invoice", "Invoice VAT", "Selling Agreement"]
    sellerType: "private" as "private" | "company", // "private" or "company"
    priceNetto: "",
    priceWithVat: "",

    // Step 5: Location
    location: { searchText: "", coordinates: { lat: 0, lng: 0 } },
  });

  const nextStep = () => {
    setDirection(1); // Move from right to left
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1); // Move from left to right
    setStep((prev) => prev - 1);
  };

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  // Validate form before submission
  const validateForm = () => {
    if (!formData.title) return "Title is required.";
    if (!formData.description) return "Description is required.";
    if (formData.images.length === 0) return "At least 1 image is required.";
    if (formData.images.length > 10) return "You can upload a maximum of 10 images.";
    if (!formData.make) return "Make is required.";
    if (!formData.model) return "Model is required.";
    if (!formData.type) return "Type is required.";
    if (!formData.sellOptions.length) return "At least one sell option is required.";
    if (!formData.invoiceOptions.length) return "At least one invoice option is required.";
    if (!formData.sellerType) return "Seller type is required.";
    if (!formData.priceNetto) return "Price Netto is required.";
    if (formData.location.coordinates.lat === 0 && formData.location.coordinates.lng === 0) {
      return "Please select a valid location.";
    }
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const carFormData = new FormData();
      carFormData.append("title", formData.title);
      carFormData.append("description", formData.description);
      carFormData.append("make", formData.make);
      carFormData.append("model", formData.model);
      carFormData.append("trim", formData.trim);
      carFormData.append("type", formData.type);
      carFormData.append("year", formData.year);
      carFormData.append("color", formData.color);
      carFormData.append("condition", formData.condition.interior ? "Used" : "New"); // Default condition based on interior
      carFormData.append("mileage", formData.mileage);
      carFormData.append("drivetrain", formData.drivetrain);
      carFormData.append("transmission", formData.transmission);
      carFormData.append("fuel", formData.fuel);
      carFormData.append("engine", formData.engine);
      carFormData.append("horsepower", formData.horsepower);
      carFormData.append("accidentHistory", formData.accidentHistory);
      carFormData.append("serviceHistory", formData.serviceHistory);
      carFormData.append("vin", formData.vin);
      carFormData.append("country", formData.country);
      carFormData.append("carCondition", JSON.stringify(formData.condition));
      carFormData.append(
        "financialInfo",
        JSON.stringify({
          sellOptions: formData.sellOptions,
          invoiceOptions: formData.invoiceOptions,
          sellerType: formData.sellerType,
          priceNetto: parseFloat(formData.priceNetto),
          priceWithVat: formData.priceWithVat ? parseFloat(formData.priceWithVat) : undefined,
        })
      );
      carFormData.append(
        "location",
        JSON.stringify([formData.location.coordinates.lng, formData.location.coordinates.lat])
      );
      formData.images.forEach((image) => carFormData.append("images", image));

      await addCar(carFormData, getToken);
      alert("Car created successfully!");
      router.push("/cars"); // Redirect to cars page
    } catch (err) {
      setError(err.message || "Failed to create car. Please try again.");
      console.error("Error creating car:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-5 overflow-hidden h-auto border border-gray-200 shadow-md rounded-lg">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 100 * direction }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative"
        >
          {step === 1 && (
            <StepOne
              nextStep={nextStep}
              updateFormData={updateFormData}
              formData={formData}
            />
          )}
          {step === 2 && (
            <StepTwo
              nextStep={nextStep}
              prevStep={prevStep}
              updateFormData={updateFormData}
              formData={formData}
            />
          )}
          {step === 3 && (
            <StepThree
              nextStep={nextStep}
              prevStep={prevStep}
              updateFormData={updateFormData}
              formData={formData}
            />
          )}
          {step === 4 && (
            <StepFour
              nextStep={nextStep}
              prevStep={prevStep}
              updateFormData={updateFormData}
              formData={formData}
            />
          )}
          {step === 5 && (
            <StepFive
              prevStep={prevStep}
              handleSubmit={handleSubmit}
              formData={formData}
              updateFormData={updateFormData}
              loading={loading}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}