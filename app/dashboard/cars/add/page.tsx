"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { addCar } from "../../../../services/carService";
import { getUserById } from "../../../../services/userService";
import WizardLayout from "../../../../components/dashboard/wizard/WizardLayout";

// Step Components
import Step01_Start from "../../../../components/dashboard/wizard/steps/Step01_Start";
import Step02_VINDecode from "../../../../components/dashboard/wizard/steps/Step02_VINDecode";
import Step03_RequiredBasics from "../../../../components/dashboard/wizard/steps/Step03_RequiredBasics";
import Step04_Condition from "../../../../components/dashboard/wizard/steps/Step04_Condition";
import Step05_Equipment from "../../../../components/dashboard/wizard/steps/Step05_Equipment";
import Step06_ModsExtras from "../../../../components/dashboard/wizard/steps/Step06_ModsExtras";
import Step08_Warranty from "../../../../components/dashboard/wizard/steps/Step08_Warranty";
import Step09_SellerNotes from "../../../../components/dashboard/wizard/steps/Step09_SellerNotes";
import Step10_History from "../../../../components/dashboard/wizard/steps/Step10_History";
import Step11_AIPreview from "../../../../components/dashboard/wizard/steps/Step11_AIPreview";
import Step12_Publish from "../../../../components/dashboard/wizard/steps/Step12_Publish";

