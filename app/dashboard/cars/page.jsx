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
  }, [userId, getToken]);

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
    if (userId) {
      loadCars();
    }
  }, [userId, loadCars]);

  // Handle the case when there's no user or still loading
  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Cars</h1>
        <a
          href="/dashboard/cars/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Car
        </a>
      </div>

      {cars && cars.length > 0 && cars.some((c) => c.status !== "Approved") && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-yellow-900">
          Some of your listings are pending review and are not visible on the public website until approved.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading cars...</span>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No cars found
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first car listing.
          </p>
          <a
            href="/dashboard/cars/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Your First Car Listing
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cars.map((car) => (
            <div key={car._id} className="space-y-2">
              <CarCard car={car} onDelete={handleDelete} />
              <div className="flex items-center justify-between text-sm">
                <div>
                  {car.status === "Approved" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md border border-green-200 bg-green-50 text-green-700">Approved • Visible</span>
                  ) : car.status === "Pending" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-700">Pending approval • Not visible</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 bg-red-50 text-red-700">Rejected • Not visible</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(car._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
