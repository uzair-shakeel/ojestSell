'use client'
import { motion } from "framer-motion";
import React from "react";


const page = () => {
  const vehicles = [
    {
      id: 14,
      name: "BMW 3 Series",
      price: "$47,125",
      image:
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replace with actual image path
    },
    {
      id: 1,
      name: "BMW 2 Series",
      price: "$40,775",
      image:
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      name: "Mercedes-Benz EQE Sedan",
      price: "$76,050",
      image:
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 3,
      name: "Audi A3",
      price: "$39,495",
      image:
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 4,
      name: "BMW 2 Series",
      price: "$40,775",
      image:
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 5,
      name: "Mercedes-Benz EQE Sedan",
      price: "$76,050",
      image:
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 6,
      name: "Audi A3",
      price: "$39,495",
      image:
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div>
      <div className="min-h-screen grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {vehicles.map((car) => (
          <div
            key={car.id}
            
            className="min-w-[250px] shadow-md md:min-w-[300px] rounded bg-white border box-border overflow-hidden group transition-all hover:shadow-md duration-300 border-gray-300 "
          >
            <motion.div
             initial={{ y:-30, opacity:0}}
             animate={{ y:0,  opacity:1}}
             transition={{ duration: 0.4 }}
            className="overflow-hidden relative h-56">
              {" "}
              {/* Container for the image */}
              <img
              
                src={car.image}
                alt={car.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </motion.div>
            <motion.div 
            initial={{ x:-30, opacity:0}}
            animate={{ x:0,  opacity:1}}
            transition={{ duration: 0.4 }}
             className="mt-2 p-5">
              <h3 className="font-semibold">{car.name}</h3>
              <p className="text-gray-500">{car.price}</p>
             <div className="flex gap-2 mt-3">
             <button className="bg-white text-gray-900 font-medium px-4 py-1 rounded-sm  border border-gray-800">
                Edit
              </button>
              <button className="bg-red-600 text-white font-medium px-4 py-1 rounded-sm border border-red-600">
                Delete
              </button>
             </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
