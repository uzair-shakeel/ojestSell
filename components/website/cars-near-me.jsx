"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CarCard from "./CarCard";
import { getAllCars } from "../../services/carService";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function CarsNearMe() {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("grid");

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllCars();
        console.log("Fetched cars:", data);
        // Ensure data is an array
        if (Array.isArray(data)) {
          setCars(data);
        } else if (data?.cars && Array.isArray(data.cars)) {
          setCars(data.cars); // Handle case where backend returns { cars: [...] }
        } else {
          throw new Error("Fetched data is not an array");
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
        setError(error.message || "Failed to fetch cars");
        setCars([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []); // No dependencies since we don't need getToken

  return (
    <section className="py-12 bg-gray-50 dark:bg-dark-main transition-colors duration-300">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary transition-colors duration-300 tracking-tight">
            Ostatnio Dodane
          </h2>
          <button className="px-6 py-2.5 bg-white dark:bg-dark-raised border border-gray-200 dark:border-dark-divider rounded-full text-sm font-bold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-elevation-1 hover:shadow-md transition-all duration-300 flex items-center gap-2">
            Więcej <span className="text-lg">→</span>
          </button>
        </div>
        {loading && (
          <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
            {t("homepage.carsNearMe.loading")}
          </p>
        )}
        {error && (
          <p className="text-red-500 dark:text-red-400 transition-colors duration-300">
            {error}
          </p>
        )}
        {!loading && !error && cars.length === 0 && (
          <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
            {t("homepage.carsNearMe.noCars")}
          </p>
        )}
        {/* Swiper container */}
        {cars.length > 0 && (
          <div className="relative">
            <Swiper
              modules={[Navigation, A11y]}
              navigation={{
                prevEl: ".cars-swiper-prev",
                nextEl: ".cars-swiper-next",
              }}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                  spaceBetween: 16,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1280: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
              }}
              grabCursor={true}
              touchRatio={1}
              touchAngle={45}
              threshold={10}
              allowTouchMove={true}
              simulateTouch={true}
              className="py-4"
            >
              {cars.map((car) => (
                <SwiperSlide key={car._id}>
                  <CarCard viewMode="grid" car={car} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <button className="cars-swiper-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-dark-card backdrop-blur-sm shadow-xl rounded-full p-4 hover:scale-110 active:scale-95 transition-all duration-300 -ml-5 border border-white/20 dark:border-dark-divider text-gray-800 dark:text-dark-text-primary group">
              <FaChevronLeft
                size={20}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
            <button className="cars-swiper-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-dark-card backdrop-blur-sm shadow-xl rounded-full p-4 hover:scale-110 active:scale-95 transition-all duration-300 -mr-5 border border-white/20 dark:border-dark-divider text-gray-800 dark:text-dark-text-primary group">
              <FaChevronRight
                size={20}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
