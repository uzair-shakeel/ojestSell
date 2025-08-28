"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { addCar } from "../../../../services/carService";
import StepFive from "../../../../components/dashboard/createsteps/StepFive";
import StepFour from "../../../../components/dashboard/createsteps/StepFour";
import StepThree from "../../../../components/dashboard/createsteps/StepThree";
import StepTwo from "../../../../components/dashboard/createsteps/StepTwo";
import StepOne from "../../../../components/dashboard/createsteps/StepOne";
import StepPhotoEnhancer from "../../../../components/dashboard/createsteps/StepPhotoEnhancer";
import { getUserById } from "../../../../services/userService";
import ImageEditStep from "../../../../components/dashboard/createsteps/ImageEditStep";

export default function MultiStepForm() {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(null);

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
      paintandBody: "",
      frameandUnderbody: "",
      overall: "",
    },

    // Step 4: Financial Information
    financialInfo: {
      sellOptions: [],
      invoiceOptions: [],
      sellerType: "private" as "private" | "company",
      priceNetto: "",
      priceWithVat: "",
    },
    // Step 5: Location
    location: {
      type: "Point",
      coordinates: [51.5074, -0.1278], // Default to London
    },
    createdBy: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(userId);
        setUser(userData);
        console.log(userData);
        setFormData({
          ...formData,
          location: userData.location,
          createdBy: userData.clerkUserId,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    if (userId) loadUser();
  }, [userId]);

  // Check for edited images when component mounts
  useEffect(() => {
    const editedImagePath = localStorage.getItem("editedImagePath");
    const editedImageTimestamp = localStorage.getItem("editedImageTimestamp");
    const editedImageIndex = localStorage.getItem("editedImageIndex");

    if (editedImagePath && editedImageTimestamp && editedImageIndex) {
      // Only process if the timestamp is recent (within the last minute)
      const currentTime = Date.now();
      const timestamp = parseInt(editedImageTimestamp);

      if (currentTime - timestamp < 60000) {
        // 60 seconds
        handleImageUpdate(editedImagePath, parseInt(editedImageIndex));

        // Clear the localStorage items after processing
        localStorage.removeItem("editedImagePath");
        localStorage.removeItem("editedImageTimestamp");
        localStorage.removeItem("editedImageIndex");
      }
    }
  }, []);

  // Function to handle image updates from the photo enhancer
  const handleImageUpdate = async (imagePath, index) => {
    try {
      // Create a new File object from the edited image URL
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const filename =
        imagePath.split("/").pop() || `edited-image-${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: "image/jpeg" });

      // Create a new array of images with the edited image replacing the original
      const updatedImages = [...formData.images];
      updatedImages[index] = file;

      // Create a new array of image previews with the edited image preview replacing the original
      const updatedPreviews = [...formData.imagePreviews];
      updatedPreviews[index] = imagePath;

      // Update form data with the new images and previews
      setFormData({
        ...formData,
        images: updatedImages,
        imagePreviews: updatedPreviews,
      });
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Failed to update the edited image. Please try again.");
    }
  };

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
    if (formData.images.length > 10)
      return "You can upload a maximum of 10 images.";
    if (!formData.make) return "Make is required.";
    if (!formData.model) return "Model is required.";
    if (!formData.type) return "Type is required.";
    if (!formData.financialInfo.sellOptions.length)
      return "At least one sell option is required.";
    if (!formData.financialInfo.invoiceOptions.length)
      return "At least one invoice option is required.";
    if (!formData.financialInfo.sellerType) return "Seller type is required.";
    if (!formData.financialInfo.priceNetto) return "Price Netto is required.";
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

    // Debug logging for images
    console.log("Images before submit:", formData.images);
    formData.images.forEach((img, idx) => {
      console.log(
        `Image ${idx}:`,
        img,
        img instanceof File ? "File" : typeof img
      );
    });

    try {
      const carData = {
        title: formData.title,
        description: formData.description,
        make: formData.make,
        model: formData.model,
        trim: formData.trim,
        type: formData.type,
        year: formData.year,
        color: formData.color,
        condition: formData.condition.interior ? "Used" : "New",
        mileage: formData.mileage,
        drivetrain: formData.drivetrain,
        transmission: formData.transmission,
        fuel: formData.fuel,
        engine: formData.engine,
        horsepower: formData.horsepower,
        accidentHistory: formData.accidentHistory,
        serviceHistory: formData.serviceHistory,
        vin: formData.vin,
        country: formData.country,
        carCondition: formData.condition,
        location: formData.location,
        financialInfo: {
          sellOptions: Array.isArray(formData.financialInfo.sellOptions)
            ? formData.financialInfo.sellOptions
            : [],
          invoiceOptions: Array.isArray(formData.financialInfo.invoiceOptions)
            ? formData.financialInfo.invoiceOptions
            : [],
          sellerType: formData.financialInfo.sellerType,
          priceNetto: parseFloat(formData.financialInfo.priceNetto),
        },
        images: formData.images,
      };

      const formDataToSend = new FormData();
      for (const key in carData) {
        if (key === "images") {
          carData[key].forEach((image: File) => {
            formDataToSend.append("images", image);
          });
        } else if (key === "location") {
          formDataToSend.append("location", JSON.stringify(carData[key]));
        } else if (key === "financialInfo") {
          for (const financialKey in carData[key]) {
            if (
              financialKey === "sellOptions" ||
              financialKey === "invoiceOptions"
            ) {
              // Append arrays as comma-separated strings or empty string if empty
              formDataToSend.append(
                `financialInfo[${financialKey}]`,
                Array.isArray(carData[key][financialKey])
                  ? carData[key][financialKey].join(",")
                  : ""
              );
            } else {
              formDataToSend.append(
                `financialInfo[${financialKey}]`,
                carData[key][financialKey] || ""
              );
            }
          }
        } else if (key === "carCondition") {
          for (const conditionKey in carData[key]) {
            formDataToSend.append(
              `carCondition[${conditionKey}]`,
              carData[key][conditionKey]
            );
          }
        } else {
          formDataToSend.append(key, carData[key]);
        }
      }

      await addCar(formDataToSend, getToken);
      alert("Car created successfully!");
      router.push("/dashboard/cars");
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
            // <StepPhotoEnhancer
            <ImageEditStep
              nextStep={nextStep}
              prevStep={prevStep}
              updateFormData={updateFormData}
              formData={formData}
            />
          )}
          {step === 3 && (
            <StepTwo
              nextStep={nextStep}
              prevStep={prevStep}
              updateFormData={updateFormData}
              formData={formData}
            />
          )}
          {step === 4 && (
            <StepThree
              nextStep={nextStep}
              prevStep={prevStep}
              updateFormData={updateFormData}
              formData={formData}
            />
          )}
          {step === 5 && (
            <StepFour
              nextStep={nextStep}
              prevStep={prevStep}
              updateFormData={updateFormData}
              formData={formData}
            />
          )}
          {step === 6 && (
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
