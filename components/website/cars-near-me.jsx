"use client";

import { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CarCard from "./CarCard";
import { getAllCars } from "../../services/carService";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function CarsNearMe() {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
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

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const scrollLeftFunc = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRightFunc = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            {t("homepage.carsNearMe.title")}
          </h2>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
            {t("homepage.carsNearMe.viewAll")}
          </button>
        </div>
        {loading && <p>{t("homepage.carsNearMe.loading")}</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && cars.length === 0 && (
          <p>{t("homepage.carsNearMe.noCars")}</p>
        )}
        {/* Scrollable container */}
        {cars.length > 0 && (
          <div className="relative">
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
              onClick={scrollLeftFunc}
            >
              <FaChevronLeft size={20} />
            </button>

            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-4 scroll-smooth scrollbar-hide py-4"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {cars.map((car) => (
                <CarCard key={car._id} view={view} car={car} />
              ))}
            </div>

            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
              onClick={scrollRightFunc}
            >
              <FaChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
