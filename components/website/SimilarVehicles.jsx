import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getAllCars } from "../../services/carService";
import CarCard from "./CarCard";

const SimilarVehicles = () => {
  const [cars, setCars] = useState([]);
  const [view, setView] = useState("grid");

  // Load all cars on initial render
  useEffect(() => {
    getAllCars()
      .then((data) => setCars(data))
      .catch((error) => console.error("Error fetching cars:", error));
  }, []);

  return (
    <div className="relative w-full py-5 sm:py-12">
      <h2 className="text-2xl font-semibold">Podobne pojazdy</h2>
      <p className="text-gray-600 text-sm mb-4">
        Najlepszy Compact Croma Turbo for 2025
      </p>

      {/* Swiper container */}
      <div className="relative">
        <Swiper
          modules={[Navigation, A11y]}
          navigation={{
            prevEl: ".similar-swiper-prev",
            nextEl: ".similar-swiper-next",
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
              <CarCard view={view} car={car} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className="similar-swiper-prev absolute left-3 md:left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 -ml-4">
          <FaChevronLeft size={20} className="text-gray-600" />
        </button>
        <button className="similar-swiper-next absolute right-3 md:right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 -mr-4">
          <FaChevronRight size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default SimilarVehicles;