export default function NewCarListingWizard() {
  const { getToken, userId } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    images: [],
    imagePreviews: [],
    conditionType: "", // New/Used/Nearly-new
    fuel: "",
    vin: "",
    // ... other fields will be added dynamically
    equipment: [],
    modifications: [],
    extras: [],
    currency: "PLN",
    sellerType: "Private",
    registrationStatus: "",
    // Default location (should be fetched from user profile)
    location: {
      type: "Point",
      coordinates: [52.2297, 21.0122] // Warsaw default
    }
  });

  // Load user location
  useEffect(() => {
    if (userId) {
      getUserById(userId, getToken).then(user => {
        if (user?.location) {
          setFormData(prev => ({ ...prev, location: user.location, createdBy: user.clerkUserId }));
        }
      }).catch(err => console.error("Failed to load user location", err));
    }
  }, [userId, getToken]);

  const updateFormData = (newData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 11));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Construct standard car object
      const title = `${formData.year} ${formData.make} ${formData.model} ${formData.trim || ''}`.trim();

      // Map condition type to backend enum
      const condition = formData.conditionType === "New" ? "New" : "Used";

      // Construct payload
      const formDataToSend = new FormData();

      // Basic fields
      formDataToSend.append("title", title);
      formDataToSend.append("description", formData.generatedListing || formData.description || "No description provided.");
      formDataToSend.append("make", formData.make);
      formDataToSend.append("model", formData.model);
      if (formData.trim) formDataToSend.append("trim", formData.trim);
      formDataToSend.append("type", formData.type || "Other");
      formDataToSend.append("year", formData.year);
      if (formData.color) formDataToSend.append("color", formData.color);
      formDataToSend.append("condition", condition);
      formDataToSend.append("mileage", formData.mileage);
      if (formData.engine) formDataToSend.append("engine", formData.engine);
      if (formData.transmission) formDataToSend.append("transmission", formData.transmission);
      if (formData.drivetrain) formDataToSend.append("drivetrain", formData.drivetrain);
      formDataToSend.append("fuel", formData.fuel);
      if (formData.vin) formDataToSend.append("vin", formData.vin);
      if (formData.isFeatured) formDataToSend.append("isFeatured", "true");

      // Images
      formData.images.forEach((file: File) => {
        formDataToSend.append("images", file);
      });

      // Use location from form or user default
      formDataToSend.append("location", JSON.stringify(formData.location));

      // Financial Info
      const financialInfo = {
        sellOptions: ["Cash"], // Default
        invoiceOptions: [formData.saleDocument],
        sellerType: formData.sellerType.toLowerCase(),
        priceNetto: Number(formData.price),
        currency: formData.currency
      };
      // Flatten financial info for FormData
      Object.keys(financialInfo).forEach(key => {
        if (Array.isArray(financialInfo[key])) {
          financialInfo[key].forEach((val: string) => formDataToSend.append(`financialInfo[${key}][]`, val));
        } else {
          formDataToSend.append(`financialInfo[${key}]`, financialInfo[key]);
        }
      });

      // Car Condition details
      if (formData.accidentHistory) formDataToSend.append("accidentHistory", formData.accidentHistory.includes("No") ? "No" : "Yes");
      if (formData.serviceHistory) formDataToSend.append("serviceHistory", formData.serviceHistory.includes("Full") ? "Yes" : "No");

      // Rich Data Fields (Arrays)
      if (formData.equipment && Array.isArray(formData.equipment)) {
        formData.equipment.forEach((item: string) => formDataToSend.append("equipment[]", item));
      }
      if (formData.modifications && Array.isArray(formData.modifications)) {
        formData.modifications.forEach((item: string) => formDataToSend.append("modifications[]", item));
      }
      if (formData.extras && Array.isArray(formData.extras)) {
        formData.extras.forEach((item: string) => formDataToSend.append("extras[]", item));
      }

      // Complex Objects (JSON Strings)
      if (formData.warranty) {
        formDataToSend.append("warrantyDetails", JSON.stringify(formData.warranty));
      }

      // Detailed Condition Reports
      const conditionDetails = {
        accidentHistory: formData.accidentHistory,
        serviceHistory: formData.serviceHistory,
        ownership: formData.ownership,
        storage: formData.storage,
        knownIssues: formData.knownIssues,
        visibleFlaws: formData.visibleFlaws
      };
      formDataToSend.append("conditionDetails", JSON.stringify(conditionDetails));

      // History Status
      if (formData.historyReportStatus) {
        formDataToSend.append("historyReportStatus", formData.historyReportStatus);
      }

      await addCar(formDataToSend, getToken);

      // Show success
      router.push("/dashboard/cars?success=true");

    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to publish listing. Please check required fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAIMessage = (step: number) => {
    switch (step) {
      case 1: return "Hi! I'm your AI assistant. Let's start by uploading some photos. I can detect details from them to save you time.";
      case 2: return "I've analyzed the VIN. Please verify these details are correct.";
      case 3: return "Great. Now let's confirm the key selling points: Price and Mileage.";
      case 4: return "Transparency is key. Being honest about condition builds trust with buyers.";
      case 5: return "Select all the features this car has. More features often mean a higher value!";
      case 6: return "Any special modifications? These make your car unique.";
      case 7: return "Warranty adds significant value. Do you have one tailored for this car?";
      case 8: return "Vehicle history reports are highly requested by buyers.";
      case 9: return "Anything else I should know? Your notes help me write a compelling description.";
      case 10: return "I'm writing your listing description now based on everything you told me. Watch this!";
      case 11: return "Everything looks ready! Click Publish to go live.";
      default: return "";
    }
  };

  return (
    <WizardLayout
      currentStep={step}
      totalSteps={11}
      aiMessage={getAIMessage(step)}
    >
      {step === 1 && <Step01_Start formData={formData} updateFormData={updateFormData} nextStep={nextStep} />}
      {step === 2 && <Step02_VINDecode formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <Step03_RequiredBasics formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 4 && <Step04_Condition formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 5 && <Step05_Equipment formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 6 && <Step06_ModsExtras formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 7 && <Step08_Warranty formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 8 && <Step10_History formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 9 && <Step09_SellerNotes formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 10 && <Step11_AIPreview formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 11 && <Step12_Publish formData={formData} updateFormData={updateFormData} prevStep={prevStep} handleSubmit={handleSubmit} loading={loading} />}
    </WizardLayout>
  );
}
