"use client";
import { useState, useEffect, Suspense } from "react";
import FilterSidebar from "../../../components/website/FilterSidebar";
import FilterNavbar from "../../../components/website/FilterNavbar";
import CarCard from "../../../components/website/CarCard";
import Image from "next/image";
import { getAllCars, searchCars } from "../../../services/carService";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const CarsContent = () => {
  const { t } = useLanguage();
  const [view, setView] = useState("list");
  const [cars, setCars] = useState([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [sortBy, setSortBy] = useState("best-match");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // Add view mode state
  const searchParams = useSearchParams();

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

  // Handle URL parameters and initial load
  useEffect(() => {
    const fetchCarsWithFilters = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchQuery = searchParams.get("search");
        const make = searchParams.get("make");
        const model = searchParams.get("model");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const minYear = searchParams.get("minYear");
        const maxYear = searchParams.get("maxYear");
        const fuel = searchParams.get("fuel");
        const transmission = searchParams.get("transmission");
        const location = searchParams.get("location");

        let carsData;

        if (
          searchQuery ||
          make ||
          model ||
          minPrice ||
          maxPrice ||
          minYear ||
          maxYear ||
          fuel ||
          transmission ||
          location
        ) {
          // Use search with filters - map to service interface
          const searchParams_obj = {
            make: make || undefined,
            model: model || undefined,
            yearFrom: minYear || undefined,
            yearTo: maxYear || undefined,
            transmission: transmission || undefined,
            fuel: fuel || undefined,
            location: location || undefined,
          };

          // Remove undefined values
          Object.keys(searchParams_obj).forEach((key) => {
            if (searchParams_obj[key] === undefined) {
              delete searchParams_obj[key];
            }
          });

          carsData = await searchCars(searchParams_obj);
        } else {
          // Use getAllCars for initial load
          carsData = await getAllCars();
        }

        setCars(carsData);
      } catch (err) {
        console.error("Error fetching cars:", err);
        setError("Failed to load cars. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarsWithFilters();
  }, [searchParams]);

  // Handle sorting
  const handleSort = (sortValue) => {
    setSortBy(sortValue);

    let sortedCars = [...cars];

    switch (sortValue) {
      case "lowest-price":
        sortedCars.sort(
          (a, b) =>
            (a.financialInfo?.priceNetto || 0) -
            (b.financialInfo?.priceNetto || 0)
        );
        break;
      case "highest-price":
        sortedCars.sort(
          (a, b) =>
            (b.financialInfo?.priceNetto || 0) -
            (a.financialInfo?.priceNetto || 0)
        );
        break;
      case "lowest-mileage":
        sortedCars.sort((a, b) => {
          const mileageA = parseInt(a.mileage?.replace(/[^\d]/g, "") || "0");
          const mileageB = parseInt(b.mileage?.replace(/[^\d]/g, "") || "0");
          return mileageA - mileageB;
        });
        break;
      case "highest-mileage":
        sortedCars.sort((a, b) => {
          const mileageA = parseInt(a.mileage?.replace(/[^\d]/g, "") || "0");
          const mileageB = parseInt(b.mileage?.replace(/[^\d]/g, "") || "0");
          return mileageB - mileageA;
        });
        break;
      case "newest-year":
        sortedCars.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case "oldest-year":
        sortedCars.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      case "newest-listed":
        sortedCars.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case "oldest-listed":
        sortedCars.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        break;
      default:
        // best-match - keep original order
        break;
    }

    setCars(sortedCars);
  };

  // Handle filter application
  const handleApplyFilters = async (filters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Map filter parameters to match the searchCars service interface
      const searchParams_obj = {
        make: filters.make || undefined,
        model: filters.model || undefined,
        yearFrom: filters.yearFrom || undefined,
        yearTo: filters.yearTo || undefined,
        type: filters.type || undefined,
        condition: filters.condition || undefined,
        mileageMin: filters.minMileage
          ? parseInt(filters.minMileage)
          : undefined,
        mileageMax: filters.maxMileage
          ? parseInt(filters.maxMileage)
          : undefined,
        drivetrain: filters.drivetrain || undefined,
        transmission: filters.transmission || undefined,
        fuel: filters.fuel || undefined,
        engine: filters.engine || undefined,
        serviceHistory: filters.serviceHistory || undefined,
        accidentHistory: filters.accidentHistory || undefined,
        // Location params (if needed)
        ...(filters.latitude && filters.longitude
          ? {
              latitude: filters.latitude,
              longitude: filters.longitude,
              maxDistance: filters.maxDistance,
            }
          : {}),
      };

      // Remove undefined values
      Object.keys(searchParams_obj).forEach((key) => {
        if (searchParams_obj[key] === undefined) {
          delete searchParams_obj[key];
        }
      });

      let carsData = await searchCars(searchParams_obj);

      // Ensure carsData is an array
      if (!Array.isArray(carsData)) {
        console.error("searchCars returned non-array data:", carsData);
        carsData = [];
      }

      // Apply frontend price filtering if price filters are specified
      if (filters.minPrice || filters.maxPrice) {
        carsData = carsData.filter((car) => {
          const price = car.financialInfo?.priceNetto || 0;
          const minPrice = filters.minPrice || 0;
          const maxPrice = filters.maxPrice || Infinity;
          return price >= minPrice && price <= maxPrice;
        });
      }

      // Apply frontend filtering for other unsupported filters
      if (filters.doors) {
        carsData = carsData.filter((car) => car.doors === filters.doors);
      }
      if (filters.color) {
        carsData = carsData.filter((car) => car.color === filters.color);
      }
      if (filters.horsepower) {
        carsData = carsData.filter(
          (car) => car.horsepower === filters.horsepower
        );
      }
      if (filters.seats) {
        carsData = carsData.filter((car) => car.seats === filters.seats);
      }

      setCars(carsData);
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Failed to apply filters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {/* <section className="relative max-w-screen-2xl mx-auto h-[300px] md:h-[400px] w-[98%] my-[10px] rounded-2xl overflow-hidden">
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
            Find your dream car easily with advanced search filters.sss
          </h1>
        </div>
      </section> */}

      {/* Horizontal Filter Navbar */}
      <div className="w-full">
        <FilterNavbar onApplyFilters={handleApplyFilters} />
      </div>

      <div className="max-w-screen-2xl mx-auto sm:py-12 flex flex-row lg:space-x-4 h-full mt-4">
        {/* Aside (Desktop Filter Sidebar) - Hidden in favor of horizontal navbar */}
        <aside className="w-[380px] hidden sticky top-0 self-start h-fit">
          <FilterSidebar onApplyFilters={handleApplyFilters} />
        </aside>

        {/* Main Content */}
        <main className="h-full w-full sm:px-4">
          {/* Header Cards (View Toggle and Sort Options) */}
          <div className="sticky top-0 z-10 bg-white/40 backdrop-blur-sm flex flex-col lg:flex-row justify-between items-center py-1 pb-2 px-2 gap-2 lg:gap-4">
            {/* Top on Mobile, Right on Desktop - View Toggle Buttons */}
            <div className="flex justify-center lg:justify-end w-full lg:w-auto order-1 lg:order-2">
              <div className="bg-white rounded-lg p-1 shadow-sm border flex gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 lg:px-4 lg:py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 lg:px-4 lg:py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom on Mobile, Left on Desktop - Sort Inline List */}
            <div className="flex items-center justify-between w-full overflow-hidden order-2 lg:order-1 lg:w-auto lg:space-x-3 lg:justify-start mt-4 lg:mt-4">
              <button
                onClick={() => handleSort("best-match")}
                className={`text-[9px] lg:text-sm font-light transition-all duration-200 hover:text-black whitespace-nowrap flex-1 lg:flex-none text-center px-1 lg:px-0 ${
                  sortBy === "best-match"
                    ? "text-black border-b-2 border-black pb-0.5"
                    : "text-gray-600"
                }`}
              >
                Najlepszy dopasowanie
              </button>
              <button
                onClick={() => handleSort("lowest-price")}
                className={`text-[9px] lg:text-xs font-light transition-all duration-200 hover:text-black whitespace-nowrap flex-1 lg:flex-none text-center px-1 lg:px-0 ${
                  sortBy === "lowest-price"
                    ? "text-black border-b-2 border-black pb-0.5"
                    : "text-gray-600"
                }`}
              >
                Najlepszy dopasowanie
              </button>
              <button
                onClick={() => handleSort("highest-price")}
                className={`text-[9px] lg:text-xs font-light transition-all duration-200 hover:text-black whitespace-nowrap flex-1 lg:flex-none text-center px-1 lg:px-0 ${
                  sortBy === "highest-price"
                    ? "text-black border-b-2 border-black pb-0.5"
                    : "text-gray-600"
                }`}
              >
                Najlepszy dopasowanie
              </button>
              <button
                onClick={() => handleSort("lowest-mileage")}
                className={`text-[9px] lg:text-xs font-light transition-all duration-200 hover:text-black whitespace-nowrap flex-1 lg:flex-none text-center px-1 lg:px-0 ${
                  sortBy === "lowest-mileage"
                    ? "text-black border-b-2 border-black pb-0.5"
                    : "text-gray-600"
                }`}
              >
                Najlepszy dopasowanie
              </button>
              <button
                onClick={() => handleSort("highest-mileage")}
                className={`text-[9px] lg:text-xs font-light transition-all duration-200 hover:text-black whitespace-nowrap flex-1 lg:flex-none text-center px-1 lg:px-0 ${
                  sortBy === "highest-mileage"
                    ? "text-black border-b-2 border-black pb-0.5"
                    : "text-gray-600"
                }`}
              >
                Najlepszy dopasowanie
              </button>
              <button
                onClick={() => handleSort("newest-year")}
                className={`text-[9px] lg:text-xs font-light transition-all duration-200 hover:text-black whitespace-nowrap flex-1 lg:flex-none text-center px-1 lg:px-0 ${
                  sortBy === "newest-year"
                    ? "text-black border-b-2 border-black pb-0.5"
                    : "text-gray-600"
                }`}
              >
                Najlepszy dopasowanie
              </button>
              <button
                onClick={() => handleSort("oldest-year")}
                className={`text-[9px] lg:text-xs font-light transition-all duration-200 hover:text-black whitespace-nowrap flex-1 lg:flex-none text-center px-1 lg:px-0 ${
                  sortBy === "oldest-year"
                    ? "text-black border-b-2 border-black pb-0.5"
                    : "text-gray-600"
                }`}
              >
                Najlepszy dopasowanie
              </button>
            </div>
          </div>

          {/* Car Cards - Responsive grid/list layout */}
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1"
                : "flex flex-col space-y-4"
            }
          >
            {isLoading ? (
              <div className="text-center py-8">
                <div
                  className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{t("cars.loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t("cars.error.tryAgain")}
                </button>
              </div>
            ) : cars.length > 0 ? (
              cars.map((car) => (
                <CarCard key={car._id} car={car} viewMode={viewMode} />
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">
                  {t("cars.noResults.title")}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t("cars.noResults.message")}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="w-full flex bg-white justify-center items-center py-8">
            <div className="join">
              <button className="join-item btn btn-ghost text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-0 appearance-none [-webkit-tap-highlight-color:transparent]">
                «
              </button>
              <button className="join-item btn bg-gray-200 text-gray-900 border border-gray-300 focus:outline-none focus:ring-0 appearance-none [-webkit-tap-highlight-color:transparent]">
                1
              </button>
              <button className="join-item btn btn-ghost text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-0 appearance-none [-webkit-tap-highlight-color:transparent]">
                2
              </button>
              <button className="join-item btn btn-ghost text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-0 appearance-none [-webkit-tap-highlight-color:transparent]">
                3
              </button>
              <button className="join-item btn btn-ghost text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-0 appearance-none [-webkit-tap-highlight-color:transparent]">
                4
              </button>
              <button className="join-item btn btn-ghost text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-0 appearance-none [-webkit-tap-highlight-color:transparent]">
                »
              </button>
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

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CarsContent />
    </Suspense>
  );
};

export default Page;
