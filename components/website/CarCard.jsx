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

export default function CarCard({ view, car }) {
  const router = useRouter();
  const { getGeocodingData } = useGoogleMaps();
  const [locationDetails, setLocationDetails] = useState({
    city: "",
    state: "",
  });

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

  return (
    <div
      className={`rounded-xl overflow-hidden border border-gray-200 shadow-sm group flex min-w-[380px] ${
        view === "list" ? "flex-row" : "flex-col max-w-full"
      }`}
    >
      <Swiper
        modules={[Navigation]}
        navigation={{ prevEl: ".custom-prev", nextEl: ".custom-next" }}
        className={`${view === "list" ? "w-[700px] h-auto" : "w-full h-64"}`}
      >
        {/* Dynamically render images from the car.images array */}
        {car?.images && car?.images?.length > 0 ? (
          car?.images?.map((image, index) => {
            // Assuming the backend sends image paths like 'uploads/1743981275051-yousriphoto.jpg'
            const imageUrl = `${
              process.env.NEXT_PUBLIC_API_BASE_URL
            }/${image.replace("\\", "/")}`; // Update URL format for static files

            return (
              <SwiperSlide key={index}>
                <div className="">
                  <img
                    src={imageUrl}
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
              src="https://via.placeholder.com/500" // Placeholder image
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
            <h2
              className={`font-semibold uppercase text-black mb-2 ${
                view === "list" ? "text-2xl" : "text-lg"
              }`}
            >
              {car.year} {car.make} {car.model}
            </h2>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-5">
            <div className="flex items-center space-x-2 bg-blue-100 rounded-lg pe-2 w-fit my-2">
              <div className="bg-blue-400 text-sm p-1 rounded-l text-white">
                <FaTags />
              </div>
              <span className="text-base text-black">
                {car.financialInfo.priceNetto} zł
              </span>
            </div>

            {/* Display the city and state (province) */}
            <div className={`text-black flex items-center gap-1 `}>
              <ImLocation />
              {locationDetails.city && locationDetails.state
                ? `${locationDetails.city}, ${locationDetails.state}`
                : "Loading location..."}
            </div>
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
          <div className={`flex items-center gap-2`}>
            <img
              src="https://static.autotempest.com/prod/build/main/img/at-logos/at-logo-500.a9d7fdcf.png"
              alt=""
              className="w-32"
            />
          </div>
          <button
            onClick={() => router.push(`/website/cars/${car._id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
}
