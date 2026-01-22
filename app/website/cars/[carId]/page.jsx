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

  // Main gallery uses 1 large image + up to 8 small thumbnails on the right.
  // If there are fewer than 9 real images, we duplicate some thumbnails so
  // the grid is always filled (visually matching a full 2x4 column).
  const useThumbnailOffset = images.length > 1;
  const thumbnailSource = useThumbnailOffset ? images.slice(1) : images.slice(0);
  const thumbnailImages = [];

  if (thumbnailSource.length > 0) {
    // First, push each unique thumbnail once, up to 8
    for (let i = 0; i < Math.min(8, thumbnailSource.length); i++) {
      thumbnailImages.push(thumbnailSource[i]);
    }

    // If there are still empty slots, repeat from the beginning
    let i = 0;
    while (thumbnailImages.length < 8 && thumbnailSource.length > 0) {
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

  const specItemsLeft = [
    { label: "Marka", value: car?.make || "-" },
    { label: "Model", value: car?.model || "-" },
    {
      label: "Przebieg",
      value:
        typeof car?.mileage === "number"
          ? `${car.mileage.toLocaleString("pl-PL")} km`
          : "-",
    },
    { label: "VIN", value: car?.vin || "-" },
    { label: "Lokalizacja", value: locationDisplay },
    { label: "Sprzedawca", value: sellerName },
  ];

  const specItemsRight = [
    { label: "Silnik", value: car?.engine || car?.financialInfo?.engine || "-" },
    { label: "Napęd", value: car?.drivetrain || "-" },
    { label: "Skrzynia biegów", value: car?.transmission || "-" },
    { label: "Typ nadwozia", value: car?.type || "-" },
    { label: "Kolor zewnętrzny", value: car?.color || "-" },
    {
      label: "Typ sprzedawcy",
      value: sellerTypeLabel,
    },
  ];

  const stickyTitle = `${car?.year || ""} ${car?.make || ""} ${car?.model || ""}`
    .replace(/\s+/g, " ")
    .trim();

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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Full Page Gallery */}
        <div className="relative w-full">
          {/* Full Page Gallery with max-width and padding */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop / tablet gallery: 1 large + 8 thumbnails on the side */}
            <div className="hidden md:flex md:flex-row gap-[3px] bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm h-[380px] sm:h-[430px] md:h-[461px] lg:h-[520px] xl:h-[560px] 2xl:h-[600px]">
              {/* Main Image - Left Side */}
              <div className="relative group w-full md:w-[calc(100%-320px)] h-full">
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

              {/* Thumbnail Grid - Right Side - Show up to 8 thumbnails */}
              <div className="w-full md:w-[320px] flex-shrink-0 h-full">
                <div className="grid grid-cols-2 gap-[3px] h-full">
                  {thumbnailImages.map((img, index) => {
                    const realIndex = useThumbnailOffset ? index + 1 : index;
                    const isAllPhotosTile = index === 7 && images.length > (useThumbnailOffset ? 9 : 8);
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
                        className="relative aspect-square overflow-hidden cursor-pointer transition-all duration-200"
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
            </div>

            {/* Mobile gallery: big main image on top, horizontally scrollable thumbnail grid below */}
            <div className="flex md:hidden flex-col gap-[3px] bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm">
              {/* Main Image - Top */}
              <div className="relative w-full aspect-[4/3]">
                <img
                  src={mainImage || images[currentImageIndex] || images[0]}
                  alt={`${car?.make} ${car?.model} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setClickedImageUrl(mainImage || images[currentImageIndex] || images[0]);
                    setIsCategorizationModalOpen(true);
                  }}
                />

                {/* Fullscreen button overlay */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute top-3 right-3 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 z-10"
                >
                  <IoExpand className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnail strip: 2-row grid, horizontally scrollable */}
              <div className="overflow-x-auto">
                <div className="grid grid-rows-2 auto-cols-[minmax(120px,1fr)] grid-flow-col gap-[3px] px-[3px] pb-[3px]">
                  {thumbnailImages.map((img, index) => {
                    const realIndex = useThumbnailOffset ? index + 1 : index;
                    const isAllPhotosTile = index === 7 && images.length > (useThumbnailOffset ? 9 : 8);
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
                        className="relative aspect-square overflow-hidden cursor-pointer transition-all duration-200"
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
                          <div className="absolute top-1 left-1 bg-black/70 text-white px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide">
                            {isExteriorThumb
                              ? `Nadwozie (${exteriorCount})`
                              : `Wnętrze (${interiorCount})`}
                          </div>
                        )}

                        {isAllPhotosTile && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer hover:bg-black/70 transition-all">
                            <span className="text-white text-xs font-semibold text-center px-1">
                              {`Wszystkie zdjęcia (${images.length})`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Price / Actions Bar - aligned with content width */}
          <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  {stickyTitle && (
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
                      {stickyTitle}
                    </p>
                  )}
                  {locationDisplay && (
                    <p className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {locationDisplay}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {formattedNetPrice && (
                    <div className="flex flex-col items-end leading-tight">
                      <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Cena netto
                      </span>
                      <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
                        {formattedNetPrice}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={callSeller}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-sm hover:bg-blue-700 dark:hover:bg-blue-400 whitespace-nowrap"
                    >
                      Zadzwoń
                    </button>
                    <button
                      type="button"
                      onClick={startChat}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-300 text-gray-900 dark:text-white text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-nowrap"
                    >
                      Napisz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content below gallery */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
            {/* Main details + similar vehicles side column */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.4fr)] gap-6 items-start">
              {/* Left: tabs, specs, narrative */}
              <div className="space-y-8">
                {/* Details Tab Card with spec table inside */}
                <div className=" overflow-hidden">
                  <div className="p-2">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                      {["opis", "stan", "lokalizacja", "finanse"].map((tab) => {
                        // Get the display name for the tab
                        let displayName = tab.charAt(0).toUpperCase() + tab.slice(1);
                        if (tab === "stan" && car?.condition === "New") {
                          displayName = "Gwarancja";
                        }

                        return (
                          <button
                            key={tab}
                            className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 ${activeTab === tab
                              ? "bg-gray-900 text-white shadow-md shadow-gray-200/50 dark:shadow-blue-900/30 dark:bg-blue-600 dark:text-white"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
                              }`}
                            onClick={() => setActiveTab(tab)}
                          >
                            {displayName}
                          </button>
                        );
                      })}
                    </div>
                    {/* Two-column spec table - only for OPIS tab */}
                    {renderContent()}
                    {activeTab === "opis" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 mt-2 gap-0 md:gap-8 mb-8 text-sm">
                        <div className="divide-y divide-gray-400 dark:divide-gray-500 border border-gray-400 dark:border-gray-500 rounded-lg overflow-hidden bg-gray-50/60 dark:bg-gray-900/40">
                          {specItemsLeft.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between gap-4 px-4 py-2.5"
                            >
                              <span className="font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {item.label}
                              </span>
                              <span className="text-right text-gray-900 dark:text-gray-100 truncate max-w-[60%]">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="divide-y divide-gray-400 dark:divide-gray-500 border border-gray-400 dark:border-gray-500 rounded-lg overflow-hidden bg-gray-50/60 dark:bg-gray-900/40">
                          {specItemsRight.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between gap-4 px-4 py-2.5"
                            >
                              <span className="font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {item.label}
                              </span>
                              <span className="text-right text-gray-900 dark:text-gray-100 truncate max-w-[60%]">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>



                {/* Narrative sections with dummy content */}
                <div className="space-y-10">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">Highlights</h2>
                    <p className="text-sm text-gray-700 mb-3">
                      This is a well-presented example of a modern performance car, combining
                      everyday usability with strong performance and a high level of factory
                      equipment. The car in this listing benefits from a clean history,
                      carefully selected options, and a specification focused on both comfort
                      and driver engagement.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>Odometer currently indicates a sensible mileage for its age.</li>
                      <li>
                        Vehicle history reports no major accidents or mileage discrepancies
                        to date.
                      </li>
                      <li>
                        Factory equipment includes comfort and convenience features normally
                        reserved for higher trims.
                      </li>
                      <li>
                        No major modifications reported; presents largely in original factory
                        condition.
                      </li>
                      <li>
                        Power is delivered smoothly through a proven engine and transmission
                        combination.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">Equipment</h2>
                    <p className="text-sm text-gray-700 mb-3">
                      A selection of notable equipment reported by the seller includes:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>Automatic climate control and multi-zone cabin ventilation.</li>
                      <li>Heated and power-adjustable front seats with memory function.</li>
                      <li>Leather-wrapped steering wheel with multifunction controls.</li>
                      <li>Parking sensors and driver-assistance features where equipped.</li>
                      <li>Factory infotainment system with Bluetooth and navigation.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">Known Flaws</h2>
                    <p className="text-sm text-gray-700 mb-3">
                      The seller reports the following cosmetic or age-related imperfections:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>Minor stone chips and light marks around the exterior.</li>
                      <li>Typical wear on interior touch-points such as seat bolsters.</li>
                      <li>Light scratching on wheels consistent with regular road use.</li>
                      <li>General age-related patina appropriate for the model year.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">Recent Service History</h2>
                    <p className="text-sm text-gray-700 mb-3">
                      According to the seller, recent maintenance includes the following
                      items:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>Engine oil and filter changed within the last 12 months.</li>
                      <li>General inspection carried out with no major issues reported.</li>
                      <li>Routine wear items checked and replaced where necessary.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">Other Items Included in Sale</h2>
                    <p className="text-sm text-gray-700 mb-3">
                      The sale is reported to include the following additional items:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>Two keys or key fobs, where originally supplied.</li>
                      <li>Owner&apos;s manuals and basic documentation set.</li>
                      <li>Any remaining service booklets or invoices available to the seller.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">Ownership History</h2>
                    <p className="text-sm text-gray-700">
                      The seller reports that the vehicle has been maintained on schedule and
                      used primarily for regular road driving rather than track use. Exact
                      ownership count and registration history may vary by market and can be
                      confirmed with the seller or relevant registration authority.
                    </p>
                  </section>

                  {/* FAQs */}
                  <section>
                    <h2 className="text-xl font-semibold mb-3">Najczęściej zadawane pytania</h2>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Czy mogę umówić się na oględziny samochodu?</h3>
                        <p className="text-sm text-gray-700">
                          Tak, skontaktuj się ze sprzedawcą za pomocą przycisków „Zadzwoń” lub „Napisz”, aby ustalić termin oględzin.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Czy cena jest do negocjacji?</h3>
                        <p className="text-sm text-gray-700">
                          Możliwość negocjacji zależy od sprzedawcy. Zapytaj bezpośrednio podczas kontaktu.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Czy mogę sprawdzić historię serwisową pojazdu?</h3>
                        <p className="text-sm text-gray-700">
                          Jeżeli sprzedawca posiada książkę serwisową lub faktury, może je udostępnić podczas oględzin lub w rozmowie.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Right column: seller profile + similar vehicles */}
              <aside className="space-y-6">
                {/* Seller profile card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                        <img
                          src={formatImageUrl(seller?.image)}
                          alt={sellerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {sellerName}
                        </span>
                        <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {sellerTypeLabel}
                        </span>
                        {locationDisplay && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {locationDisplay}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-[10px] font-semibold tracking-wide uppercase text-gray-600 dark:text-gray-300">
                      Sprzedający
                    </span>
                  </div>

                  {socialMediaLinks.length > 0 && (
                    <div className="flex items-center gap-3 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Media społecznościowe
                      </span>
                      <div className="flex items-center gap-2">
                        {socialMediaLinks.map((link) => (
                          <a
                            key={link.platform}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 text-sm"
                          >
                            {link.icon}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={callSeller}
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
                    >
                      Zadzwoń
                    </button>
                    <button
                      type="button"
                      onClick={startChat}
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs sm:text-sm font-semibold hover:bg-black transition-colors"
                    >
                      Napisz
                    </button>
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
                  <div className="-mx-2">
                    <SimilarVehicles />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}

export default Page;
