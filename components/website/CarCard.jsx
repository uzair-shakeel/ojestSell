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

export default function CarCard({ car, viewMode = 'grid' }) {
  const router = useRouter();
  const { getGeocodingData } = useGoogleMaps();
  const [locationDetails, setLocationDetails] = useState({
    city: "",
    state: "",
  });
  console.log("car", car);

  const [seller, setSeller] = useState(null);

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/website/seller.jpg";
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
      return imagePath;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${String(imagePath).replace("\\", "/")}`;
  };

  const formatCarImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500";
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
      return imagePath;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${String(imagePath).replace("\\", "/")}`;
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
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="bg-white rounded-2xl hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 hover:-translate-y-2 overflow-hidden group relative">
          <div className="relative h-60 md:h-40 overflow-hidden">
            <img 
              src={firstImage} 
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg group-hover:shadow-xl transition-all duration-300">
              <div className="text-xs font-bold text-gray-900">
                {car.financialInfo?.priceNetto ? 
                  `${car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł` : 
                  "Price N/A"
                }
              </div>
            </div>
          </div>
          <div className="p-3 relative bg-white">
            <div className="mb-1">
              <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">
                {car.year} {car.make} {car.model}
              </h3>
            </div>
            <div className="space-y-1 mb-2">
              <div className="text-xs text-gray-700 font-medium leading-relaxed">
                {car.mileage || "N/A"}, {car.fuel || "N/A"}, {car.engine || "N/A"}, {car.transmission || "N/A"}
              </div>
              <div className="text-xs text-gray-500 font-normal flex items-center">
                {locationDetails.city && locationDetails.state
                  ? `${locationDetails.city}, ${locationDetails.state}`
                  : "Loading location..."}
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {getSellerName().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {getSellerName()}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    Verified Dealer
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
      <div className="bg-white rounded-2xl hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden group backdrop-blur-sm relative flex flex-col md:flex-row">
        <div className="relative w-full md:w-80 h-80 md:h-48 flex-shrink-0 overflow-hidden">
          <img 
            src={firstImage} 
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg group-hover:shadow-xl transition-all duration-300">
            <div className="text-xs font-bold text-gray-900">
              {car.financialInfo?.priceNetto ? 
                `${car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł` : 
                "Price N/A"
              }
            </div>
          </div>
        </div>
        <div className="p-4 relative bg-white flex-1 flex flex-col justify-between min-h-[112px] md:min-h-[192px]">
          <div>
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">
                {car.year} {car.make} {car.model}
              </h3>
            </div>
            <div className="space-y-1 mb-3">
              <div className="text-sm text-gray-700 font-medium leading-relaxed">
                {car.mileage || "N/A"}, {car.fuel || "N/A"}, {car.engine || "N/A"}, {car.transmission || "N/A"}
              </div>
              <div className="text-sm text-gray-500 font-normal flex items-center">
                {locationDetails.city && locationDetails.state
                  ? `${locationDetails.city}, ${locationDetails.state}`
                  : "Loading location..."}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {getSellerName().charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-gray-900 truncate">
                  {getSellerName()}
                </div>
                <div className="text-base text-gray-500 truncate">
                  Verified Dealer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}