"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { FaTh, FaThList } from "react-icons/fa";
import FilterSidebar from "../../../components/website/FilterSidebar";
import CarCard from "../../../components/website/CarCard";
import Image from "next/image";

const page = () => {
  const [view, setView] = useState("list");
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [cars, setCars] = useState([
    {
      id: 1,
      name: "Toyota RAV4",
      images: [
        "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?q=80&w=2067&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
      ],
      price: 28500,
      rating: 4.8,
      reviews: 124,
      seats: 5,
      transmission: "Auto",
      fuel: "Hybrid",
      year: 2023,
      mileage: 12500,
      engineSize: "2.5L",
    },
    {
      id: 2,
      name: "Ford Mustang",
      images: [
        "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1547245324-d777c6f05e80?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop",
      ],
      price: 42800,
      rating: 4.9,
      reviews: 87,
      seats: 4,
      transmission: "Auto",
      fuel: "Petrol",
      year: 2022,
      mileage: 8700,
      engineSize: "5.0L",
    },
    {
      id: 3,
      name: "Lamborghini Huracan",
      images: [
        "https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?q=80&w=2073&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517994112540-009c47ea476b?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518987048-93e29699e79a?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=2037&auto=format&fit=crop",
      ],
      price: 215000,
      rating: 5.0,
      reviews: 32,
      seats: 2,
      transmission: "Auto",
      fuel: "Petrol",
      year: 2023,
      mileage: 3200,
      engineSize: "5.2L",
    },
    {
      id: 4,
      name: "Toyota Supra",
      images: [
        "https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?q=80&w=2073&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2072&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=2064&auto=format&fit=crop",
      ],
      price: 58900,
      rating: 4.7,
      reviews: 56,
      seats: 2,
      transmission: "Manual",
      fuel: "Petrol",
      year: 2022,
      mileage: 15600,
      engineSize: "3.0L",
    },
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setView("grid");
      } else {
        setView("list");
      }
    };

    handleResize(); // initial check

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="w-full min-h-screen h-auto bg-white p-2 sm:p-5">
      {/* Hero Banner Section with Image */}
      <section className="relative max-w-screen-2xl mx-auto h-[300px]  md:h-[400px] w-[98%]  my-[10px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/result.jpg"
            alt="Car sales hero image"
            fill
            className="object-cover brightness-75 "
            priority
          />
        </div>

        <div className="relative z-10 container h-full flex flex-col justify-center items-end py-[90px] md:py-[120px] text-center text-white">
          <h1 className="z-10 text-white sm:text-4xl pt-24 md:pt-0 md:text-5xl text-3xl font-bold  max-w-2xl xl:text-start text-center ">
            Find your dream car easily with advanced search filters.
          </h1>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto sm:py-12 flex flex-row lg:space-x-4 h-full mt-4">
        {/* aside */}
        <aside className="w-[380px] hidden lg:block sticky top-0 self-start h-fit">
          <FilterSidebar />
        </aside>
        {/* main */}
        <main className="h-full w-full sm:px-4">
          {/* header cards */}
          <div className="sticky top-0 z-10 bg-white/40 backdrop-blur-sm flex justify-between items-center py-2 pb-4 px-2">
            <button
              onClick={() => setShowMobileFilter(true)}
              className="text-base bg-blue-600 text-white font-medium px-7 py-2 rounded lg:hidden block"
            >
              Filter
            </button>

            <select className="flex items-center border border-black rounded bg-transparent px-7 py-2 text-black font-medium">
              <option value="relevance">Sort by</option>
              <option value="price">Price</option>
              <option value="mileage">Mileage</option>
              <option value="year">Year</option>
            </select>
          </div>

          {/* cards */}
          <div
            className={`grid gap-7 ${
              view === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {cars.map((car) => (
              <CarCard key={car.id} car={car} view={view} />
            ))}
          </div>
          {/* Pagination */}
          <div className="w-full flex justify-center items-center py-8">
            <div className="join">
              <button className="join-item btn">«</button>
              <button className="join-item btn btn-active">1</button>
              <button className="join-item btn">2</button>
              <button className="join-item btn">3</button>
              <button className="join-item btn">4</button>
              <button className="join-item btn">»</button>
            </div>
          </div>
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Filters</h2>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
              <FilterSidebar />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default page;
