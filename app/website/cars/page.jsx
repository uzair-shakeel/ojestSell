"use client";
import { useState, useEffect } from "react";
import FilterSidebar from "../../../components/website/FilterSidebar";
import CarCard from "../../../components/website/CarCard";
import Image from "next/image";
import { getAllCars, searchCars } from "../../../services/carService";

const Page = () => {
  const [view, setView] = useState("list");
  const [cars, setCars] = useState([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Handle responsive view toggle (list/grid) based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setView("grid");
      } else {
        setView("list");
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load all cars on initial render
  useEffect(() => {
    getAllCars()
      .then((data) => setCars(data))
      .catch((error) => console.error("Error fetching cars:", error));
  }, []);

  // Handle filter application from FilterSidebar
  const handleApplyFilters = async (queryParams) => {
    try {
      const filteredCars = await searchCars(queryParams);
      setCars(filteredCars);
      setShowMobileFilter(false); // Close mobile filter after applying
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  return (
    <div className="w-full min-h-screen h-auto bg-white p-2 sm:p-5">
      {/* Header */}
      <section className="relative max-w-screen-2xl mx-auto h-[300px] md:h-[400px] w-[98%] my-[10px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/result.jpg"
            alt="Car sales hero image"
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>
        <div className="relative z-10 container h-full flex flex-col justify-center items-end py-[90px] md:py-[120px] text-center text-white">
          <h1 className="z-10 text-white sm:text-4xl md:text-5xl text-3xl font-bold max-w-3xl xl:text-start text-center">
            Find your dream car easily with advanced search filters.
          </h1>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto sm:py-12 flex flex-row lg:space-x-4 h-full mt-4">
        {/* Aside (Desktop Filter Sidebar) */}
        <aside className="w-[380px] hidden lg:block sticky top-0 self-start h-fit">
          <FilterSidebar onApplyFilters={handleApplyFilters} />
        </aside>

        {/* Main Content */}
        <main className="h-full w-full sm:px-4">
          {/* Header Cards (Filter Button and Sort Dropdown) */}
          <div className="sticky top-0 z-10 bg-white/40 backdrop-blur-sm flex justify-between items-center py-2 pb-4 px-2">
            <button
              onClick={() => setShowMobileFilter(true)}
              className="text-base bg-blue-600 text-white font-medium px-7 py-2 rounded lg:hidden block"
            >
              Filter
            </button>
            <select className="flex items-center border border-black rounded bg-transparent px-7 py-2 text-black font-medium">
              <option value="relevance">Sort by</option>
              <option value="price">Price</option>
              <option value="mileage">Mileage</option>
              <option value="year">Year</option>
            </select>
          </div>

          {/* Car Cards */}
          <div className={`grid gap-7 grid-cols-1`}>
            {cars.length > 0 ? (
              cars.map((car) => <CarCard key={car._id} view={view} car={car} />)
            ) : (
              <p className="text-center text-gray-500">No cars found.</p>
            )}
          </div>

          {/* Pagination */}
          <div className="w-full flex justify-center items-center py-8">
            <div className="join">
              <button className="join-item btn">«</button>
              <button className="join-item btn btn-active">1</button>
              <button className="join-item btn">2</button>
              <button className="join-item btn">3</button>
              <button className="join-item btn">4</button>
              <button className="join-item btn">»</button>
            </div>
          </div>

          {/* Mobile Filter Sidebar */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Filters</h2>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
              <FilterSidebar onApplyFilters={handleApplyFilters} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;