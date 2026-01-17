"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGoogleMaps } from "../../lib/GoogleMapsContext";
import { getPublicUserInfo } from "../../services/userService";
import {
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  MapPin,
  User,
  ShieldCheck,
  Zap
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export default function CarCard({ car, viewMode = 'grid' }) {
  const router = useRouter();
  const { getGeocodingData } = useGoogleMaps();
  const [locationDetails, setLocationDetails] = useState({
    city: "",
    state: "",
  });

  const [seller, setSeller] = useState(null);

  // Translation helper functions
  const translateFuelType = (fuel) => {
    const translations = {
      'Petrol': 'Benzyna',
      'Diesel': 'Diesel',
      'Hybrid': 'Hybryda',
      'Electric': 'Elektryk',
      'LPG': 'LPG',
      'Wodór': 'Wodór'
    };
    return translations[fuel] || fuel;
  };

  const translateTransmission = (transmission) => {
    const translations = {
      'Automatic': 'Automat',
      'Manual': 'Manual'
    };
    return translations[transmission] || transmission;
  };

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
    return full || seller?.companyName || "Sprzedawca prywatny";
  };

  const getSellerType = () => {
    if (!seller) return "Seller";
    const type = seller?.sellerType || car?.financialInfo?.sellerType;
    if (type === "company") return "Firma";
    return "Sprzedawca prywatny";
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
          <div className="relative h-[260px] md:h-48 lg:h-[220px] overflow-hidden">
            {car?.isFeatured && (car?.images?.length ?? 0) >= 3 ? (
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                <div className="relative col-span-2 row-span-1">
                  <img
                    src={formatCarImage(car.images[0])}
                    alt={`${car.year} ${car.make} ${car.model} - 1`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative col-start-1 col-end-2 row-start-2 row-end-3">
                  <img
                    src={formatCarImage(car.images[1])}
                    alt={`${car.year} ${car.make} ${car.model} - 2`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative col-start-2 col-end-3 row-start-2 row-end-3">
                  {(car?.images?.length ?? 0) >= 4 ? (
                    <div className="grid grid-cols-2 gap-0.5 h-full">
                      <img
                        src={formatCarImage(car.images[2])}
                        alt={`${car.year} ${car.make} ${car.model} - 3`}
                        className="w-full h-full object-cover"
                      />
                      <img
                        src={formatCarImage(car.images[3])}
                        alt={`${car.year} ${car.make} ${car.model} - 4`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <img
                      src={formatCarImage(car.images[2])}
                      alt={`${car.year} ${car.make} ${car.model} - 3`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            ) : (
              <img
                src={firstImage}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}

            {/* Price overlay */}
            <div className="absolute bottom-3 left-3 bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/10">
              <div className="text-sm font-black text-white tracking-tighter">
                {car.financialInfo?.priceNetto
                  ? `${car.financialInfo.priceNetto.toLocaleString('pl-PL')} zł`
                  : 'Cena do negocjacji'}
              </div>
            </div>

            {car?.isFeatured && (
              <div className="absolute top-3 right-3">
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xl border border-white/20">
                  <Zap className="w-3 h-3 fill-current" /> Promowany
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-gray-900">
            <div className="mb-1">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-none tracking-tight">
                {car.year} {car.make} {car.model}
              </h3>
            </div>

            <div className="space-y-1 mb-3">
              <div className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                {car.mileage || '0'} km
                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                {translateFuelType(car.fuel) || 'N/A'}
                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                {car.engine ? `${car.engine} cm3` : 'N/A'}
                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                {translateTransmission(car.transmission) || 'N/A'}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-500 font-medium flex items-center gap-1">
                {locationDetails.city || 'Polska'}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={getSellerImage()}
                    alt={getSellerName()}
                    className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  {getSellerType() === "Firma" && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-white dark:border-gray-900">
                      <ShieldCheck className="w-1.5 h-1.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-900 dark:text-white truncate max-w-[100px] leading-none">
                    {getSellerName()}
                  </span>
                  <span className="text-[8px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">
                    {getSellerType()}
                  </span>
                </div>
              </div>
              <div className="text-blue-600 dark:text-blue-400 font-black text-[10px] flex items-center gap-1 uppercase tracking-widest">
                Szczegóły <Zap className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row border border-gray-100 dark:border-gray-800 h-full md:h-[260px]">
        {/* Image Section */}
        <div className="relative w-full md:w-[400px] h-[220px] md:h-full flex-shrink-0 overflow-hidden">
          {car?.isFeatured && (car?.images?.length ?? 0) >= 3 ? (
            <div className="flex h-full w-full gap-0.5">
              <div className="relative w-2/3 h-full">
                <img
                  src={formatCarImage(car.images[0])}
                  alt={`${car.year} ${car.make} ${car.model} - 1`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-1/3 flex flex-col gap-0.5 h-full">
                <div className="h-1/2">
                  <img
                    src={formatCarImage(car.images[1])}
                    alt={`${car.year} ${car.make} ${car.model} - 2`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-1/2">
                  <img
                    src={formatCarImage(car.images[2])}
                    alt={`${car.year} ${car.make} ${car.model} - 3`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={firstImage}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          )}

          {/* Gradient Overlay for badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {car?.isFeatured && (
            <div className="absolute top-4 left-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xl border border-white/20">
                <Zap className="w-3 h-3 fill-current" /> Promowany
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">
                  {car.make}
                </span>
                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">
                  {car.year}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-none tracking-tight">
                {car.model}
              </h3>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-600 dark:text-gray-300 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{car.mileage || '0'} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{translateFuelType(car.fuel) || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{car.engine ? `${car.engine} cm3` : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{translateTransmission(car.transmission) || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold truncate max-w-[150px]">
                    {locationDetails.city ? `${locationDetails.city}, ${locationDetails.state}` : 'Polska'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                {car.financialInfo?.priceNetto
                  ? `${car.financialInfo.priceNetto.toLocaleString('pl-PL')} zł`
                  : 'Cena do negocjacji'}
              </div>
              {car.financialInfo?.vat && (
                <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mt-2 border border-blue-100 dark:border-blue-800">
                  FV 23% <div className="w-1 h-1 rounded-full bg-blue-400" /> Leasing
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={getSellerImage()}
                  alt={getSellerName()}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-gray-100 dark:border-gray-800 shadow-md"
                />
                {getSellerType() === "Firma" && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-1 border-2 border-white dark:border-gray-900 shadow-lg">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-gray-900 dark:text-white leading-none mb-1">
                  {getSellerName()}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">
                  {getSellerType()}
                </span>
              </div>
            </div>

            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-2xl text-sm font-black hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-xl hover:shadow-blue-500/40 flex items-center gap-2 group/btn">
              Zobacz ofertę
              <Zap className="w-4 h-4 fill-current group-hover/btn:scale-125 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
