"use client";

import { FaLocationArrow, FaTags } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react"; // ✅ Correct
import { Navigation } from "swiper/modules"; // ✅ Correct
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
    // Fetch the address using cached geocoding when the car location is available
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

  // Fetch public seller info for avatar/name/type
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

  // Get the first image for the compact card
  const firstImage = car?.images && car?.images?.length > 0 ? formatCarImage(car.images[0]) : "https://via.placeholder.com/500";
  // Get seller name
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

  // Render grid view card
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
          
          {/* Image Section */}
          <div className="relative h-60 md:h-40 overflow-hidden">
            <img 
              src={firstImage} 
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            />
            
            {/* Enhanced Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Enhanced Price Badge */}
            <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg group-hover:shadow-xl transition-all duration-300">
              <div className="text-xs font-bold text-gray-900">
                {car.financialInfo?.priceNetto ? 
                  `${car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł` : 
                  "Price N/A"
                }
              </div>
            </div>
          </div>
            
          {/* Content Section */}
          <div className="p-3 relative bg-white">
            
            {/* Title */}
            <div className="mb-1">
              <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">
                {car.year} {car.make} {car.model}
              </h3>
            </div>
              
            {/* Car Details */}
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
              
            {/* Compact Seller Profile Section */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {/* Compact Profile Picture */}
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {getSellerName().charAt(0).toUpperCase()}
                </div>
                
                {/* Compact Seller Info */}
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

  // Render list view card
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
        
        {/* Image Section */}
        <div className="relative w-full md:w-80 h-80 md:h-48 flex-shrink-0 overflow-hidden">
          <img 
            src={firstImage} 
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          />
          
          {/* Enhanced Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Enhanced Price Badge */}
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg group-hover:shadow-xl transition-all duration-300">
            <div className="text-xs font-bold text-gray-900">
              {car.financialInfo?.priceNetto ? 
                `${car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł` : 
                "Price N/A"
              }
            </div>
          </div>
        </div>
          
        {/* Content Section */}
        <div className="p-4 relative bg-white flex-1 flex flex-col justify-between min-h-[112px] md:min-h-[192px]">
          
          {/* Top Section */}
          <div>
            {/* Title */}
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">
                {car.year} {car.make} {car.model}
              </h3>
            </div>
              
            {/* Car Details */}
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
            
          {/* Seller Profile Section */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              {/* Profile Picture */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {getSellerName().charAt(0).toUpperCase()}
              </div>
              
              {/* Seller Info */}
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
    );
  }
}
                        src={image}
                        className="w-full h-64 object-cover"
                        alt={`Car Image ${index + 1}`}
                      />
                    </div>
                  </SwiperSlide>
                );
              })
            ) : (
              <SwiperSlide>
                <img
                  src="https://via.placeholder.com/500"
                  className="w-full h-64 object-cover"
                  alt="Placeholder Image"
                />
              </SwiperSlide>
            )}

            <button className="custom-prev group-hover:opacity-100 opacity-0 transition-all duration-300 absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/30 text-black w-8 h-8 rounded-full shadow-md z-10">
              ❮
            </button>
            <button className="custom-next group-hover:opacity-100 opacity-0 transition-all duration-300 absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/30 text-black w-8 h-8 rounded-full shadow-md z-10">
              ❯
            </button>
          </Swiper>

          <div className="px-4 py-3 w-full">
            <div className="flex flex-col justify-start mb-2">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => router.push(`/website/cars/${car._id}`)}
                  className={`font-semibold uppercase text-black mb-2 ${
                    view === "list" ? "text-2xl" : "text-lg"
                  }`}
                >
                  {car.year} {car.make} {car.model}
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:space-x-5">
                {/* Display the city and state (province) */}
                <div className={`text-black flex items-center gap-1 `}>
                  <ImLocation />
                  {locationDetails.city && locationDetails.state
                    ? `${locationDetails.city}, ${locationDetails.state}`
                    : "Loading location..."}
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-blue-100 rounded-lg pe-2 w-fit my-2">
                <div className="bg-blue-400 text-sm p-1 rounded-l text-white">
                  <FaTags />
                </div>
                <span className="text-base text-black">
                  {car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-medium mb-3 text-base text-black">
              <div>
                <span className="font-light">Fuel:</span> {car.fuel}
              </div>
              <div>
                <span className="font-light">Transmission:</span> {car.transmission}
              </div>
              <div>
                <span className="font-light">Engine:</span> {car.engine}
              </div>
              <div>
                <span className="font-light">Mileage:</span> {car.mileage}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">{car.title}</p>
            <div className="relative flex justify-between items-center">
              <div className={`flex items-center gap-3`}>
                <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-200">
                  <Image
                    src={formatImageUrl(seller?.image)}
                    alt={seller?.firstName || "Seller"}
                    width={40}
                    height={40}
                    className="object-cover w-10 h-10"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-black">
                    {(() => {
                      if (!seller) return "Seller";
                      const type = seller?.sellerType || car?.financialInfo?.sellerType;
                      if (type === "company") return seller?.companyName || `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim() || "Company";
                      const full = `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim();
                      return full || seller?.companyName || "Private Seller";
                    })()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const type = seller?.sellerType || car?.financialInfo?.sellerType;
                      if (!type) return "";
                      return type === "company" ? "Company" : "Private Seller";
                    })()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/website/cars/${car._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  View details
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(car._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="cursor-pointer" onClick={() => router.push(`/website/cars/${car._id}`)}>
          {/* GRID/NORMAL VIEW: Keep new overlay badge and simplified details */}
          <div className={`w-full relative`}>
            <Swiper
              modules={[Navigation]}
              navigation={{ prevEl: ".custom-prev", nextEl: ".custom-next" }}
              className="w-full h-64"
            >
              {/* Dynamically render images */}
              {car?.images && car?.images?.length > 0 ? (
                car?.images?.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="">
                      <img src={image} className="w-full h-64 object-cover" alt={`Car Image ${index + 1}`} />
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <img src="https://via.placeholder.com/500" className="w-full h-64 object-cover" alt="Placeholder Image" />
                </SwiperSlide>
              )}

              <button className="custom-prev group-hover:opacity-100 opacity-0 transition-all duration-300 absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/30 text-black w-8 h-8 rounded-full shadow-md z-10">❮</button>
              <button className="custom-next group-hover:opacity-100 opacity-0 transition-all duration-300 absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/30 text-black w-8 h-8 rounded-full shadow-md z-10">❯</button>
            </Swiper>

            {/* Price badge overlay */}
            <div className="absolute bottom-2 left-2 z-20">
              <div className="flex items-center space-x-2 bg-blue-100/90 backdrop-blur-sm rounded-lg pe-2 w-fit">
                <div className="bg-blue-500 text-sm py-2 px-1 rounded-l text-white">
                  <FaTags />
                </div>
                <span className="text-base text-black">
                  {car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 w-full">
            <div className="flex flex-col justify-start mb-2">
              <div className="flex mb-2 justify-between items-center">
                <button
                  className={`font-semibold uppercase text-black  ${
                    view === "list" ? "text-2xl" : "text-lg"
                  }`}
                >
                  {car.year} {car.make} {car.model}
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:space-x-5">
                <div className={`text-black flex items-center gap-1 `}>
                  <ImLocation />
                  {locationDetails.city && locationDetails.state
                    ? `${locationDetails.city}, ${locationDetails.state}`
                    : "Loading location..."}
                </div>
              </div>
            </div>

            <div className="flex gap-2 font-medium mb-3 text-base text-black">
              <div>
            {car.mileage}, {car.fuel}, {car.engine}, {car.transmission}, {car.title} 
              </div>
            </div>
            <div className="relative flex justify-between items-center">
              <div className={`flex items-center gap-3`}>
                <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-200">
                  <Image
                    src={formatImageUrl(seller?.image)}
                    alt={seller?.firstName || "Seller"}
                    width={40}
                    height={40}
                    className="object-cover w-10 h-10"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-black">
                    {(() => {
                      if (!seller) return "Seller";
                      const type = seller?.sellerType || car?.financialInfo?.sellerType;
                      if (type === "company") return seller?.companyName || `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim() || "Company";
                      const full = `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim();
                      return full || seller?.companyName || "Private Seller";
                    })()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const type = seller?.sellerType || car?.financialInfo?.sellerType;
                      if (!type) return "";
                      return type === "company" ? "Company" : "Private Seller";
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
