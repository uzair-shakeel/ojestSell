import { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const vehicles = [
  {
    id: 14,
    name: "BMW 3 Series",
    price: "$47,125",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replace with actual image path
  },
  {
    id: 1,
    name: "BMW 2 Series",
    price: "$40,775",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    name: "Mercedes-Benz EQE Sedan",
    price: "$76,050",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    name: "Audi A3",
    price: "$39,495",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 4,
    name: "BMW 2 Series",
    price: "$40,775",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    name: "Mercedes-Benz EQE Sedan",
    price: "$76,050",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id:6,
    name: "Audi A3",
    price: "$39,495",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const SimilarVehicles = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
    <div className="relative w-full py-5 sm:py-12">
      <h2 className="text-2xl font-semibold">Similar Vehicles</h2>
      <p className="text-gray-600 text-sm mb-4">Best Compact Croma Turbo for 2025</p>

      {/* Scrollable container */}
      <div className="relative">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
          onClick={scrollLeftFunc}
        >
          <FaChevronLeft size={20} />
        </button>

        <div
  ref={scrollRef}
  className="flex overflow-x-auto gap-4 scroll-smooth scrollbar-hide py-4 "
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
>
  {vehicles.map((car) => (
    <div key={car.id} className="min-w-[250px] md:min-w-[300px] bg-white border box-border overflow-hidden group transition-all hover:shadow-md duration-300 hover:border-gray-300 ">
      <div className="overflow-hidden relative h-56"> {/* Container for the image */}
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="mt-2 p-5">
        <h3 className="font-semibold">{car.name}</h3>
        <p className="text-gray-500">Starting at {car.price}</p>
        <button className="bg-white text-gray-900 font-medium px-4 py-2 mt-2  border border-gray-800">See more</button>
      </div>
    </div>
  ))}
</div>

        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
          onClick={scrollRightFunc}
        >
          <FaChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default SimilarVehicles;
