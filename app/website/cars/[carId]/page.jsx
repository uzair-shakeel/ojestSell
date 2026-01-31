"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoClose, IoExpand } from "react-icons/io5";
import ConditionTab from "../../../../components/website/ConditionTab";
import DetailTab from "../../../../components/website/DetailTab";
import LocationTab from "../../../../components/website/LocationTab";
import FinancialTab from "../../../../components/website/FinancialTab";
import SimilarVehicles from "../../../../components/website/SimilarVehicles";
import { FaInstagram, FaFacebook, FaGlobe } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { getCarById } from "../../../../services/carService";
import { getPublicUserInfo } from "../../../../services/userService";
import { useAuth } from "../../../../lib/auth/AuthContext";
import io from "socket.io-client";
import ImageCategorizationModal from "../../../../components/website/ImageCategorizationModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const socket = io(API_BASE || undefined, {
  autoConnect: false,
});

const Page = () => {
  const [activeTab, setActiveTab] = useState("opis");
  const { carId } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [car, setCar] = useState(null);
  const [seller, setSeller] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [selectedWarrantyIndex, setSelectedWarrantyIndex] = useState(null);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isCategorizationModalOpen, setIsCategorizationModalOpen] = useState(false);
  const [clickedImageUrl, setClickedImageUrl] = useState(null);
  const mainSwiperRef = useRef(null);
  const fullscreenSwiperRef = useRef(null);

  const thumbnailScrollRef = useRef(null);

  const formatImageUrl = (imagePath) => {
    // Use a known local fallback avatar if seller image is missing
    if (!imagePath) return "/website/seller.jpg";
    // If a full URL is provided, return as-is
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
      return imagePath;
    }
    return `${API_BASE}/${imagePath.replace("\\", "/")}`;
  };

  // Ensure links open correctly even if user saved without protocol
  const normalizeUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  // Format phone number with spaces for display (e.g., "+48 669 993 336")
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";

    // Convert to string and remove all non-digit characters except +
    let cleaned = String(phoneNumber).replace(/[^\d+]/g, "");

    // Ensure it starts with +
    if (!cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }

    // Remove the + for processing
    const digitsOnly = cleaned.substring(1);

    // Polish formatting (+48 XXX XXX XXX) or 2-digit CC (+XX XXX XXX XXX)
    if (digitsOnly.length === 11) {
      return `+${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 5)} ${digitsOnly.substring(5, 8)} ${digitsOnly.substring(8)}`;
    }

    // Fallback simple grouping for other lengths
    const groups = [];
    let countryCode = digitsOnly.length > 9 ? digitsOnly.substring(0, digitsOnly.length - 9) : "";
    let rest = digitsOnly.length > 9 ? digitsOnly.substring(digitsOnly.length - 9) : digitsOnly;

    for (let i = 0; i < rest.length; i += 3) {
      groups.push(rest.substring(i, i + 3));
    }

    return countryCode ? `+${countryCode} ${groups.join(" ")}` : `+${groups.join(" ")}`;
  };

  const getCityFromCoordinates = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      );
      const data = await response.json();
      return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        "Nieznana lokalizacja"
      );
    } catch (err) {
      console.error("Error geocoding coordinates:", err);
      return "Nieznana lokalizacja";
    }
  };

  const images = car?.images || ["/images/hamer1.png"];

  let galleryMode = "full"; // default 1 main + 8 thumbs (for 9+ images)
  if (images.length < 5) {
    galleryMode = "single"; // just 1 main image
  } else if (images.length < 9) {
    galleryMode = "mini"; // 1 main + 4 thumbs
  }

  const maxThumbnailsToShow = galleryMode === "full" ? 8 : (galleryMode === "mini" ? 4 : 0);

  // Main gallery uses thumbnails on the right.
  const useThumbnailOffset = images.length > 1;
  const thumbnailSource = useThumbnailOffset ? images.slice(1) : images.slice(0);
  const thumbnailImages = [];

  if (thumbnailSource.length > 0 && maxThumbnailsToShow > 0) {
    // Fill thumbnails up to the allowed limit
    for (let i = 0; i < Math.min(maxThumbnailsToShow, thumbnailSource.length); i++) {
      thumbnailImages.push(thumbnailSource[i]);
    }

    // Fill remaining slots if needed to maintain grid shape
    let i = 0;
    while (thumbnailImages.length < maxThumbnailsToShow && thumbnailSource.length > 0) {
      thumbnailImages.push(thumbnailSource[i % thumbnailSource.length]);
      i++;
    }
  }

  const normalizeImageCategory = (rawCategory) => {
    if (!rawCategory) return "exterior";
    const lower = String(rawCategory).toLowerCase().trim();

    if (lower.includes("seat") || lower.includes("steering") || lower.includes("interior")) return "interior";
    if (lower.includes("dashboard") || lower.includes("console") || lower.includes("odometer") || lower.includes("instrument")) return "dashboard";
    if (lower.includes("wheel") || lower.includes("tire") || lower.includes("rim")) return "wheel";
    if (lower.includes("engine") || lower.includes("hood") || lower.includes("under")) return "engine";
    if (lower.includes("key")) return "keys";
    if (lower.includes("document") || lower.includes("paper") || lower.includes("vin")) return "documents";

    if (
      lower.includes("front") ||
      lower.includes("back") ||
      lower.includes("side") ||
      lower.includes("exterior") ||
      lower.includes("bumper") ||
      lower.includes("door") ||
      lower.includes("trunk")
    ) {
      return "exterior";
    }

    return "exterior";
  };

  const categorizedImagesData = Array.isArray(car?.categorizedImages)
    ? car.categorizedImages
    : [];

  const imageCategoryCounts = {};
  const imageCategoryFirstIndex = {};

  categorizedImagesData.forEach((img) => {
    const category = normalizeImageCategory(img?.category);
    imageCategoryCounts[category] = (imageCategoryCounts[category] || 0) + 1;

    const idx =
      typeof img?.index === "number"
        ? img.index
        : typeof img?.imageIndex === "number"
          ? img.imageIndex
          : null;

    if (idx === null || idx < 0) {
      return;
    }

    if (
      imageCategoryFirstIndex[category] === undefined ||
      idx < imageCategoryFirstIndex[category]
    ) {
      imageCategoryFirstIndex[category] = idx;
    }
  });

  const exteriorCount = imageCategoryCounts.exterior || 0;
  const interiorCount = imageCategoryCounts.interior || 0;

  const exteriorFirstIndex =
    typeof imageCategoryFirstIndex.exterior === "number"
      ? imageCategoryFirstIndex.exterior
      : null;

  const interiorFirstIndex =
    typeof imageCategoryFirstIndex.interior === "number"
      ? imageCategoryFirstIndex.interior
      : null;

  const nextImage = () => {
    if (isFullscreen) {
      if (fullscreenSwiperRef.current && fullscreenSwiperRef.current.swiper) {
        fullscreenSwiperRef.current.swiper.slideNext();
      }
    } else {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(nextIndex);
      setMainImage(images[nextIndex]);
    }
  };

  const prevImage = () => {
    if (isFullscreen) {
      if (fullscreenSwiperRef.current && fullscreenSwiperRef.current.swiper) {
        fullscreenSwiperRef.current.swiper.slidePrev();
      }
    } else {
      const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
      setCurrentImageIndex(prevIndex);
      setMainImage(images[prevIndex]);
    }
  };

  // const selectImage = (index) => {
  //   setCurrentImageIndex(index);
  //   setMainImage(images[index]);
  // };

  const scrollThumbnails = (direction) => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      thumbnailScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextImage();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevImage();
      } else if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, currentImageIndex, images]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carData = await getCarById(carId);
        setCar(carData);
        const firstImage = carData?.images?.[0] || "/images/hamer1.png";
        setMainImage(firstImage);
        setCurrentImageIndex(0);

        // Try to fetch seller data, but don't fail if it's not available
        let sellerData = null;
        try {
          sellerData = await getPublicUserInfo(carData?.createdBy);
          setSeller(sellerData);
        } catch (sellerError) {
          console.warn("Could not fetch seller data:", sellerError);
          // Set a default seller object to prevent UI errors
          const defaultSeller = {
            firstName: "Unknown",
            lastName: "Seller",
            sellerType: "private",
            image: null,
            phoneNumbers: [],
            socialMedia: {},
            location: null,
          };
          setSeller(defaultSeller);
          sellerData = defaultSeller;
        }

        if (sellerData?.location?.coordinates) {
          const cityName = await getCityFromCoordinates(
            sellerData?.location?.coordinates?.[1],
            sellerData?.location?.coordinates?.[0]
          );
          setCity(cityName);
        } else if (carData?.location?.coordinates) {
          // Fallback to car location if seller's location is unavailable
          const cityName = await getCityFromCoordinates(
            carData?.location?.coordinates?.[1],
            carData?.location?.coordinates?.[0]
          );
          setCity(cityName);
        } else {
          setCity("Unknown Location");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load car or seller details.");
      }
    };

    if (carId) fetchData();
  }, [carId]);

  useEffect(() => {
    if (user) {
      socket.auth = { userId: user?.id };
      socket.connect();
      return () => socket.disconnect();
    }
  }, [user]);

  const startChat = async () => {
    if (!user) {
      // Redirect unauthenticated users to sign-in
      try {
        router.push("/sign-in");
      } catch (e) {
        alert("Please log in to start a chat.");
      }
      return;
    }
    if (!seller) {
      alert("Seller information not available.");
      return;
    }

    try {
      const authToken =
        token ||
        (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      const response = await fetch(`${API_BASE}/api/chat/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          carId,
          ownerId: car?.createdBy,
        }),
      });

      if (!response?.ok) {
        // If chat already exists or backend returns non-OK, still navigate to messages
        console.warn("Chat create returned non-OK status", response.status);
      }

      let targetChatId = null;
      try {
        const data = await response.json();
        const chat = Array.isArray(data) ? data[0] : data?.chat || data;
        targetChatId = chat?._id || chat?.id || null;
      } catch (_) {
        // ignore parse error, fallback to plain navigation
      }

      if (targetChatId) {
        router.push(`/dashboard/messages?chatId=${encodeURIComponent(targetChatId)}`);
      } else {
        router.push(`/dashboard/messages`);
      }
    } catch (err) {
      console.error("Error creating chat:", err);
      alert("Failed to start chat. Please try again.");
    }
  };

  const callSeller = () => {
    // If multiple numbers exist, open modal
    if (seller?.phoneNumbers && seller.phoneNumbers.length > 0) {
      setIsPhoneModalOpen(true);
      return;
    }

    // Fallback for single number
    const fallbackSinglePhone = seller?.phoneNumber || seller?.phone;
    if (fallbackSinglePhone) {
      let sanitized = String(fallbackSinglePhone).replace(/[^\d+]/g, "");
      if (!sanitized.startsWith("+") && sanitized.length > 0) {
        sanitized = "+" + sanitized;
      }
      window.location.href = `tel:${sanitized}`;
      return;
    }

    if (typeof window !== "undefined") {
      alert("Numer telefonu sprzedawcy jest niedostępny.");
    }
  };

  const PhoneModal = () => {
    if (!isPhoneModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg dark:text-white font-semibold text-gray-900">Wybierz numer telefonu</h3>
            <button
              onClick={() => setIsPhoneModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="p-4 space-y-3">
            {seller?.phoneNumbers?.map((phoneObj, index) => {
              const number = typeof phoneObj === 'object' ? (phoneObj.phone || phoneObj.number) : phoneObj;
              const countryCode = typeof phoneObj === 'object' ? (phoneObj.countryCode || 'pl') : 'pl';

              if (!number) return null;

              let sanitized = String(number).replace(/[^\d+]/g, "");
              if (!sanitized.startsWith("+") && sanitized.length > 0) {
                sanitized = "+" + sanitized;
              }

              return (
                <a
                  key={index}
                  href={`tel:${sanitized}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div>
                      <p className="font-medium dark:text-gray-400 group-hover:text-blue-600 text-gray-900">{formatPhoneNumber(number)}</p>
                      <p className="text-xs text-gray-500 uppercase">{countryCode}</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-medium text-sm group-hover:underline">Zadzwoń</span>
                </a>
              );
            })}
          </div>
          <div className="p-4 bg-gray-50 border-t">
            <button
              onClick={() => setIsPhoneModalOpen(false)}
              className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Open WhatsApp chat to a specific number using wa.me format
  const openWhatsApp = (rawNumber) => {
    const sanitized = String(rawNumber).replace(/[^\d]/g, "");
    const url = `https://wa.me/${sanitized}`;
    try {
      window.open(url, "_blank");
    } catch (e) {
      window.location.href = url;
    }
  };

  const renderContent = () => {
    const animationVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    if (!car) return <p>Loading...</p>

    switch (activeTab) {
      case "opis":
        return (
          <motion.div
            key="opis"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <DetailTab cardetails={car} />
          </motion.div>
        );
      case "stan":
        return (
          <motion.div
            key="stan"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            {car?.condition === "New" && Array.isArray(car?.warranties) &&
              car.warranties.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Gwarancja</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Ten samochód jest nowy i posiada następujące opcje gwarancji:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.warranties.map((w, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded p-3 text-sm"
                    >
                      <p className="font-medium text-black dark:text-white">
                        {w.years ? `${w.years} lata` : "Gwarancja"}
                      </p>
                      {typeof w.mileageLimit === "number" && (
                        <p className="text-gray-600">
                          Do przebiegu: {w.mileageLimit.toLocaleString("pl-PL")} km
                        </p>
                      )}
                      {w.description && (
                        <p className="text-gray-600 mt-1">
                          {w.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ConditionTab carCondition={car?.carCondition} />
            )}
          </motion.div>
        );
      case "lokalizacja":
        return (
          <motion.div
            key="lokalizacja"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <LocationTab location={car?.location} />
          </motion.div>
        );
      case "finanse":
        return (
          <motion.div
            key="finanse"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <FinancialTab financialInfo={car?.financialInfo} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading car details...</p>
      </div>
    );
  }

  const basePriceNetto = car?.financialInfo?.priceNetto
    ? Number(car.financialInfo.priceNetto)
    : null;

  const sellerName = (() => {
    if (!seller) return "Sprzedawca";
    const type = seller?.sellerType || car?.financialInfo?.sellerType;
    if (type === "company") {
      return seller?.companyName || "Firma";
    }
    const fullName = `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim();
    return fullName || seller?.companyName || "Sprzedawca prywatny";
  })();

  const sellerTypeLabel = (() => {
    const type = seller?.sellerType || car?.financialInfo?.sellerType;
    if (type === "company") return "Firma";
    if (type === "private") return "Sprzedawca prywatny";
    return "-";
  })();

  const locationDisplay = city || "Nieznana lokalizacja";

  const socialMediaLinks = [
    {
      platform: "instagram",
      icon: <FaInstagram />,
      url: normalizeUrl(seller?.socialMedia?.instagram),
    },
    {
      platform: "facebook",
      icon: <FaFacebook />,
      url: normalizeUrl(seller?.socialMedia?.facebook),
    },
    {
      platform: "website",
      icon: <FaGlobe />,
      url: normalizeUrl(seller?.socialMedia?.website),
    },
  ].filter((link) => link.url && link.url.trim() !== "");

  const formatCurrency = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    try {
      return value.toLocaleString("pl-PL", {
        style: "currency",
        currency: "PLN",
        maximumFractionDigits: 0,
      });
    } catch {
      return `${value.toLocaleString("pl-PL")} PLN`;
    }
  };

  const formattedNetPrice = formatCurrency(basePriceNetto);

  const allSpecs = [
    { label: "Make", value: car?.make || "-" },
    { label: "Model", value: car?.model || "-" },
    {
      label: "Mileage",
      value:
        typeof car?.mileage === "number"
          ? `${car.mileage.toLocaleString("en-US")}`
          : "-",
    },
    { label: "VIN", value: car?.vin || "-" },
    { label: "Engine", value: car?.engine || car?.financialInfo?.engine || "-" },
    { label: "Drivetrain", value: car?.drivetrain || "-" },
    { label: "Transmission", value: car?.transmission || "-" },
    { label: "Body Style", value: car?.type || "-" },
    { label: "Exterior Color", value: car?.color || "-" },
    { label: "Interior Color", value: car?.interiorColor || "-" },
    { label: "Title Status", value: car?.titleStatus || "Clean" },
    { label: "Location", value: locationDisplay },
    { label: "Seller", value: sellerName },
    { label: "Seller Type", value: sellerTypeLabel },
  ];

  const breadcrumbs = [

    car?.make,
    car?.model,
    car?.year,
    car?.transmission,
  ].filter(Boolean);

  const stickyTitle = `${car?.year || ""} ${car?.make || ""} ${car?.model || ""}`
    .replace(/\s+/g, " ")
    .trim();

  const renderSpecValue = (item) => {
    const isLink = ["Make", "Model", "Location"].includes(item.label);
    if (item.label === "Seller") {
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden relative">
            {seller?.image ? (
              <img src={formatImageUrl(seller?.image)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">?</div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm ${isLink ? "underline decoration-1 underline-offset-2 hover:text-blue-600 cursor-pointer text-blue-600 dark:text-blue-400 font-medium" : "text-gray-900 dark:text-gray-100"}`}>
          {item.value}
        </span>

      </div>
    );
  };

  const specPairs = [];
  for (let i = 0; i < allSpecs.length; i += 2) {
    specPairs.push([allSpecs[i], allSpecs[i + 1]]);
  }

  return (
    <>
      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-20 bg-black bg-opacity-50 rounded-full p-3"
            >
              <IoClose className="w-6 h-6" />
            </button>

            {/* Fullscreen Swiper */}
            <Swiper
              ref={fullscreenSwiperRef}
              modules={[Navigation, A11y]}
              navigation={{
                prevEl: ".fullscreen-swiper-prev",
                nextEl: ".fullscreen-swiper-next",
              }}
              spaceBetween={0}
              slidesPerView={1}
              initialSlide={currentImageIndex}
              onSlideChange={(swiper) => {
                setCurrentImageIndex(swiper.activeIndex);
                setMainImage(images[swiper.activeIndex]);
              }}
              grabCursor={true}
              touchRatio={1}
              touchAngle={45}
              threshold={10}
              allowTouchMove={true}
              simulateTouch={true}
              className="w-full h-full"
            >
              {images.map((img, index) => (
                <SwiperSlide
                  key={index}
                  className="!flex !items-center !justify-center w-full h-full"
                >
                  <div
                    className="flex items-center justify-center w-full h-full cursor-pointer"
                    onClick={() => {
                      setClickedImageUrl(img);
                      setIsFullscreen(false);
                      setIsCategorizationModalOpen(true);
                    }}
                  >
                    <img
                      src={img}
                      alt={`${car?.make} ${car?.model} - Image ${index + 1}`}
                      className="max-w-full max-h-[90vh] object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation arrows */}
            <button className="fullscreen-swiper-prev absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full hover:bg-opacity-70 transition-all z-10">
              <IoIosArrowBack className="w-5 md:w-7 h-5 md:h-7" />
            </button>
            <button className="fullscreen-swiper-next absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full hover:bg-opacity-70 transition-all z-10">
              <IoIosArrowForward className="w-5 md:w-7 h-5 md:h-7" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full z-10">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-clip">
        {/* Sticky Price / Actions Bar - Now at the VERY top of the gallery section */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 py-3 md:py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-col">
                  {stickyTitle && (
                    <p className="text-[20px] sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none break-words whitespace-normal">
                      {stickyTitle}
                    </p>
                  )}
                  {formattedNetPrice && (
                    <div className="flex items-center gap-2 md:hidden">
                      <span className="text-[20px] font-black text-blue-600 dark:text-blue-400">
                        {formattedNetPrice}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 border border-gray-200 dark:border-gray-700 px-1 rounded">
                        Netto
                      </span>
                    </div>
                  )}

                </div>
              </div>
              <div className="flex items-center gap-4">
                {formattedNetPrice && (
                  <div className="hidden md:flex flex-col items-end leading-none">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1">
                      Cena netto
                    </span>
                    <span className="text-lg sm:text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-400">
                      {formattedNetPrice}
                    </span>
                  </div>
                )}
                {/* <div className="hidden md:flex items-center gap-3">
                  <button
                    type="button"
                    onClick={callSeller}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-400 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                  >
                    Zadzwoń
                  </button>
                  <button
                    type="button"
                    onClick={startChat}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-xs sm:text-sm font-bold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                  >
                    Napisz
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Full Page Gallery */}
        <div className="relative w-full overflow-x-clip">
          {/* Gallery with peek effect on mobile */}
          <div className="max-w-7xl mx-auto px-0 md:px-4 lg:px-8">


            {/* Desktop / tablet gallery: Dynamic layout based on image count */}
            <div className="hidden md:flex md:flex-row gap-2 bg-white dark:bg-gray-900 overflow-hidden h-[380px] sm:h-[430px] md:h-[461px] lg:h-[520px] xl:h-[560px] 2xl:h-[600px]">
              {/* Main Image - Left Side */}
              <div className={`relative group h-full ${galleryMode === "single" ? "w-full" : "w-full md:w-[calc(100%-320px)]"}`}>
                <div className="relative w-full h-full">
                  <img
                    src={mainImage || images[currentImageIndex] || images[0]}
                    alt={`${car?.make} ${car?.model} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => {
                      setClickedImageUrl(mainImage || images[currentImageIndex] || images[0]);
                      setIsCategorizationModalOpen(true);
                    }}
                  />
                </div>

                {/* Fullscreen button overlay */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-70 z-10"
                >
                  <IoExpand className="w-5 h-5" />
                </button>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <IoIosArrowBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <IoIosArrowForward className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Grid - Right Side - Show conditionally based on count */}
              {galleryMode !== "single" && (
                <div className="w-full md:w-[320px] flex-shrink-0 h-full overflow-hidden">
                  <div className={`grid gap-2 h-full ${galleryMode === "mini" ? "grid-cols-1 grid-rows-4" : "grid-cols-2 grid-rows-4"}`}>
                    {thumbnailImages.map((img, index) => {
                      const realIndex = useThumbnailOffset ? index + 1 : index;
                      const isAllPhotosTile = index === (maxThumbnailsToShow - 1) && images.length > (useThumbnailOffset ? (maxThumbnailsToShow + 1) : maxThumbnailsToShow);
                      const isExteriorThumb =
                        !isAllPhotosTile &&
                        exteriorFirstIndex !== null &&
                        exteriorFirstIndex === realIndex &&
                        exteriorCount > 0;
                      const isInteriorThumb =
                        !isAllPhotosTile &&
                        interiorFirstIndex !== null &&
                        interiorFirstIndex === realIndex &&
                        interiorCount > 0;

                      return (
                        <div
                          key={index}
                          className="relative overflow-hidden cursor-pointer transition-all duration-200 h-full w-full"
                          onClick={() => {
                            setClickedImageUrl(img);
                            setIsCategorizationModalOpen(true);
                          }}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${realIndex + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {(isExteriorThumb || isInteriorThumb) && (
                            <div className="absolute top-2 left-2 bg-black/70 text-white px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide">
                              {isExteriorThumb
                                ? `Nadwozie (${exteriorCount})`
                                : `Wnętrze (${interiorCount})`}
                            </div>
                          )}

                          {isAllPhotosTile && (
                            <div
                              className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-70 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClickedImageUrl(images[0]);
                                setIsCategorizationModalOpen(true);
                              }}
                            >
                              <span className="text-white text-base md:text-lg font-semibold">
                                {`Wszystkie zdjęcia (${images.length})`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile gallery: horizontally scrollable carousel with PEEK effect */}
            {/* Force full width breakout for single image on mobile if inside padding */}
            <div className={`flex md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-x-touch min-h-[250px] w-full ${images.length > 1 ? "gap-[3px]" : ""}`}>
              {/* Slide 1: Main Image */}
              <div className={`snap-start shrink-0 ${images.length === 1 ? "w-full" : "w-[88vw]"} aspect-[4/3] relative overflow-hidden bg-white dark:bg-gray-900`}>
                <img
                  src={mainImage || images[currentImageIndex] || images[0]}
                  alt={`${car?.make} ${car?.model} - Image 1`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setClickedImageUrl(mainImage || images[currentImageIndex] || images[0]);
                    setIsCategorizationModalOpen(true);
                  }}
                />

                {/* Categorization badge for the main image if it's the start of a category */}
                {(() => {
                  const isExterior = exteriorFirstIndex === 0 && exteriorCount > 0;
                  const isInterior = interiorFirstIndex === 0 && interiorCount > 0;
                  if (!isExterior && !isInterior) return null;
                  return (
                    <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-md text-xs font-bold tracking-wide">
                      {isExterior ? `Nadwozie (${exteriorCount})` : `Wnętrze (${interiorCount})`}
                    </div>
                  );
                })()}

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full z-10"
                >
                  <IoExpand className="w-4 h-4" />
                </button>
              </div>

              {/* Slide 2 & 3: Thumbnail Grids (2x2) */}
              {[0, 1].map((gridIdx) => {
                const startIndex = gridIdx * 4;
                const gridThumbs = thumbnailImages.slice(startIndex, startIndex + 4);
                if (gridThumbs.length === 0) return null;

                const hasMoreImages = images.length > (useThumbnailOffset ? thumbnailImages.length + 1 : thumbnailImages.length);

                return (
                  <div
                    key={gridIdx}
                    className="snap-start shrink-0 w-[88vw] aspect-[4/3] grid grid-cols-2 grid-rows-2 gap-[2px] bg-white dark:bg-gray-900"
                  >
                    {gridThumbs.map((img, i) => {
                      const thumbIndexInThumbnailImages = startIndex + i;
                      const realIndex = useThumbnailOffset ? thumbIndexInThumbnailImages + 1 : thumbIndexInThumbnailImages;

                      // Show "All Photos" tile if this is the last displayed thumbnail AND there are more images in total
                      const isLastVisibleThumb = thumbIndexInThumbnailImages === thumbnailImages.length - 1;
                      const isAllPhotosTile = isLastVisibleThumb && hasMoreImages;

                      const isExteriorThumb =
                        !isAllPhotosTile &&
                        exteriorFirstIndex !== null &&
                        exteriorFirstIndex === realIndex &&
                        exteriorCount > 0;

                      const isInteriorThumb =
                        !isAllPhotosTile &&
                        interiorFirstIndex !== null &&
                        interiorFirstIndex === realIndex &&
                        interiorCount > 0;

                      return (
                        <div
                          key={i}
                          className="relative overflow-hidden cursor-pointer"
                          onClick={() => {
                            if (isAllPhotosTile) {
                              setClickedImageUrl(images[0]);
                            } else {
                              setClickedImageUrl(img);
                            }
                            setIsCategorizationModalOpen(true);
                          }}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${realIndex + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {(isExteriorThumb || isInteriorThumb) && (
                            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide">
                              {isExteriorThumb
                                ? `Nadwozie (${exteriorCount})`
                                : `Wnętrze (${interiorCount})`}
                            </div>
                          )}

                          {isAllPhotosTile && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                              <span className="text-white text-[13px] font-bold text-center px-1 uppercase tracking-tight">
                                Wszystkie zdjęcia<br />({images.length})
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>



          {/* Content below gallery */}
          <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 mt-6 space-y-8">
            {/* Main details + similar vehicles side column */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_minmax(0,1.4fr)] gap-6 items-start">
              {/* Left: tabs, specs, narrative */}
              <div className="space-y-8">
                {/* Details Tab Card with spec table inside */}
                <div className=" overflow-hidden">
                  <div className="p-2">
                    <div className="flex flex-col gap-4 mb-6">
                      <div className="flex flex-wrap items-center gap-1">
                        {/* Opis Tab - Styled like CARFAX button */}
                        <button
                          onClick={() => setActiveTab("opis")}
                          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all border ${activeTab === "opis"
                            ? "bg-blue-500 text-gray-900 border-gray-300 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className=" tracking-wide">Specyfikacja</span>
                          </div>
                        </button>

                        {/* Lokalizacja Tab */}
                        <button
                          onClick={() => setActiveTab("lokalizacja")}
                          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all border ${activeTab === "lokalizacja"
                            ? "bg-blue-500 text-gray-900 border-gray-300 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                          Lokalizacja
                        </button>


                      </div>

                      {/* Breadcrumbs - Moved here to be below buttons */}
                      <div className="flex flex-nowrap items-center gap-2 text-sm text-gray-500 px-1 uppercase tracking-wider font-semibold text-xs overflow-x-auto scrollbar-hide whitespace-nowrap">
                        {breadcrumbs && breadcrumbs.map((crumb, idx) => (
                          <React.Fragment key={idx}>
                            <span className="hover:underline cursor-pointer transition-colors whitespace-nowrap">{crumb}</span>
                            {idx < breadcrumbs.length - 1 && <span className="text-gray-400">›</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    {/* Content below tabs */}
                    <div className=" rounded-2xl ">
                      {/* Two-column spec table - only for OPIS tab */}
                      {activeTab !== "opis" && renderContent()}
                      {activeTab === "opis" && (
                        <div className="space-y-0 text-gray-900 dark:text-gray-100">

                          {/* Technical Specs Table - Responsive Table */}
                          <div className="mt-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                            {/* Desktop View - 4 column grid matching reference */}
                            <div className="hidden sm:block">
                              <table className="w-full text-left border-collapse">
                                <tbody>
                                  {specPairs.map((pair, rowIdx) => (
                                    <tr key={rowIdx} className="border-b border-gray-200 dark:border-gray-700/50 last:border-0">
                                      {/* First Spec in Pair */}
                                      <td className="py-2.5 px-4 w-[160px] bg-gray-50/50 dark:bg-gray-800/30 font-bold text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700/50">
                                        {pair[0].label}
                                      </td>
                                      <td className="py-2.5 px-4 text-sm border-r border-gray-200 dark:border-gray-700/50">
                                        {renderSpecValue(pair[0])}
                                      </td>

                                      {/* Second Spec in Pair (if exists) */}
                                      {pair[1] ? (
                                        <>
                                          <td className="py-2.5 px-4 w-[160px] bg-gray-50/50 dark:bg-gray-800/30 font-bold text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700/50">
                                            {pair[1].label}
                                          </td>
                                          <td className="py-2.5 px-4 text-sm">
                                            {renderSpecValue(pair[1])}
                                          </td>
                                        </>
                                      ) : (
                                        <>
                                          <td className="py-2.5 px-4 bg-gray-50/50 dark:bg-gray-800/30 border-r border-gray-200 dark:border-gray-700/50"></td>
                                          <td className="py-2.5 px-4"></td>
                                        </>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile View - 2 column list */}
                            <div className="sm:hidden">
                              <table className="w-full text-left border-collapse">
                                <tbody>
                                  {allSpecs && allSpecs.map((item, idx) => (
                                    <tr
                                      key={idx}
                                      className="border-b text-sm border-gray-200 dark:border-gray-700/50 last:border-0"
                                    >
                                      <td className="py-2.5 px-4 w-[120px] bg-gray-50/50 dark:bg-gray-800/30 font-bold text-gray-900 dark:text-gray-100 text-sm border-r border-gray-200 dark:border-gray-700/50">
                                        {item.label}
                                      </td>
                                      <td className="py-2.5 px-4 align-middle">
                                        {renderSpecValue(item)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Narrative sections - Restored and Styled */}
                  <div className="space-y-12 pt-4 px-2 pb-10">
                    {/* Narrative sections - Restored and Unified Design */}
                    <div className="space-y-8 pt-4 pb-10">
                      {/* Highlights Section */}
                      <section className="relative">
                        <div className="flex items-center gap-3 mb-4 px-1">
                          <div className="h-6 w-1 bg-blue-600 rounded-full" />
                          <h2 className="text-[18px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Highlights</h2>
                        </div>
                        <div className="">
                          <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            is a {car?.year} {car?.make} {car?.model}, finished in {car?.color || "original factory color"} with a {car?.interiorColor || "distinguished"} interior.
                          </p>
                          <ul className="space-y-3 text-[15px] text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-3">
                              <span className="text-blue-500 mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span>The odometer currently indicates approximately {car?.mileage?.toLocaleString()} km.</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-blue-500 mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span>{car?.accidentHistory ? "The vehicle has a recorded history of repairs." : "Vehicle history indicates no major accidents or insurance claims."}</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-blue-500 mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span>Power comes from a {car?.engine || "potent engine"} and is delivered via a {car?.transmission || "smooth transmission"}.</span>
                            </li>
                          </ul>
                        </div>
                      </section>

                      {/* Seller Notes Section */}
                      <section className="relative">
                        <div className="flex items-center gap-3 mb-4 px-1">
                          <div className="h-6 w-1 bg-blue-600 rounded-full" />
                          <h2 className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Seller Notes</h2>
                        </div>
                        <div className="">
                          <p className="text-[15px] sm:text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed ">
                            {car?.sellerNotes || "Ten egzemplarz to wyjątkowo zadbana sztuka, łącząca wysoki komfort z niezawodnością. Pojazd przeszedł pełną inspekcję techniczną i jest gotowy do dalszej eksploatacji bez konieczności ponoszenia dodatkowych nakładów finansowych. Idealny wybór dla osób szukających pewnego auta z pewną historią."}
                          </p>
                        </div>
                      </section>

                      {/* Equipment Section */}
                      <section className="relative">
                        <div className="flex items-center gap-3 mb-4 px-1">
                          <div className="h-6 w-1 bg-blue-600 rounded-full" />
                          <h2 className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Equipment</h2>
                        </div>
                        <div className="">
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            {["Automatic climate control", "Satellite navigation system", "Adaptive cruise control", "Heated and ventilated seats", "LED lighting package", "Premium sound system"].map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-[15px] sm:text-[16px] text-gray-700 dark:text-gray-300">
                                <span className="text-blue-500 mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </section>

                      {/* Known Flaws Section */}
                      <section className="relative">
                        <div className="flex items-center gap-3 mb-4 px-1">
                          <div className="h-6 w-1 bg-red-600 rounded-full" />
                          <h2 className="text-[18px]  sm:text-[20px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Known Flaws</h2>
                        </div>
                        <div className="">
                          <ul className="space-y-3">
                            {["Minor stone chips on the front bumper", "Typical wear on the driver's seat bolster", "Light scratching on one of the wheels"].map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-[15px] sm:text-[16px] text-gray-700 dark:text-gray-300">
                                <span className="text-red-500 mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 opacity-70" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </section>

                      {/* Ownership History Section */}
                      <section className="relative">
                        <div className="flex items-center gap-3 mb-4 px-1">
                          <div className="h-6 w-1 bg-blue-600 rounded-full" />
                          <h2 className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Ownership History</h2>
                        </div>
                        <div className="">
                          <p className="text-[15px] sm:text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed">
                            The seller has owned this vehicle since {car?.ownershipStart || "new"} and reports that it has been maintained on schedule with {car?.serviceCount || "regular"} service intervals. Original manuals and two keys are included in the sale.
                          </p>
                        </div>
                      </section>
                      {/* Condition Section - Moved from Tabs to Static */}
                      <section className="relative">
                        <div className="flex items-center gap-3 mb-4 px-1">
                          <div className="h-6 w-1 bg-blue-600 rounded-full" />
                          <h2 className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Condition</h2>
                        </div>
                        <div className="">
                          <ConditionTab carCondition={car?.condition} />
                        </div>
                      </section>

                      {/* Financial Section - Moved from Tabs to Static */}
                      <section className="relative">
                        <div className="flex items-center gap-3 mb-4 px-1">
                          <div className="h-6 w-1 bg-blue-600 rounded-full" />
                          <h2 className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Financial</h2>
                        </div>
                        <div className="">
                          <FinancialTab financialInfo={car?.financialInfo} />
                        </div>
                      </section>
                    </div>
                  </div>
                </div>

              </div>
              {/* Right column: seller profile + similar vehicles */}
              <aside className="md:sticky mx-2 md:top-24 space-y-6">
                {/* Seller profile card */}
                {/* Seller profile card - Premium Upgrade */}
                <div className="relative group rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">

                  {/* Decorative gradient blob */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-md ring-2 ring-gray-50 dark:ring-gray-800">
                            <img
                              src={formatImageUrl(seller?.image)}
                              alt={sellerName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Online indicator dot example - optional */}
                          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        </div>

                        <div className="flex flex-col min-w-0 pt-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate leading-tight">
                            {sellerName}
                          </h3>
                          <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-1">
                            {sellerTypeLabel}
                          </p>
                          {locationDisplay && (
                            <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 dark:text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.45-.96 2.337-1.774C15.33 14.98 18 11.782 18 8.5 18 4.686 14.686 1 10 1s-8 3.314-8 7.5c0 3.282 2.669 6.48 4.303 8.082.887.814 1.716 1.39 2.337 1.774.31.193.57.337.757.433a5.61 5.61 0 00.28.14l.019.008.006.003h.002zM10 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs truncate">{locationDisplay}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={callSeller}
                        className="group relative w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-blue-400 transition-all active:scale-[0.98]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-90">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span>Zadzwoń</span>
                      </button>

                      <button
                        type="button"
                        onClick={startChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-200 dark:hover:border-gray-500 transition-all active:scale-[0.98]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-70">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span>Napisz wiadomość</span>
                      </button>
                    </div>

                    {socialMediaLinks.length > 0 && (
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-4">
                          {socialMediaLinks.map((link) => (
                            <a
                              key={link.platform}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400 transition-all hover:scale-110"
                            >
                              {React.cloneElement(link.icon, { className: "w-5 h-5" })}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Similar vehicles */}
                <div className="">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Podobne pojazdy
                      </h2>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Inne oferty, które mogą Cię zainteresować
                      </p>
                    </div>
                  </div>
                  <div className="">
                    <SimilarVehicles />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div >

        {isWarrantyModalOpen &&
          car?.condition === "New" &&
          Array.isArray(car?.warranties) &&
          car.warranties.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="text-lg font-semibold">Wybierz gwarancję</h3>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 text-sm"
                    onClick={() => setIsWarrantyModalOpen(false)}
                  >
                    Zamknij
                  </button>
                </div>
                <div className="px-4 py-3 text-sm text-gray-600 border-b">
                  Wybierz jedną z dostępnych opcji gwarancji, aby zobaczyć szczegóły.
                </div>
                <div className="px-4 py-3 space-y-3 overflow-y-auto">
                  {car.warranties.map((w, idx) => {
                    const isSelected = selectedWarrantyIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedWarrantyIndex(idx);
                          setIsWarrantyModalOpen(false);
                        }}
                        className={`w-full text-left border rounded-md px-3 py-2 text-sm transition-colors ${isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-black">
                            {w.years ? `${w.years} lata` : "Gwarancja"}
                          </span>
                        </div>
                        {typeof w.mileageLimit === "number" && (
                          <p className="text-xs text-gray-600 mt-1">
                            Do przebiegu: {w.mileageLimit.toLocaleString("pl-PL")} km
                          </p>
                        )}
                        {w.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {w.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-3 border-t flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsWarrantyModalOpen(false)}
                  >
                    Zamknij
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Image Categorization Modal */}
        <ImageCategorizationModal
          isOpen={isCategorizationModalOpen}
          onClose={() => {
            setIsCategorizationModalOpen(false);
            setClickedImageUrl(null);
          }}
          images={images}
          carId={carId}
          clickedImageUrl={clickedImageUrl}
          categorizedImages={car?.categorizedImages || []}
        />
        <PhoneModal />
      </div >
    </>
  );
}

export default Page;
