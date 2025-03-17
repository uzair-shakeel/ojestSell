import { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const vehicles = [
  {
    id: 14,
    name: "BMW 3 Series",
    price: "$47,125",
    image: "/images/bmw-3series.jpg", // Replace with actual image path
  },
  {
    id: 1,
    name: "BMW 2 Series",
    price: "$40,775",
    image: "/images/bmw-2series.jpg",
  },
  {
    id: 2,
    name: "Mercedes-Benz EQE Sedan",
    price: "$76,050",
    image: "/images/mercedes-eqe.jpg",
  },
  {
    id: 3,
    name: "Audi A3",
    price: "$39,495",
    image: "/images/audi-a3.jpg",
  },
  {
    id: 4,
    name: "BMW 2 Series",
    price: "$40,775",
    image: "/images/bmw-2series.jpg",
  },
  {
    id: 5,
    name: "Mercedes-Benz EQE Sedan",
    price: "$76,050",
    image: "/images/mercedes-eqe.jpg",
  },
  {
    id:6,
    name: "Audi A3",
    price: "$39,495",
    image: "/images/audi-a3.jpg",
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
    <div className="relative w-full p-4 ">
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
          className="flex overflow-x-auto gap-4 scroll-smooth scrollbar-hide p-4"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {vehicles.map((car) => (
            <div key={car.id} className="min-w-[250px] md:min-w-[300px] p-2 bg-white shadow-md border">
              <img src={car.image} alt={car.name} className="w-full h-56 object-cover rounded-md" />
              <div className="mt-2">
                <h3 className="font-semibold">{car.name}</h3>
                <p className="text-gray-500">Starting at {car.price}</p>
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
