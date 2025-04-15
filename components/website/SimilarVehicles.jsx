import { useRef, useState , useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getAllCars } from "../../services/carService";
import CarCard from "./CarCard";



const SimilarVehicles = () => {
  const [cars, setCars] = useState([]);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [view, setView] = useState("grid");

 // Load all cars on initial render
  useEffect(() => {
    getAllCars()
      .then((data) => setCars(data))
      .catch((error) => console.error("Error fetching cars:", error));
  }, []);

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
    </div>
  );
};

export default SimilarVehicles;
