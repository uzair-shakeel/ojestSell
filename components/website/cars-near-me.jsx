"use client";

import { useState, useEffect } from "react";
import CarCard from "./CarCard";

const CARS = [
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
];

export function CarsNearMe() {
  const [cars, setCars] = useState(CARS);
  const [loading, setLoading] = useState(false);

  // This useEffect will be used when connecting to the API
  // useEffect(() => {
  //   async function fetchCars() {
  //     setLoading(true);
  //     try {
  //       const response = await fetch('/api/cars');
  //       const data = await response.json();
  //       setCars(data.cars);
  //     } catch (error) {
  //       console.error('Error fetching cars:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //
  //   fetchCars();
  // }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Cars For Sale Near Me</h2>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
            View All
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading cars...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
