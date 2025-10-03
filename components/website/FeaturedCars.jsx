"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CarCard from "./CarCard";
import { getFeaturedCars } from "../../services/carService";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function FeaturedCars() {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFeaturedCars();
        console.log("Fetched featured cars:", data);
        // Ensure data is an array
        if (Array.isArray(data)) {
          setCars(data);
        } else if (data?.cars && Array.isArray(data.cars)) {
          setCars(data.cars); // Handle case where backend returns { cars: [...] }
        } else {
          throw new Error("Fetched data is not an array");
        }
      } catch (error) {
        console.error("Error fetching featured cars:", error);
        setError(error.message || "Failed to fetch featured cars");
        setCars([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  // Don't render if no featured cars
  if (!loading && !error && cars.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ⭐ Featured Cars
            </h2>
            <p className="text-gray-600">
              Discover our handpicked selection of premium vehicles
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 shadow-lg">
            View All Featured
          </button>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading featured cars...</span>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Swiper container */}
        {cars.length > 0 && (
          <div className="relative">
            <Swiper
              modules={[Navigation, A11y]}
              navigation={{
                prevEl: ".featured-cars-swiper-prev",
                nextEl: ".featured-cars-swiper-next",
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
                  <CarCard car={car} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation buttons */}
            <button className="featured-cars-swiper-prev absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors">
              <FaChevronLeft className="text-gray-600" />
            </button>
            <button className="featured-cars-swiper-next absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors">
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
