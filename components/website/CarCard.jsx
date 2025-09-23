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
import { TrashIcon } from "lucide-react";

export default function CarCard({ view, car, onDelete }) {
  const router = useRouter();
  const { getGeocodingData } = useGoogleMaps();
  const [locationDetails, setLocationDetails] = useState({
    city: "",
    state: "",
  });
  console.log("car", car);

  const details = `${car.fuel}, ${car.transmission}, ${car.engine}, ${car.mileage} km`;

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

  return (
    <div
      className={`overflow-hidden group flex  ${
        view === "list" ? "flex-row" : "flex-col max-w-full"
      }`}
    >
      <div className='hidden md:block '>
        <Swiper
          modules={[Navigation]}
          navigation={{ prevEl: ".custom-prev", nextEl: ".custom-next" }}
          className={`${view === "list" ? "w-[700px] h-auto" : "w-full h-[300px]"}`}
        >
          {car?.images && car?.images?.length > 0 ? (
            car?.images?.map((image, index) => {
              return (
                <SwiperSlide key={index}>
                  <div className='h-[300px] overflow-hidden rounded-[7px]'>
                    <Image
                      src={image}
                      width={1000}
                      height={500}
                      className='w-full h-full object-cover'
                      alt={`Car Image ${index + 1}`}
                    />
                  </div>
                </SwiperSlide>
              );
            })
          ) : (
            <SwiperSlide>
              <div className='h-[300px] overflow-hidden rounded-[7px]'>
                <Image
                  src='https://via.placeholder.com/500' // Placeholder image
                  width={1000}
                  height={500}
                  className='w-full h-full object-cover'
                  alt={`Car Image Placeholder`}
                />
              </div>
            </SwiperSlide>
          )}

          <button className='custom-prev group-hover:opacity-100 opacity-0 transition-all duration-300 absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/30 text-black w-8 h-8 rounded-full shadow-md z-10'>
            ❮
          </button>
          <button className='custom-next group-hover:opacity-100 opacity-0 transition-all duration-300 absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/30 text-black w-8 h-8 rounded-full shadow-md z-10'>
            ❯
          </button>

          <div className='flex absolute bottom-1 left-3 z-[10] items-center space-x-2 bg-blue-100 rounded-[4px] h-[24px] pe-3 w-fit my-2'>
            <div className='bg-blue-400 text-[15px] size-[24px] flex items-center justify-center rounded-l-[4px] text-white'>
              <FaTags />
            </div>
            <span className='text-base text-black'>
              {car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł
            </span>
          </div>
        </Swiper>
      </div>
      
      <div className='overflow-hidden rounded-[7px] relative md:hidden'>
        <Image
          src={
            car?.images && car?.images.length > 0
              ? car.images[0]
              : "https://via.placeholder.com/500"
          }
          width={1000}
          height={500}
          className='w-full h-[300px] object-cover'
          alt={`Car Image`}
        />
        {car?.images && car?.images.length > 2 && (
          <div className='grid grid-cols-3 gap-[1px] h-[200px] mt-[1px]'>
            <div className='col-span-2 h-full'>
              <Image
                src={
                  car?.images && car?.images.length > 0
                    ? car.images[1]
                    : "https://via.placeholder.com/500"
                }
                width={1000}
                height={500}
                className='w-full h-full object-cover'
                alt={`Car Image`}
              />
            </div>
            <div className='col-span-1 gap-[1px] h-full'>
              <Image
                src={
                  car?.images && car?.images.length > 0
                    ? car.images[2]
                    : "https://via.placeholder.com/500"
                }
                width={1000}
                height={500}
                className='w-full h-[100px] object-cover'
                alt={`Car Image`}
              />
              <Image
                src={
                  car?.images && car?.images.length > 0
                    ? car.images[3]
                    : "https://via.placeholder.com/500"
                }
                width={1000}
                height={500}
                className='w-full h-[100px] mt-[1px] object-cover'
                alt={`Car Image`}
              />
            </div>
          </div>
        )}

        <div className='flex absolute bottom-1 left-3 z-[10] items-center space-x-2 bg-blue-100 rounded-[4px] h-[24px] pe-3 w-fit my-2'>
          <div className='bg-blue-400 text-[15px] size-[24px] flex items-center justify-center rounded-l-[4px] text-white'>
            <FaTags />
          </div>
          <span className='text-base text-black'>
            {car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł
          </span>
        </div>
      </div>

      <div
        onClick={() => router.push(`/website/cars/${car._id}`)}
        className='relative w-full cursor-pointer overflow-hidden px-2 py-3'
      >
        <div className='flex flex-col'>
          <div className='mb-4 flex-grow'>
            <h2 className='text-2xl font-bold text-gray-800 transition-colors group-hover:text-blue-600'>
              {car.year} {car.make} {car.model}
            </h2>

            <p className='text-sm font-medium text-gray-500'>{car.title}</p>

            <p className='text-base text-gray-600'>{details}</p>

            <div className='mt-1 text-sm text-gray-400'>
              {locationDetails.city &&
                locationDetails.state &&
                `${locationDetails.city}, ${locationDetails.state}`}
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <img
              src='https://static.autotempest.com/prod/build/main/img/at-logos/at-logo-500.a9d7fdcf.png'
              alt='AutoTempest'
              className='w-24'
            />
          </div>
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(car._id);
            }}
            className='absolute right-4 top-4 rounded-full bg-red-100 p-2 text-red-400 transition-all duration-300 hover:bg-red-300 hover:text-red-700'
            aria-label='Delete car'
          >
            <TrashIcon className='h-5 w-5' />
          </button>
        )}
      </div>
    </div>
  );
}
