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
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { getCarById } from "../../../../services/carService";
import { getPublicUserInfo } from "../../../../services/userService";
import { useAuth } from "../../../../lib/auth/AuthContext";
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL, {
  autoConnect: false,
});

const Page = () => {
  const [activeTab, setActiveTab] = useState("description");
  const { carId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [seller, setSeller] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const mainSwiperRef = useRef(null);
  const fullscreenSwiperRef = useRef(null);

  const thumbnailScrollRef = useRef(null);

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/images/default-seller.png";
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${imagePath.replace(
      "\\",
      "/"
    )}`;
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

  const selectImage = (index) => {
    setCurrentImageIndex(index);
    setMainImage(images[index]);
  };

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
        } else {
          setCity(carData?.location?.city || "Unknown Location");
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
      alert("Please log in to start a chat.");
      return;
    }
    if (!seller) {
      alert("Seller information not available.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-clerk-user-id": user?.id,
          },
          body: JSON.stringify({
            carId,
            ownerId: car?.createdBy,
          }),
        }
      );

      // if (!response?.ok) {
      //   throw new Error("Failed to create chat");
      // }

      const chat = await response?.json();
      router.push(`/dashboard/messages`);
    } catch (err) {
      console.error("Error creating chat:", err);
      alert("Failed to start chat. Please try again.");
    }
  };

  const renderContent = () => {
    const animationVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    if (!car) return <p>Loading...</p>;

    switch (activeTab) {
      case "description":
        return (
          <motion.div
            key="description"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <DetailTab cardetails={car} />
          </motion.div>
        );
      case "conditions":
        return (
          <motion.div
            key="conditions"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <ConditionTab carCondition={car?.carCondition} />
          </motion.div>
        );
      case "location":
        return (
          <motion.div
            key="location"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <LocationTab location={car?.location} />
          </motion.div>
        );
      case "financial":
        return (
          <motion.div
            key="financial"
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

  const sellerName = seller
    ? `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim() ||
      seller?.companyName ||
      "Seller"
    : "Seller";

  const locationDisplay = city || "Unknown Location";

  const socialMediaLinks = [
    {
      platform: "instagram",
      icon: <FaInstagram />,
      url: seller?.socialMedia?.instagram,
    },
    {
      platform: "facebook",
      icon: <FaFacebook />,
      url: seller?.socialMedia?.facebook,
    },
    {
      platform: "twitter",
      icon: <FaTwitter />,
      url: seller?.socialMedia?.twitter,
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
                  <div className="flex items-center justify-center w-full h-full">
                    <img
                      src={img}
                      alt={`${car?.make} ${car?.model} - Image ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation arrows */}
            <button className="fullscreen-swiper-prev absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10">
              <IoIosArrowBack className="w-8 h-8" />
            </button>
            <button className="fullscreen-swiper-next absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10">
              <IoIosArrowForward className="w-8 h-8" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full z-10">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      <div className="lg:mx-20 p-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <h1 className="text-3xl font-bold mt-6">{`${car?.make} ${car?.model} ${car?.year}`}</h1>
            <div className="grid grid-cols-2 mt-6">
              {/* Main Swiper */}
              <div className="col-span-2 relative group">
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
                      <div className="relative overflow-hidden">
                        <img
                          src={img}
                          alt={`${car?.make} ${car?.model} - Image ${
                            index + 1
                          }`}
                          className="w-full h-[450px] object-cover rounded cursor-pointer transition-transform duration-300 hover:scale-105"
                          onClick={() => setIsFullscreen(true)}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Fullscreen button overlay */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-70 z-10"
                >
                  <IoExpand className="w-5 h-5" />
                </button>

                {/* Custom Navigation Arrows */}
                <button className="main-swiper-prev absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100 z-10">
                  <IoIosArrowBack className="w-6 h-6" />
                </button>
                <button className="main-swiper-next absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100 z-10">
                  <IoIosArrowForward className="w-6 h-6" />
                </button>
              </div>

              {/* Thumbnail Swiper */}
              <div className="col-span-2 relative mt-4">
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
                  className="thumbnail-swiper"
                  breakpoints={{
                    320: {
                      slidesPerView: 3,
                      spaceBetween: 8,
                    },
                    640: {
                      slidesPerView: 4,
                      spaceBetween: 8,
                    },
                    768: {
                      slidesPerView: 5,
                      spaceBetween: 8,
                    },
                    1024: {
                      slidesPerView: 6,
                      spaceBetween: 8,
                    },
                  }}
                >
                  {images.map((img, index) => (
                    <SwiperSlide key={index} className="!w-[120px]">
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-[120px] h-[80px] object-cover rounded-md border-2 transition-all duration-200 cursor-pointer ${
                          currentImageIndex === index
                            ? "border-blue-500 scale-105 shadow-lg"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Thumbnail Navigation */}
                {images.length > 6 && (
                  <>
                    <button className="thumb-swiper-prev absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 -ml-4 hover:bg-gray-50 transition-colors">
                      <IoIosArrowBack className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="thumb-swiper-next absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 -mr-4 hover:bg-gray-50 transition-colors">
                      <IoIosArrowForward className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="col-span-2 bg-white rounded-md mt-5">
              <div className="gap-2 mb-4 grid grid-cols-2 md:grid-cols-4">
                {["description", "conditions", "location", "financial"].map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 border border-gray-200 ${
                        activeTab === tab
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700"
                      } rounded-md`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
                )}
              </div>
              {renderContent()}
            </div>
          </div>
          <div className="col-span-1 sm:mt-20">
            <div className="w-full p-4 bg-white rounded-sm border sticky top-4 shadow">
              <div className="py-3 flex flex-row">
                <div className="flex flex-col items-start">
                  <h3 className="text-base font-medium mb-2">PRICE</h3>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {car?.financialInfo?.priceNetto
                      ? `${car?.financialInfo?.priceNetto} zł `
                      : "N/A"}{" "}
                    <span className="text-xl text-gray-600">(NETTO)</span>
                  </p>
                  <p className="text-xl text-medium text-gray-600 underline">
                    {car?.financialInfo?.priceWithVat
                      ? `${car?.financialInfo?.priceWithVat} zł`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center my-4">
                <div className="flex-grow border-b"></div>
                <p className="px-2 text-gray-500 text-sm">OR</p>
                <div className="flex-grow border-b"></div>
              </div>
              <div className="gap-2 flex flex-col">
                <button
                  className="w-full border border-gray-500 py-3 rounded-md font-semibold"
                  onClick={() => setActiveTab("financial")}
                >
                  See more Financial Details
                </button>
              </div>
              <div className="flex items-center space-x-3 my-5">
                <div className="w-24 h-20 overflow-hidden rounded-full">
                  <Image
                    src={formatImageUrl(seller?.image)}
                    alt={sellerName}
                    width={80}
                    height={80}
                    className="object-center w-20 h-20"
                  />
                </div>
                <div className="w-full">
                  <div className="flex justify-between items-center">
                    <p className="text-black text-lg lg:text-xl">
                      <strong>{sellerName}</strong>
                    </p>
                  </div>
                  <p className="text-base text-gray-500">
                    {seller?.sellerType || "Unknown Seller Type"}
                  </p>
                  <div className="flex justify-start items-center space-x-2">
                    <img
                      src="/website/map.svg"
                      alt="Map Icon"
                      className="w-5 h-5"
                    />
                    <p className="text-base text-gray-500">{locationDisplay}</p>
                  </div>
                </div>
              </div>
              <hr className="my-4" />
              <div className="grid grid-cols-2 gap-2 mt-4">
                <h2 className="text-base font-medium mb-2 col-span-2">
                  Contact Seller
                </h2>
                <button
                  onClick={startChat}
                  className="w-full bg-white-500 text-blue-600 py-3 border border-blue-600 rounded-md font-semibold flex items-center justify-center space-x-2"
                >
                  <img
                    src="/website/whats.svg"
                    alt="Message"
                    className="w-5 h-5"
                  />
                  <span>Message</span>
                </button>
                <button
                  className="w-full border py-3 rounded-md font-semibold bg-blue-500 flex items-center justify-center space-x-2"
                  disabled={!seller?.phoneNumbers?.[0]}
                  onClick={() =>
                    seller?.phoneNumbers?.[0] &&
                    window.open(`tel:${seller?.phoneNumbers?.[0]}`)
                  }
                >
                  <img src="/website/call.svg" alt="Call" className="w-5 h-5" />
                  <span className="text-white">
                    {seller?.phoneNumbers?.[0] ? "Call" : "No Phone"}
                  </span>
                </button>
              </div>
              {socialMediaLinks.length > 0 && (
                <div className="flex items-center justify-center space-x-4 my-7">
                  {socialMediaLinks.map(({ platform, icon, url }) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-3xl transition-all duration-300 hover:opacity-75 text-blue-600"
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <SimilarVehicles />
      </div>
    </>
  );
};

export default Page;
