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
        "Unknown Location"
      );
    } catch (err) {
      console.error("Error geocoding coordinates:", err);
      return "Unknown Location";
    }
  };

  const images = car?.images || ["/images/hamer1.png"];

  const nextImage = () => {
    if (isFullscreen) {
      if (fullscreenSwiperRef.current && fullscreenSwiperRef.current.swiper) {
        fullscreenSwiperRef.current.swiper.slideNext();
      }
    } else {
      if (mainSwiperRef.current && mainSwiperRef.current.swiper) {
        mainSwiperRef.current.swiper.slideNext();
      }
    }
  };

  const prevImage = () => {
    if (isFullscreen) {
      if (fullscreenSwiperRef.current && fullscreenSwiperRef.current.swiper) {
        fullscreenSwiperRef.current.swiper.slidePrev();
      }
    } else {
      if (mainSwiperRef.current && mainSwiperRef.current.swiper) {
        mainSwiperRef.current.swiper.slidePrev();
      }
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
    if (!seller) return "Seller";
    const type = seller?.sellerType || car?.financialInfo?.sellerType;
    if (type === "company") {
      return seller?.companyName || "Company";
    }
    const fullName = `${seller?.firstName || ""} ${seller?.lastName || ""
      }`.trim();
    return fullName || seller?.companyName || "Private Seller";
  })();

  const locationDisplay = city || "Unknown Location";

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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="col-span-1 lg:col-span-2 space-y-8">
              {/* Image & Title Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {`${car?.make} ${car?.model} ${car?.year}`}
                    </h1>
                    <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                      {car?.condition === "New" ? "Nowy" : "Używany"}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Main Swiper */}
                    <div className="relative group w-full rounded-2xl overflow-hidden shadow-inner bg-gray-100 dark:bg-gray-900">
                      <Swiper
                        ref={mainSwiperRef}
                        modules={[Navigation, Thumbs, A11y]}
                        navigation={{
                          prevEl: ".main-swiper-prev",
                          nextEl: ".main-swiper-next",
                        }}
                        thumbs={{ swiper: thumbsSwiper }}
                        spaceBetween={0}
                        slidesPerView={1}
                        onSlideChange={(swiper) =>
                          setCurrentImageIndex(swiper.activeIndex)
                        }
                        grabCursor={true}
                        touchRatio={1}
                        touchAngle={45}
                        threshold={10}
                        allowTouchMove={true}
                        simulateTouch={true}
                        className="main-image-swiper"
                      >
                        {images.map((img, index) => (

                          <SwiperSlide key={index}>
                            <div className="relative">
                              <img
                                src={img}
                                alt={`${car?.make} ${car?.model} - Image ${index + 1}`}
                                className="w-full aspect-[16/10] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500"
                                onClick={() => {
                                  setClickedImageUrl(img);
                                  setIsCategorizationModalOpen(true);
                                }}
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      {/* Fullscreen button overlay - Hidden on mobile */}
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="hidden md:block absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-70 z-10"
                      >
                        <IoExpand className="w-5 h-5" />
                      </button>

                      {/* Custom Navigation Arrows - Hidden on mobile */}
                      <button className="hidden md:block main-swiper-prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100 z-10">
                        <IoIosArrowBack className="w-4 h-4" />
                      </button>
                      <button className="hidden md:block main-swiper-next absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100 z-10">
                        <IoIosArrowForward className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Thumbnail Swiper */}
                    {/* Thumbnail Swiper */}
                    <div className="col-span-2 relative mt-4 overflow-hidden w-full">
                      <Swiper
                        modules={[Navigation, A11y]}
                        onSwiper={setThumbsSwiper}
                        spaceBetween={8}
                        slidesPerView="auto"
                        freeMode={true}
                        watchSlidesProgress={true}
                        grabCursor={true}
                        touchRatio={1}
                        allowTouchMove={true}
                        simulateTouch={true}
                        navigation={{
                          prevEl: ".thumb-swiper-prev",
                          nextEl: ".thumb-swiper-next",
                        }}
                        className="thumbnail-swiper w-full"
                      >
                        {images.map((img, index) => (
                          <SwiperSlide key={index} className="!w-[120px]">
                            <img
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              className={`w-[120px] h-[80px] object-cover rounded-md border-2 transition-all duration-200 cursor-pointer ${currentImageIndex === index
                                ? "border-blue-500 shadow-lg"
                                : "border-gray-300 hover:border-gray-400"
                                }`}
                              onClick={() => {
                                setCurrentImageIndex(index);
                                setMainImage(img);
                                setClickedImageUrl(img);
                              }}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      {/* Thumbnail Navigation */}
                      {images.length > 6 && (
                        <>
                          <button className="thumb-swiper-prev absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-1.5 md:p-2 z-10 hover:bg-gray-50 transition">
                            <IoIosArrowBack className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                          </button>

                          <button className="thumb-swiper-next absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-1.5 md:p-2 z-10 hover:bg-gray-50 transition">
                            <IoIosArrowForward className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Details Tab Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-100 dark:border-gray-700 pb-2">
                    {["opis", "stan", "lokalizacja", "finanse"].map((tab) => {
                      // Get the display name for the tab
                      let displayName = tab.charAt(0).toUpperCase() + tab.slice(1);
                      if (tab === "stan" && car?.condition === "New") {
                        displayName = "Gwarancja";
                      }

                      return (

                        <button
                          key={tab}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === tab
                            ? "bg-gray-900 text-white shadow-lg shadow-gray-200/50 dark:shadow-blue-900/30 dark:bg-blue-600 dark:text-white"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {displayName}
                        </button>
                      );
                    })}
                  </div>
                  {renderContent()}
                </div>
              </div>

            </div>

            {/* Right Column / Sidebar */}
            <div className="col-span-1">
              <div className="space-y-6 sticky top-24">

                {/* Price Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-wider mb-2">Cena Całkowita</h3>
                    <div className="flex flex-col">
                      <p className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                        {basePriceNetto !== null
                          ? `${basePriceNetto.toLocaleString("pl-PL")} zł`
                          : "N/A"}
                        <span className="text-lg font-bold text-gray-400 ml-2">Netto</span>
                      </p>

                      {car?.financialInfo?.invoiceOptions?.includes("Invoice VAT") && basePriceNetto !== null && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                          <span className="text-xl">
                            {(basePriceNetto * 1.23).toLocaleString("pl-PL", { maximumFractionDigits: 0 })} zł
                          </span>
                          <span className="text-xs uppercase bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Brutto</span>
                        </div>
                      )}
                    </div>

                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-4 cursor-pointer hover:underline">
                      {car?.financialInfo?.priceWithVat
                        ? `${car?.financialInfo?.priceWithVat} zł (z VAT)`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Seller Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                  <div className="relative z-10 space-y-6">
                    {/* Seller Header */}
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 shrink-0">
                        <button
                          onClick={() => {
                            const sellerId =
                              seller?._id ||
                              seller?.id ||
                              (typeof car?.createdBy === "object"
                                ? car?.createdBy?._id
                                : car?.createdBy);

                            if (sellerId) {
                              router.push(`/website/profile?id=${sellerId}`);
                            }
                          }}
                          className="w-full h-full block rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-gray-700 ring-2 ring-gray-100 dark:ring-gray-900 transition-transform hover:scale-105 relative"
                        >
                          <Image
                            src={formatImageUrl(seller?.image)}
                            alt={sellerName}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">
                          {(() => {
                            const type =
                              seller?.sellerType || car?.financialInfo?.sellerType;
                            if (!type) return "Sprzedawca";
                            return type === "company" ? "Dealer" : "Sprzedawca Prywatny";
                          })()}
                        </p>
                        <h3
                          className="text-xl font-extrabold text-gray-900 dark:text-white truncate hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => {
                            const sellerId =
                              seller?._id ||
                              seller?.id ||
                              (typeof car?.createdBy === "object"
                                ? car?.createdBy?._id
                                : car?.createdBy);

                            if (sellerId) {
                              router.push(`/website/profile?id=${sellerId}`);
                            }
                          }}
                        >
                          {sellerName}
                        </h3>
                        <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400 text-sm font-medium">
                          <img src="/website/map.svg" alt="Location" className="w-4 h-4 mr-1.5 opacity-60" />
                          Nowy Targ
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700"></div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={startChat}
                        className="col-span-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-3.5 px-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl font-bold shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <img src="/website/whats.svg" alt="" className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        <span>Czat</span>
                      </button>
                      <button
                        className="col-span-1 bg-blue-600 text-white py-3.5 px-4 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        onClick={callSeller}
                      >
                        <span>Zadzwoń</span>
                      </button>
                    </div>

                    {socialMediaLinks.length > 0 && (
                      <div className="flex items-center justify-center gap-6 pt-2">
                        {socialMediaLinks.map(({ platform, icon, url }) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-purple-600 hover:scale-110 transition-all text-2xl"
                          >
                            {icon}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>



              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SimilarVehicles />
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
