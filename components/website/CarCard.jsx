"use client";

import { FaLocationArrow, FaTags } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react"; // ✅ Correct
import { Navigation } from "swiper/modules"; // ✅ Correct
import "swiper/css";
import "swiper/css/navigation";
import { ImLocation } from "react-icons/im";
import { useRouter } from "next/navigation";


export default function CarCard({ view }) {
  const router = useRouter();
  return (
    <div
      className={` rounded-xl overflow-hidden border border-gray-200 shadow-sm  group flex ${
        view === "list" ? "flex-row" : "flex-col max-w-full"
      }`}
    >
      <Swiper
        modules={[Navigation]}
        navigation={{ prevEl: ".custom-prev", nextEl: ".custom-next" }}
        className={` ${
          view === "list"
            ? "max-w-96 md:max-w-80 xl:max-w-96 h-auto"
            : "w-full h-64"
        }`}
      >
        <SwiperSlide>
          <img
            src="https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?q=80&w=2073&auto=format&fit=crop"
            className="w-full h-64 object-cover"
            alt="Car"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?q=80&w=2073&auto=format&fit=crop"
            className="w-full h-64 object-cover"
            alt="Car"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?q=80&w=2073&auto=format&fit=crop"
            className="w-full h-64 object-cover"
            alt="Car"
          />
        </SwiperSlide>
        <button className="custom-prev group-hover:opacity-100 opacity-0 transition-all duration-300 absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/30 text-black w-8 h-8 rounded-full shadow-md z-10">
          ❮
        </button>
        <button className="custom-next group-hover:opacity-100 opacity-0 transition-all duration-300 absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/30 text-black w-8 h-8 rounded-full shadow-md z-10">
          ❯
        </button>
      </Swiper>

      <div className="px-4 py-3  w-full">
        <div className="flex flex-col justify-start mb-2">
          <div className="flex justify-between items-center">
            <h2
              className={` font-semibold uppercase text-black mb-2 ${
                view === "list" ? "text-2xl" : "text-lg"
              }`}
            >
              2023 Toyota RAV4{" "}
            </h2>
          </div>
          <div className="flex space-x-5">
            <div className="flex items-center  space-x-2 bg-blue-100 rounded-lg pe-2 w-fit my-2">
              <div className="bg-blue-400 text-sm p-1 rounded-l text-white">
                <FaTags />
              </div>
              <span className="text-base  text-black">100,500 zł</span>
            </div>
            <div
              className={`text-black flex items-center gap-1 ${
                view === "list" ? "block" : "hidden"
              }`}
            >
              <ImLocation /> Tunisia - Monastir
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 font-medium mb-3 text-base text-black">
          <div>
            <span className="font-light">Fuel:</span> Hybrid
          </div>
          <div>
            <span className="font-light">Transmission:</span> Auto
          </div>
          <div>
            <span className="font-light">Engine:</span> 2.5L
          </div>
          <div>
            <span className="font-light">Mileage:</span> 166,000
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Lorem ipsum dolor sit amet cons
        </p>
        <div className="relative flex justify-between items-center">
          <div
            className={` ${
              view === "list"
                ? "flex items-center gap-2"
                : "flex items-center gap-2"
            }`}
          >
            <img
              src="https://static.autotempest.com/prod/build/main/img/at-logos/at-logo-500.a9d7fdcf.png"
              alt=""
              className="w-32"
            />
          </div>
          <button onClick={() => router.push(`/website/cars/5`)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            View details
          </button>
        </div>
      </div>
    </div>
  );
}
