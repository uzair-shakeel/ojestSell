"use client";

import { useState, useEffect } from "react";
import { getRecommendedCars } from "../../services/carService";
import CarCard from "./CarCard";

const SimilarVehicles = ({ carId }) => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    if (!carId) return;
    let cancelled = false;

    getRecommendedCars(carId)
      .then((data) => {
        if (!cancelled) setCars(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch((error) => console.error("Error fetching similar cars:", error));

    return () => {
      cancelled = true;
    };
  }, [carId]);

  if (!cars.length) return null;

  return (
    <div className="space-y-3 py-2">
      {cars.map((car) => (
        <CarCard key={car._id} car={car} />
      ))}
    </div>
  );
};

export default SimilarVehicles;
