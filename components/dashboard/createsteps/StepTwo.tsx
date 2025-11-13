"use client";
import { useState, useEffect, useRef } from "react";
import { getCarDetailsByVin } from "../../../services/carService";
import { useAuth } from "../../../lib/auth/AuthContext";
import {
  MdBrightness6,
  MdContrast,
  MdCrop,
  MdAutoFixHigh,
  MdBlurOn,
} from "react-icons/md";

export default function StepTwo({
  nextStep,
  prevStep,
  updateFormData,
  formData,
  makesModelsData,
}) {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localData, setLocalData] = useState({
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
    vin: formData.vin || "",
    country: formData.country || "",
  });

  const [models, setModels] = useState<string[]>([]); // State for car models
  const currentYear = new Date().getFullYear();
  const startYear = 1900;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );
  const engines = ["0.5", "1.0", "1.5", "2.0", "3.0", "4.0", "5.0", "7.3"];
  const colors = [
    "Beżowy",
    "Biały",
    "Bordowy",
    "Brązowy",
    "Czarny",
    "Czerwony",
    "Fioletowy",
    "Granatowy",
    "Niebieski",
    "Pomarańczowy",
    "Srebrny",
    "Szary",
    "Zielony",
    "Złoty",
    "Żółty",
  ];
  const countries = [
    "Poland",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "United Kingdom",
    "United States",
    "Canada",
    "Japan",
    "South Korea",
    "China",
    "Czech Republic",
    "Slovakia",
    "Sweden",
    "Norway",
    "Netherlands",
    "Belgium",
    "Austria",
    "Switzerland",
    "Denmark",
    "Portugal",
    "Greece",
    "Turkey",
    "Ukraine",
    "Russia",
    "Romania",
    "Hungary",
    "Bulgaria",
    "Croatia",
    "Serbia",
    "Slovenia",
    "Lithuania",
    "Latvia",
    "Estonia",
    "Finland",
    "Ireland",
    "Iceland",
    "Australia",
    "New Zealand",
    "Mexico",
    "Brazil",
    "Argentina",
    "South Africa",
    "India",
    "Thailand",
    "Malaysia",
    "Indonesia",
    "United Arab Emirates",
    "Saudi Arabia",
    "Israel",
    "Egypt",
    "Morocco",
    "Tunisia",
  ];

  // Map English country names to Polish display labels
  const countryLabels: Record<string, string> = {
    Poland: "Polska",
    Germany: "Niemcy",
    France: "Francja",
    Italy: "Włochy",
    Sweden: "Szwecja",
    "United Kingdom": "Wielka Brytania",
    China: "Chiny",
    "South Korea": "Korea Południowa",
    Japan: "Japonia",
    Russia: "Rosja",
    "Czech Republic": "Czechy",
    Netherlands: "Holandia",
    Spain: "Hiszpania",
    Canada: "Kanada",
    Norway: "Norwegia",
    Austria: "Austria",
    Switzerland: "Szwajcaria",
    Denmark: "Dania",
    Portugal: "Portugalia",
    Greece: "Grecja",
    Turkey: "Turcja",
    Ukraine: "Ukraina",
    Romania: "Rumunia",
    Hungary: "Węgry",
    Bulgaria: "Bułgaria",
    Croatia: "Chorwacja",
    Serbia: "Serbia",
    Slovenia: "Słowenia",
    Lithuania: "Litwa",
    Latvia: "Łotwa",
    Estonia: "Estonia",
    Finland: "Finlandia",
    Ireland: "Irlandia",
    Iceland: "Islandia",
    Australia: "Australia",
    "New Zealand": "Nowa Zelandia",
    Mexico: "Meksyk",
    Brazil: "Brazylia",
    Argentina: "Argentyna",
    "South Africa": "Republika Południowej Afryki",
    India: "Indie",
    Thailand: "Tajlandia",
    Malaysia: "Malezja",
    Indonesia: "Indonezja",
    "United Arab Emirates": "Zjednoczone Emiraty Arabskie",
    "Saudi Arabia": "Arabia Saudyjska",
    Israel: "Izrael",
    Egypt: "Egipt",
    Morocco: "Maroko",
    Tunisia: "Tunezja",
    "United States": "USA",
  };

  const colorSelectedValue = colors.includes(localData.color)
    ? localData.color
    : localData.color
    ? "__OTHER__"
    : "";

  // Get makes from the hook data
  const makes = makesModelsData?.getMakes() || [];

  // Update models when a make is selected
  useEffect(() => {
    if (localData.make && makesModelsData) {
      let modelsList = makesModelsData.getModelsForMake(localData.make) || [];

      // If we have a model from VIN lookup that's not in the list, add it
      if (localData.model && !modelsList.includes(localData.model)) {
        modelsList = [...modelsList, localData.model];
      }

      setModels(modelsList);
    } else {
      setModels([]); // Reset models if no make is selected
    }
  }, [localData.make, localData.model, makesModelsData]);

  const handleNext = () => {
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

  // Add VIN lookup function
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

      // Create updated data object with all the fetched details
      const updatedData = {
        ...localData,
        make: carDetails.make || localData.make,
        model: carDetails.model || localData.model,
        year: carDetails.year || localData.year,
        engine: carDetails.engine || localData.engine,
        fuel: carDetails.fuel || localData.fuel,
        transmission: carDetails.transmission || localData.transmission,
        drivetrain: carDetails.driveType || localData.drivetrain,
        type: carDetails.bodyClass || localData.type,
        horsepower: carDetails.horsepower || localData.horsepower,
      };

      // Update local state
      setLocalData(updatedData);

      // Update parent form data
      updateFormData(updatedData);

      // Show success message with details of what was found
      const foundFields = Object.entries(carDetails)
        .filter(([_, value]) => value && value !== "")
        .map(([key, value]) => {
          // Format the field name for display
          const formattedKey =
            key.charAt(0).toUpperCase() +
            key
              .slice(1)
              .replace(/([A-Z])/g, " $1")
              .trim();
          return `${formattedKey}: ${value}`;
        });

      let message = "";
      if (foundFields.length > 0) {
        message = `Car details found!\n\n${foundFields.join("\n")}`;
        if (carDetails.engineDetails) {
          message += `\n\nEngine Details: ${carDetails.engineDetails}`;
        }
      } else {
        message =
          "No additional details were available. Please enter details manually.";
      }

      alert(message);
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

  const [activeImage, setActiveImage] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showBlurBox, setShowBlurBox] = useState(false);
  const [blurBoxCoordinates, setBlurBoxCoordinates] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isDraggingBlurBox, setIsDraggingBlurBox] = useState(false);
  const [blurBoxDragStartPosition, setBlurBoxDragStartPosition] = useState({
    x: 0,
    y: 0,
  });
  const blurBoxRef = useRef(null);
  const [blurIntensity, setBlurIntensity] = useState(5);

  // Image adjustments state
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  // Load the first image when component mounts
  useEffect(() => {
    if (formData.images && formData.images.length > 0) {
      setActiveImage(formData.images[0]);
      setActiveImageIndex(0);
      setPreviewUrl(formData.imagePreviews[0]);
    }
  }, [formData.images, formData.imagePreviews]);

  // Update preview URL when active image changes
  useEffect(() => {
    if (activeImage) {
      const url = URL.createObjectURL(activeImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [activeImage]);

  // Handle value change for image adjustments
  const handleAdjustmentChange = (property, value) => {
    setAdjustments((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  // Auto-enhance image
  const autoEnhance = () => {
    setAdjustments({
      brightness: 105,
      contrast: 115,
      saturation: 110,
    });
  };

  // Reset all adjustments
  const resetAdjustments = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
    });
  };

  // Compute the CSS filter string based on adjustments
  const getFilterStyle = () => {
    return `
      brightness(${adjustments.brightness}%) 
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
    `;
  };

  // Select a different image to edit
  const selectImage = (index) => {
    if (formData.images[index]) {
      setActiveImage(formData.images[index]);
      setActiveImageIndex(index);
      setPreviewUrl(formData.imagePreviews[index]);
      resetAdjustments();
      setShowBlurBox(false);
    }
  };

  // Initialize blur box when toggling it on
  useEffect(() => {
    if (showBlurBox && imageRef.current && containerRef.current) {
      // Wait a moment for the image to fully render
      setTimeout(() => {
        const img = imageRef.current;
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        // Calculate the initial size and position for the blur box
        // Make it about 1/4 the size of the image and centered
        const boxWidth = imgRect.width / 4;
        const boxHeight = imgRect.height / 4;

        // Center the blur box on the image
        const x =
          imgRect.left - containerRect.left + (imgRect.width - boxWidth) / 2;
        const y =
          imgRect.top - containerRect.top + (imgRect.height - boxHeight) / 2;

        setBlurBoxCoordinates({
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: Math.min(boxWidth, imgRect.width),
          height: Math.min(boxHeight, imgRect.height),
        });
      }, 100);
    }
  }, [showBlurBox]);

  // Handle blur box drag start
  const handleBlurBoxDragStart = (e) => {
    if (!blurBoxRef.current) return;

    setBlurBoxDragStartPosition({
      x: e.type.includes("touch") ? e.touches[0].clientX : e.clientX,
      y: e.type.includes("touch") ? e.touches[0].clientY : e.clientY,
    });
    setIsDraggingBlurBox(true);
  };

  // Handle blur box drag
  const handleBlurBoxDrag = (e) => {
    if (
      !isDraggingBlurBox ||
      !blurBoxRef.current ||
      !containerRef.current ||
      !imageRef.current
    )
      return;

    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

    const dx = clientX - blurBoxDragStartPosition.x;
    const dy = clientY - blurBoxDragStartPosition.y;

    setBlurBoxDragStartPosition({
      x: clientX,
      y: clientY,
    });

    setBlurBoxCoordinates((prev) => {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const imgRect = imageRef.current.getBoundingClientRect();

      // Calculate new position
      let newX = prev.x + dx;
      let newY = prev.y + dy;

      // Constrain to image boundaries
      newX = Math.max(
        imgRect.left - containerRect.left,
        Math.min(imgRect.right - containerRect.left - prev.width, newX)
      );
      newY = Math.max(
        imgRect.top - containerRect.top,
        Math.min(imgRect.bottom - containerRect.top - prev.height, newY)
      );

      return { ...prev, x: newX, y: newY };
    });
  };

  // Handle blur box drag end
  const handleBlurBoxDragEnd = () => {
    setIsDraggingBlurBox(false);
  };

  // Apply the blur box permanently to the image
  const applyBlurBox = () => {
    if (!activeImage || !imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Calculate scale between natural and displayed image
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Convert blur box coordinates to natural image coordinates
    const blurBoxX = Math.floor(
      (blurBoxCoordinates.x - (imgRect.left - containerRect.left)) * scaleX
    );
    const blurBoxY = Math.floor(
      (blurBoxCoordinates.y - (imgRect.top - containerRect.top)) * scaleY
    );
    const blurBoxWidth = Math.floor(blurBoxCoordinates.width * scaleX);
    const blurBoxHeight = Math.floor(blurBoxCoordinates.height * scaleY);

    // Create the main canvas
    const mainCanvas = document.createElement("canvas");
    const mainCtx = mainCanvas.getContext("2d");
    mainCanvas.width = img.naturalWidth;
    mainCanvas.height = img.naturalHeight;

    // Draw the original image
    mainCtx.drawImage(img, 0, 0);

    // Create a temporary canvas for the blur area
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = blurBoxWidth;
    tempCanvas.height = blurBoxHeight;

    // Draw the region to blur
    tempCtx.drawImage(
      img,
      blurBoxX,
      blurBoxY,
      blurBoxWidth,
      blurBoxHeight,
      0,
      0,
      blurBoxWidth,
      blurBoxHeight
    );

    // Apply a strong blur effect
    tempCtx.filter = `blur(${blurIntensity * 2}px)`;
    tempCtx.drawImage(tempCanvas, 0, 0);

    // Add a semi-transparent overlay to further obscure details
    tempCtx.fillStyle = "rgba(150, 150, 150, 0.1)";
    tempCtx.fillRect(0, 0, blurBoxWidth, blurBoxHeight);

    // Draw the blurred region back to the main canvas
    mainCtx.drawImage(tempCanvas, blurBoxX, blurBoxY);

    // Convert to blob and update the image
    mainCanvas.toBlob(
      (blob) => {
        if (blob) {
          // Create a new File object
          const blurredFile = new File([blob], activeImage.name, {
            type: activeImage.type,
          });

          // Update the image in the formData
          const newImages = [...formData.images];
          newImages[activeImageIndex] = blurredFile;

          // Generate a new preview URL
          const newPreviewUrl = URL.createObjectURL(blob);
          const newPreviews = [...formData.imagePreviews];
          newPreviews[activeImageIndex] = newPreviewUrl;

          // Update form data
          updateFormData({
            images: newImages,
            imagePreviews: newPreviews,
          });

          // Update local state
          setActiveImage(blurredFile);
          setPreviewUrl(newPreviewUrl);
          setShowBlurBox(false);
        }
      },
      activeImage.type,
      1.0 // Maximum quality
    );
  };

  // Save the current image with adjustments
  const saveAdjustments = () => {
    if (!activeImage || !imageRef.current) return;

    // Create a canvas to apply the filters
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    const img = imageRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply filters using CSS filter string
    ctx.filter = getFilterStyle();
    ctx.drawImage(img, 0, 0);

    // Convert to blob and update the image
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Create a new File object
          const adjustedFile = new File([blob], activeImage.name, {
            type: activeImage.type,
          });

          // Update the image in the formData
          const newImages = [...formData.images];
          newImages[activeImageIndex] = adjustedFile;

          // Generate a new preview URL
          const newPreviewUrl = URL.createObjectURL(blob);
          const newPreviews = [...formData.imagePreviews];
          newPreviews[activeImageIndex] = newPreviewUrl;

          // Update form data
          updateFormData({
            images: newImages,
            imagePreviews: newPreviews,
          });

          // Update local state
          setActiveImage(adjustedFile);
          setPreviewUrl(newPreviewUrl);
        }
      },
      activeImage.type,
      1.0 // Maximum quality
    );
  };

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Krok 3: Dane Auta</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Make */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Marka</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.make}
            onChange={(e) =>
              setLocalData({ ...localData, make: e.target.value, model: "" })
            }
            disabled={makesModelsData?.loading}
          >
            <option value="">Wybierz Marka</option>
            {makes.map((make, index) => (
              <option key={index} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Model</label>
          <select
            className="border p-3 w-full rounded h-12"
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

        {/* Trim */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Wersja</label>
          <input
            type="text"
            placeholder="Wersja (Daraja Kroz, Normal, etc.)"
            className="border p-3 w-full rounded h-12"
            value={localData.trim}
            onChange={(e) =>
              setLocalData({ ...localData, trim: e.target.value })
            }
          />
        </div>

        {/* Type */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Typ</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.type}
            onChange={(e) =>
              setLocalData({ ...localData, type: e.target.value })
            }
          >
            <option value="">Wybierz Typ</option>
            <option value="Hatchback">hatchback</option>
            <option value="Sedan">sedan</option>
            <option value="Kombi">kombi</option>
            <option value="Coupe">coupe</option>
            <option value="Sports">sports</option>
            <option value="Limousine">limousine</option>
            <option value="SUV">suv</option>
            <option value="Convertible">convertible</option>
            <option value="Pickup">pickup</option>
            <option value="Offroad">offroad</option>
            <option value="Bus">bus</option>
            <option value="Classic">classic</option>
            <option value="Campers">campers</option>
            <option value="Crossover">Crossover</option>
          </select>
        </div>

        {/* Year */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Rok</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.year}
            onChange={(e) =>
              setLocalData({ ...localData, year: e.target.value })
            }
          >
            <option value="">Wybierz Rok</option>
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Kolor</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={colorSelectedValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__OTHER__") {
                setLocalData({ ...localData, color: "" });
              } else {
                setLocalData({ ...localData, color: v });
              }
            }}
          >
            <option value="">Wybierz Kolor</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__OTHER__">Inny kolor</option>
          </select>
          {colorSelectedValue === "__OTHER__" && (
            <input
              type="text"
              placeholder="Inny kolor"
              className="border p-3 w-full rounded h-12 mt-2"
              value={localData.color}
              onChange={(e) =>
                setLocalData({ ...localData, color: e.target.value })
              }
            />
          )}
        </div>

        {/* Mileage */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Przebieg (KM)</label>
          <input
            type="number"
            placeholder="Przebieg"
            className="border p-3 w-full rounded h-12"
            value={localData.mileage}
            onChange={(e) =>
              setLocalData({ ...localData, mileage: e.target.value })
            }
          />
        </div>

        {/* Drivetrain */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Napęd</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.drivetrain}
            onChange={(e) =>
              setLocalData({ ...localData, drivetrain: e.target.value })
            }
          >
            <option value="">Wybierz Napęd</option>
            <option value="FWD">Przód</option>
            <option value="RWD">Tył</option>
            <option value="4WD">4x4</option>
          </select>
        </div>

        {/* Transmission */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Skrzynia Biegów</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.transmission}
            onChange={(e) =>
              setLocalData({ ...localData, transmission: e.target.value })
            }
          >
            <option value="">Wybierz Skrzynia Biegów</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automat</option>
          </select>
        </div>

        {/* Fuel */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Paliwo</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.fuel}
            onChange={(e) =>
              setLocalData({ ...localData, fuel: e.target.value })
            }
          >
            <option value="">Wybierz Paliwo</option>
            <option value="Petrol">Benzyna</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybryda</option>
            <option value="Electric">Elektryk</option>
            <option value="LPG">LPG</option>
            <option value="Wodór">Wodór</option>
          </select>
        </div>

        {/* Horsepower */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Konie Mechaniczne</label>
          <input
            type="number"
            placeholder="Konie Mechaniczne"
            className="border p-3 w-full rounded h-12"
            value={localData.horsepower}
            onChange={(e) =>
              setLocalData({ ...localData, horsepower: e.target.value })
            }
          />
        </div>

        {/* Engine Displacement */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">
            Pojemność
          </label>
          <input
            list="engines"
            type="text"
            placeholder="Pojemność"
            className="border p-3 w-full rounded h-12"
            value={localData.engine}
            onChange={(e) =>
              setLocalData({ ...localData, engine: e.target.value })
            }
          />
          <datalist id="engines">
            {engines.map((engine, index) => (
              <option key={index} value={engine} />
            ))}
          </datalist>
        </div>

        {/* Service History */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Historia Serwisowa</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.serviceHistory}
            onChange={(e) =>
              setLocalData({ ...localData, serviceHistory: e.target.value })
            }
          >
            <option value="">Wybierz Historię Serwisową</option>
            <option value="Yes">Tak</option>
            <option value="No">Nie</option>
          </select>
        </div>

        {/* Accident History */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">Bezwypadkowość</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.accidentHistory}
            onChange={(e) =>
              setLocalData({ ...localData, accidentHistory: e.target.value })
            }
          >
            <option value="">Wybierz Bezwypadkowość</option>
            <option value="Yes">Tak</option>
            <option value="No">Nie</option>
          </select>
        </div>

        {/* VIN - Modified to include lookup button */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1">VIN</label>
          <div className="flex">
            <input
              type="text"
              placeholder="VIN"
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
              className="bg-blue-500 text-white px-4 rounded-r h-12 hover:bg-blue-600 transition-colors"
            >
              {isLoading ? "Ładowanie..." : "Sprawdź"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Wprowadź numer VIN, aby automatycznie uzupełnić dane samochodu z bazy CEPiK
          </p>
        </div>

        {/* Country of Origin */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-gray-700 mb-1"> Kraj Pochodzenia</label>
          <select
            className="border p-3 w-full rounded h-12"
            value={localData.country}
            onChange={(e) =>
              setLocalData({ ...localData, country: e.target.value })
            }
          >
            <option value="">Wybierz Kraj</option>
            {countries.map((country, index) => (
              <option key={index} value={country}>
                {countryLabels[country] || country}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Car moved to Step 4 */}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cofnij
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Następna
        </button>
      </div>
    </div>
  );
}
