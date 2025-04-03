"use client";

import { FaLocationArrow, FaTags } from "react-icons/fa";
import { ImLocation } from "react-icons/im";
import CarImageSwiper from "./car-image-swiper";
import { useState, useEffect } from "react";
import { Car } from "./types";

export default function CarCard({
  car,
  view = "grid", // Default view is grid if not specified
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={`rounded-xl overflow-hidden border border-gray-200 shadow-sm group flex ${
        view === "list" ? "flex-row" : "flex-col max-w-full"
      }`}
    >
      {isMounted && (
        <div
          className={`${
            view === "list"
              ? "max-w-96 md:max-w-80 xl:max-w-96 h-auto"
              : "w-full"
          }`}
        >
          <CarImageSwiper images={car.images} carId={car.id} />
        </div>
      )}

      <div className="px-4 py-3 w-full">
        <div className="flex flex-col justify-start mb-2">
          <div className="flex justify-between items-center">
            <h2
              className={`font-semibold text-black mb-2 ${
                view === "list" ? "text-2xl" : "text-lg"
              }`}
            >
              {car.year} {car.name}
            </h2>
          </div>
          <div className="flex space-x-5">
            <div className="flex items-center space-x-2 bg-blue-100 rounded-lg pe-2 w-fit my-2">
              <div className="bg-blue-400 text-sm p-1 rounded-l text-white">
                <FaTags />
              </div>
              <span className="text-base text-black">
                ${car.price.toLocaleString()}
              </span>
            </div>
            {car.location && (
              <div
                className={`text-black flex items-center gap-1 ${
                  view === "list" ? "block" : "hidden"
                }`}
              >
                <ImLocation /> {car.location}
              </div>
            )}
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
            <span className="font-light">Engine:</span> {car.engineSize}
          </div>
          <div>
            <span className="font-light">Mileage:</span>{" "}
            {car.mileage.toLocaleString()}
          </div>
        </div>
        {car.description && (
          <p className="text-sm text-gray-500 mb-4">{car.description}</p>
        )}
        <div className="relative flex justify-between items-center">
          {car.dealer && (
            <div
              className={`${
                view === "list"
                  ? "flex items-center gap-2"
                  : "flex items-center gap-2"
              }`}
            >
              {car.dealer.logo && (
                <img
                  src={car.dealer.logo}
                  alt={car.dealer.name || "Dealer logo"}
                  className="w-32"
                />
              )}
            </div>
          )}
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            View details
          </button>
        </div>
      </div>
    </div>
  );
}
