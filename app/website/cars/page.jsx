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
  const [sortBy, setSortBy] = useState("relevance");

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

  // Control body scrolling based on filter visibility
  useEffect(() => {
    if (showMobileFilter) {
      // Disable scrolling when filter is open
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling when filter is closed
      document.body.style.overflow = "auto";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileFilter]);

  // Handle sorting
  const handleSort = (value) => {
    setSortBy(value);
    let sortedCars = [...cars];

    switch (value) {
      case "price":
        sortedCars.sort(
          (a, b) => a.financialInfo.priceNetto - b.financialInfo.priceNetto
        );
        break;
      case "mileage":
        sortedCars.sort((a, b) => Number(a.mileage) - Number(b.mileage));
        break;
      case "year":
        sortedCars.sort((a, b) => Number(b.year) - Number(a.year));
        break;
      default:
        // For relevance, we'll use the original order from the API
        getAllCars()
          .then((data) => setCars(data))
          .catch((error) => console.error("Error fetching cars:", error));
        return;
    }

    setCars(sortedCars);
  };

  // Load all cars on initial render
  useEffect(() => {
    getAllCars()
      .then((data) => {
        setCars(data);
        // Apply initial sorting if needed
        if (sortBy !== "relevance") {
          handleSort(sortBy);
        }
      })
      .catch((error) => console.error("Error fetching cars:", error));
  }, []);

  // Handle filter application from FilterSidebar
  const handleApplyFilters = async (queryParams) => {
    try {
      // Get all cars first
      const allCars = await getAllCars();

      // Client-side filtering
      const filteredCars = allCars.filter((car) => {
        // Basic matching function for string values
        const matches = (value, filter) => {
          if (!filter) return true;
          if (!value) return false;
          return String(value)
            .toLowerCase()
            .includes(String(filter).toLowerCase());
        };

        // Numeric range matching function
        const inRange = (value, min, max) => {
          if (!value) return false;
          const numValue = Number(value);
          if (min && max)
            return numValue >= Number(min) && numValue <= Number(max);
          if (min) return numValue >= Number(min);
          if (max) return numValue <= Number(max);
          return true;
        };

        // Check each filter condition
        const makeMatch = matches(car.make, queryParams.make);
        const modelMatch = matches(car.model, queryParams.model);
        const typeMatch = matches(car.type, queryParams.type);

        // Year range check
        const yearMatch = inRange(
          car.year,
          queryParams.yearFrom,
          queryParams.yearTo
        );

        // Mileage range check
        const mileageMatch = inRange(
          car.mileage,
          queryParams.minMileage,
          queryParams.maxMileage
        );

        // Exact matches for specific fields
        const conditionMatch =
          !queryParams.condition || car.condition === queryParams.condition;
        const drivetrainMatch =
          !queryParams.drivetrain || car.drivetrain === queryParams.drivetrain;
        const transmissionMatch =
          !queryParams.transmission ||
          car.transmission === queryParams.transmission;
        const fuelMatch = !queryParams.fuel || car.fuel === queryParams.fuel;
        const engineMatch = matches(car.engine, queryParams.engine);
        const serviceHistoryMatch =
          !queryParams.serviceHistory ||
          car.serviceHistory === queryParams.serviceHistory;
        const accidentHistoryMatch =
          !queryParams.accidentHistory ||
          car.accidentHistory === queryParams.accidentHistory;

        // Return true only if all specified filters match
        return (
          makeMatch &&
          modelMatch &&
          typeMatch &&
          yearMatch &&
          mileageMatch &&
          conditionMatch &&
          drivetrainMatch &&
          transmissionMatch &&
          fuelMatch &&
          engineMatch &&
          serviceHistoryMatch &&
          accidentHistoryMatch
        );
      });

      // Update the cars state with filtered results
      setCars(filteredCars);

      // Apply current sorting if needed
      if (sortBy !== "relevance") {
        handleSort(sortBy);
      }

      // Close mobile filter if it's open
      setShowMobileFilter(false);
    } catch (error) {
      console.error("Error applying filters:", error);
      // If there's an error, try to at least show all cars
      getAllCars()
        .then((data) => setCars(data))
        .catch((err) => console.error("Error fetching all cars:", err));
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
            <select
              className="flex items-center border border-black rounded bg-transparent px-7 py-2 text-black font-medium"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
            >
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
          <div className="w-full flex bg-white justify-center items-center py-8">
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
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
              <FilterSidebar
                onApplyFilters={handleApplyFilters}
                setShowMobileFilter={setShowMobileFilter}
                isVisible={showMobileFilter}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
