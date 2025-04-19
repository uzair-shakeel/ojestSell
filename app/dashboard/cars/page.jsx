"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useAuth, } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { getCarsByUserId } from "../../../services/carService";
import CarCard from "../../../components/website/CarCard";

export default function DashboardCarsPage() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, userId } = useAuth();
  const [cars, setCars] = useState([]);

  const loadCars = async () => {
    try {
      const response = await getCarsByUserId(userId, getToken);
      setCars(response);
    } catch (error) {
      console.error("Error loading cars:", error);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
    }
    if (userId) {
      loadCars();
    }
  }, [isLoaded, userId, loadCars]);

  // Handle the case when there's no user or still loading
  if (isLoading || !user) {
    return <div>Loading...</div>;
  }


  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Cars</h1>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     {cars.map((car) => (
        <CarCard key={car._id} car={car} />
      ))}
     </div>
    </div>
  );

}
