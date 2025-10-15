"use client";

import { FaLocationArrow, FaTags } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ImLocation } from "react-icons/im";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGoogleMaps } from "../../lib/GoogleMapsContext";
import Image from "next/image";
import { getPublicUserInfo } from "../../services/userService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function CarCard({ car, viewMode = 'grid' }) {
  const router = useRouter();
  const { getGeocodingData } = useGoogleMaps();
  const [locationDetails, setLocationDetails] = useState({
    city: "",
    state: "",
  });

  const [seller, setSeller] = useState(null);

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/website/seller.jpg";
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
      return imagePath;
    }
    return `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
  };

  const formatCarImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500";
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
      return imagePath;
    }
    return `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
  };

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!car.location?.coordinates) return;

      const [longitude, latitude] = car.location.coordinates;
      const details = await getGeocodingData(latitude, longitude);
      setLocationDetails(details);
    };

    if (car.location?.coordinates) {
      fetchLocationDetails();
    }
  }, [car, getGeocodingData]);

  useEffect(() => {
    let mounted = true;
    const loadSeller = async () => {
      try {
        if (!car?.createdBy) return;
        const info = await getPublicUserInfo(car.createdBy);
        if (mounted) setSeller(info);
      } catch (e) {
        if (mounted)
          setSeller({ firstName: "Unknown", lastName: "Seller", sellerType: car?.financialInfo?.sellerType || "private", image: null });
      }
    };
    loadSeller();
    return () => {
      mounted = false;
    };
  }, [car?.createdBy, car?.financialInfo?.sellerType]);

  const firstImage = car?.images && car?.images?.length > 0 ? formatCarImage(car.images[0]) : "https://via.placeholder.com/500";
  
  const getSellerName = () => {
    if (!seller) return "Seller";
    const type = seller?.sellerType || car?.financialInfo?.sellerType;
    if (type === "company") return seller?.companyName || `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim() || "Company";
    const full = `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim();
    return full || seller?.companyName || "Private Seller";
  };

  const getSellerType = () => {
    if (!seller) return "Seller";
    const type = seller?.sellerType || car?.financialInfo?.sellerType;
    if (type === "company") return "Company";
    return "Private Seller";
  };

  const getSellerImage = () => {
    if (!seller?.image) return "/website/seller.jpg";
    return formatImageUrl(seller.image);
  };

  const handleCardClick = () => {
    router.push(`/website/cars/${car._id}`);
  };

  if (viewMode === 'grid') {
    return (
      <div
        className="group cursor-pointer focus:outline-none"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCardClick();
          }
        }}
      >
        <div className="bg-white rounded-b-2xl overflow-hidden relative shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="relative h-[260px] md:h-48 lg:h-[220px] overflow-hidden rounded-lg lg:rounded-none mx-[10px] md:mx-0">
            {car?.isFeatured && (car?.images?.length ?? 0) >= 3 ? (
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-1">
                {/* Top half (image 1) */}
                <div className="relative col-span-2 row-span-1">
                  <img
                    src={formatCarImage(car.images[0])}
                    alt={`${car.year} ${car.make} ${car.model} - 1`}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                {/* Bottom-left (image 2) */}
                <div className="relative col-start-1 col-end-2 row-start-2 row-end-3">
                  <img
                    src={formatCarImage(car.images[1])}
                    alt={`${car.year} ${car.make} ${car.model} - 2`}
                    className="w-full h-full object-cover rounded-bl-lg"
                  />
                </div>
                {/* Bottom-right: split horizontally only if 4th image exists */}
                <div className="relative col-start-2 col-end-3 row-start-2 row-end-3">
                  {(car?.images?.length ?? 0) >= 4 ? (
                    <div className="grid grid-cols-2 gap-1 h-full">
                      <img
                        src={formatCarImage(car.images[2])}
                        alt={`${car.year} ${car.make} ${car.model} - 3`}
                        className="w-full h-full object-cover"
                      />
                      <img
                        src={formatCarImage(car.images[3])}
                        alt={`${car.year} ${car.make} ${car.model} - 4`}
                        className="w-full h-full object-cover rounded-br-lg"
                      />
                    </div>
                  ) : (
                    <img
                      src={formatCarImage(car.images[2])}
                      alt={`${car.year} ${car.make} ${car.model} - 3`}
                      className="w-full h-full object-cover rounded-br-lg"
                    />
                  )}
                </div>
              </div>
            ) : (
              <img
                src={firstImage}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover rounded-lg lg:rounded-none"
              />
            )}
            {/* Price overlay */}
            <div className="absolute bottom-2 left-2 bg-gray-900/95 px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
              <div className="text-xs font-bold text-white tracking-wide">
                {car.financialInfo?.priceNetto
                  ? `${car.financialInfo.priceNetto.toLocaleString('pl-PL')} zł`
                  : 'Price N/A'}
              </div>
            </div>
            {car?.isFeatured && (
              <div className="absolute top-2 right-2">
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                  <FaTags className="w-3 h-3" /> FEATURED
                </div>
              </div>
            )}
          </div>
          <div className="p-4 relative bg-white">
            <div className="mb-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 transition-colors duration-300">
                {car.year} {car.make} {car.model}
              </h3>
            </div>
            <div className="space-y-1 mb-2">
              <div className="text-[14px] text-gray-700 font-normal leading-[1.5]">
                {car.mileage || 'N/A'}, {car.fuel || 'N/A'}, {car.engine || 'N/A'}, {car.transmission || 'N/A'}
              </div>
              <div className="text-[14px] text-gray-500 dark:text-gray-400 font-normal leading-[1.5] flex items-center transition-colors duration-300">
                {locationDetails.city && locationDetails.state
                  ? `${locationDetails.city}, ${locationDetails.state}`
                  : 'Loading location...'}
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <div className="flex items-center space-x-2">
                <img
                  src={getSellerImage()}
                  alt={getSellerName()}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate transition-colors duration-300">
                    {getSellerName()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">
                    {getSellerType()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group cursor-pointer focus:outline-none" 
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="bg-white rounded-b-2xl overflow-hidden backdrop-blur-sm relative flex flex-row">
        <div className="relative w-32 md:w-80 h-24 md:h-48 lg:h-[182px] flex-shrink-0 overflow-hidden rounded-lg lg:rounded-none mx-[10px] md:mx-0">
          <img 
            src={firstImage} 
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover rounded-lg lg:rounded-none"
          />
          <div className="absolute bottom-2 left-2 bg-gray-900/90 px-2 py-1 rounded-md shadow-lg">
            <div className="text-xs font-bold text-white">
              {car.financialInfo?.priceNetto ? 
                `${car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł` : 
                "Price N/A"
              }
            </div>
          </div>
          {car?.isFeatured && (
            <div className="absolute top-2 right-2">
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                <FaTags className="w-3 h-3" /> FEATURED
              </div>
            </div>
          )}
        </div>
        <div className="p-2 md:p-4 relative bg-white flex-1 flex flex-col justify-between min-h-[96px] md:min-h-[192px]">
          <div>
            <div className="mb-1 md:mb-2">
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 transition-colors duration-300">
                {car.year} {car.make} {car.model}
              </h3>
            </div>
            <div className="space-y-0.5 md:space-y-1 mb-2 md:mb-3">
              <div className="text-xs md:text-[14px] text-gray-700 dark:text-gray-300 font-normal leading-[1.3] md:leading-[1.5] transition-colors duration-300">
                {car.mileage || "N/A"}, {car.fuel || "N/A"}
              </div>
              <div className="text-xs md:text-[14px] text-gray-500 dark:text-gray-400 font-normal leading-[1.3] md:leading-[1.5] flex items-center transition-colors duration-300">
                {locationDetails.city && locationDetails.state
                  ? `${locationDetails.city}, ${locationDetails.state}`
                  : "Loading location..."}
              </div>
            </div>
          </div>
          <div className="pt-2 md:pt-3 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center space-x-2 md:space-x-3">
              <img 
                src={getSellerImage()} 
                alt={getSellerName()}
                className="w-5 h-5 md:w-8 md:h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs md:text-base font-semibold text-gray-900 dark:text-white truncate transition-colors duration-300">
                  {getSellerName()}
                </div>
                <div className="text-xs md:text-base text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">
                  {getSellerType()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
