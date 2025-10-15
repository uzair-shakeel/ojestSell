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
    <section className="py-12 bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Ostatnio Dodane  
          </h2>
          <button className="px-4 py-2 border border-gray-300 dark:border-white rounded-md text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-300">
          Więcej
          </button>
        </div>
        {loading && <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t("homepage.carsNearMe.loading")}</p>}
        {error && <p className="text-red-500 dark:text-red-400 transition-colors duration-300">{error}</p>}
        {!loading && !error && cars.length === 0 && (
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t("homepage.carsNearMe.noCars")}</p>
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
            <button className="cars-swiper-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 -ml-4 border border-gray-200 dark:border-gray-700">
              <FaChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button className="cars-swiper-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 -mr-4 border border-gray-200 dark:border-gray-700">
              <FaChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
