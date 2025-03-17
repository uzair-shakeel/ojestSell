'use client'
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepFive from "../../../../components/dashboard/createsteps/StepFive"
import StepFour from "../../../../components/dashboard/createsteps/StepFour";
import StepThree from "../../../../components/dashboard/createsteps/StepThree";
import StepTwo from "../../../../components/dashboard/createsteps/StepTwo";
import StepOne from "../../../../components/dashboard/createsteps/StepOne";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    images: [],
    title: "",
    description: "",

    // Step 2: Car Details
    make: "",
    model: "",
    trim: "",
    type: "",
    year: "",
    condition: "",
    mileage: "",
    drivetrain: "",
    transmission: "",
    fuel: "",
    engine: "",
    horsepower: "",
    accident: "",
    serviceHistory: "",
    vin: "",
    registered: "",

    // Step 3: Car Condition
    condition: {
      interior: "",
      mechanical: "",
      paint: "",
      frame: "",
      overall: "",
    },

    // Step 4: Financial Information
    sellOptions: [], // ["Long term rental", "Lease", "Financing", "Cash"]
    invoiceOptions: [], // ["Invoice", "Invoice VAT", "Selling Agreement"]
    sellerType: "private", // "private" or "company"
    priceNetto: "",
    priceWithVat: "",
  });

  const nextStep = () => {
    setDirection(1); // Move from right to left
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1); // Move from left to right
    setStep((prev) => prev - 1);
  };

  const updateFormData = (newData) => setFormData((prev) => ({ ...prev, ...newData }));

  const handleSubmit = () => {
    console.log("Final Form Data:", formData);
    // Submit to backend
  };

  return (
    <div className="max-w-5xl mx-auto p-5 overflow-hidden h-auto border border-gray-200 shadow-md rounded-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 100 * direction }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative"
        >
          {step === 1 && <StepOne nextStep={nextStep} updateFormData={updateFormData} />}
          {step === 2 && <StepTwo nextStep={nextStep} prevStep={prevStep} updateFormData={updateFormData} />}
          {step === 3 && <StepThree nextStep={nextStep} prevStep={prevStep} updateFormData={updateFormData} />}
          {step === 4 && <StepFour nextStep={nextStep} prevStep={prevStep} updateFormData={updateFormData} />}
          {step === 5 && <StepFive prevStep={prevStep} handleSubmit={handleSubmit} formData={formData} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
