"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { getCarsByUserId, deleteCar } from "../../../services/carService";
import CarCard from "../../../components/website/CarCard";

export default function DashboardCarsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, userId } = useAuth();
  const [cars, setCars] = useState([]);

  const loadCars = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getCarsByUserId(userId, getToken);
      console.log("responseeeeee", response);
      setCars(response);
    } catch (error) {
      console.error("Error loading cars:", error);
      setCars([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleDelete = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      await deleteCar(carId, getToken);
      loadCars(); // Call loadCars directly without await
    } catch (error) {
      alert("Failed to delete car: " + (error?.message || error));
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadCars();
  }, [userId]);

  // Handle the case when there's no user or still loading
  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-dark-main">
        <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 dark:text-gray-500 font-medium">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto dark:bg-dark-main">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 md:gap-0 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-200 dark:text-white tracking-tight transition-colors">Moje Auta</h1>
          <p className="text-dark-text-secondary mt-2 font-medium transition-colors">Zarządzaj swoją flotą i ogłoszeniami sprzedaży.</p>
        </div>
        <a
          href="/dashboard/cars/add"
          className="bg-blue-600 text-white px-4 sm:px-8 py-2 sm:py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg dark:shadow-blue-900/40 shadow-blue-200 flex items-center  gap-2 hover:-translate-y-1"
        >
          <span className="text-xl">+</span>
          Dodaj Nowe
        </a>
      </div>

      {cars && cars.length > 0 && cars.some((c) => c.status !== "Approved") && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 p-4 text-yellow-800 dark:text-yellow-200 flex items-start gap-3 shadow-sm"
        >
          <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h4 className="font-bold">Oczekiwanie na zatwierdzenie</h4>
            <p className="text-sm mt-1 opacity-90">Niektóre z Twoich ogłoszeń są weryfikowane. Będą widoczne dla kupujących po zaakceptowaniu przez administratora.</p>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 dark:text-gray-500 font-medium animate-pulse">Ładowanie Twoich aut...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 dark:bg-dark-main/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors">
          <div className="w-24 h-24 bg-white dark:bg-dark-main rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <svg
              className="h-10 w-10 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white mb-2">Brak samochodów</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Nie masz jeszcze żadnych ogłoszeń. Dodaj swoje pierwsze auto, aby dotrzeć do kupujących.
          </p>
          <a
            href="/dashboard/cars/add"
            className="inline-flex items-center px-8 py-4 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105 hover:shadow-blue-200"
          >
            Utwórz pierwsze ogłoszenie
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {cars.map((car) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={car._id}
              className="group bg-white dark:bg-dark-panel rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col"
            >
              <div className="mb-4 rounded-xl overflow-hidden shadow-inner flex-grow relative">
                <CarCard car={car} onDelete={handleDelete} />
                {/* Overlay gradient for text readability if needed, but CarCard might handle image */}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700 mt-auto transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</span>
                  {car.status === "Approved" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                      Aktywny
                    </span>
                  ) : car.status === "Pending" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
                      Weryfikacja
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                      Odrzucony
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(car._id)}
                  className="px-4 py-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Usuń
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
