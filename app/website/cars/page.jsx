"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import FilterSidebar from "../../../components/website/FilterSidebar";
import FilterNavbar from "../../../components/website/FilterNavbar";
import CarCard from "../../../components/website/CarCard";
import HeroFeaturedCarousel from "../../../components/website/HeroFeaturedCarousel";
import Pagination from "../../../components/website/Pagination";
import Image from "next/image";
import { getAllCars, searchCars } from "../../../services/carService";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const CarsContent = () => {
  const { t } = useLanguage();
  const [view, setView] = useState("list");
  const [cars, setCars] = useState([]);
  const [allCars, setAllCars] = useState([]); // Store all cars for pagination
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [sortBy, setSortBy] = useState("best-match");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // Add view mode state
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const searchParams = useSearchParams();
  const sortListRef = useRef(null);

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

  // Enable drag-to-scroll on the sort list (mobile and desktop)
  useEffect(() => {
    const el = sortListRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onPointerDown = (e) => {
      isDown = true;
      el.classList.add("dragging");
      startX = (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft;
      startScrollLeft = el.scrollLeft;
    };

    const onPointerMove = (e) => {
      if (!isDown) return;
      const x = (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft;
      const walk = (x - startX) * 1; // multiplier for sensitivity
      el.scrollLeft = startScrollLeft - walk;
    };

    const onPointerUp = () => {
      isDown = false;
      el.classList.remove("dragging");
    };

    el.addEventListener("mousedown", onPointerDown, { passive: true });
    el.addEventListener("mousemove", onPointerMove, { passive: true });
    el.addEventListener("mouseleave", onPointerUp, { passive: true });
    el.addEventListener("mouseup", onPointerUp, { passive: true });
    el.addEventListener("touchstart", onPointerDown, { passive: true });
    el.addEventListener("touchmove", onPointerMove, { passive: true });
    el.addEventListener("touchend", onPointerUp, { passive: true });

    return () => {
      el.removeEventListener("mousedown", onPointerDown);
      el.removeEventListener("mousemove", onPointerMove);
      el.removeEventListener("mouseleave", onPointerUp);
      el.removeEventListener("mouseup", onPointerUp);
      el.removeEventListener("touchstart", onPointerDown);
      el.removeEventListener("touchmove", onPointerMove);
      el.removeEventListener("touchend", onPointerUp);
    };
  }, []);

  // Listen for mobile view toggle events from FilterNavbar
  useEffect(() => {
    const onViewMode = (e) => {
      const mode = e.detail;
      if (mode === 'grid' || mode === 'list') setViewMode(mode);
    };
    window.addEventListener('ojest:viewMode', onViewMode);
    return () => window.removeEventListener('ojest:viewMode', onViewMode);
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

        setAllCars(carsData);
        setCurrentPage(1); // Reset to first page when data changes
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

    setAllCars(sortedCars);
    setCurrentPage(1); // Reset to first page when sorting
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
        // Only pass condition to backend if it's the backend-supported values
        condition:
          filters.condition === "New" || filters.condition === "Used"
            ? filters.condition
            : undefined,
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

      // Apply frontend price filtering (support priceFrom/priceTo from FilterNavbar)
      const priceMin =
        filters.minPrice !== undefined && filters.minPrice !== ""
          ? Number(filters.minPrice)
          : filters.priceFrom !== undefined && filters.priceFrom !== ""
          ? Number(filters.priceFrom)
          : undefined;
      const priceMax =
        filters.maxPrice !== undefined && filters.maxPrice !== ""
          ? Number(filters.maxPrice)
          : filters.priceTo !== undefined && filters.priceTo !== ""
          ? Number(filters.priceTo)
          : undefined;

      if (priceMin !== undefined || priceMax !== undefined) {
        carsData = carsData.filter((car) => {
          const price = Number(car.financialInfo?.priceNetto || 0);
          const min = priceMin ?? 0;
          const max = priceMax ?? Infinity;
          return price >= min && price <= max;
        });
      }

      // Apply frontend mileage filtering (supports minMileage/maxMileage from FilterNavbar)
      const uiMileageMin =
        filters.minMileage !== undefined && filters.minMileage !== ""
          ? parseInt(filters.minMileage, 10)
          : undefined;
      const uiMileageMax =
        filters.maxMileage !== undefined && filters.maxMileage !== ""
          ? parseInt(filters.maxMileage, 10)
          : undefined;

      if (uiMileageMin !== undefined || uiMileageMax !== undefined) {
        carsData = carsData.filter((car) => {
          // car.mileage may be a string like "120,000 km"; extract digits
          const numeric = parseInt(String(car.mileage || "0").replace(/[^\d]/g, ""), 10) || 0;
          const min = uiMileageMin ?? 0;
          const max = uiMileageMax ?? Number.MAX_SAFE_INTEGER;
          return numeric >= min && numeric <= max;
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

      // Apply frontend condition filtering for UI values (Excellent/Very Good/Good/Fair/Poor)
      const overallValues = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
      if (overallValues.includes(filters.condition)) {
        carsData = carsData.filter(
          (car) => car?.carCondition?.overall === filters.condition
        );
      }

      setAllCars(carsData);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Failed to apply filters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate paginated cars
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCars = allCars.slice(startIndex, endIndex);

  // Update cars state when pagination changes
  useEffect(() => {
    setCars(paginatedCars);
  }, [allCars, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      {/* Header */}
      <HeroFeaturedCarousel />

      {/* Horizontal Filter Navbar */}
      <div className="w-full ">
        <FilterNavbar onApplyFilters={handleApplyFilters} />
      </div>

      <div className="max-w-screen-2xl mx-auto sm:py-12 flex flex-row lg:space-x-4 h-full mt-4">
        {/* Aside (Desktop Filter Sidebar) - Hidden in favor of horizontal navbar */}
        <aside className="w-[380px] hidden sticky top-0 self-start h-fit">
          <FilterSidebar onApplyFilters={handleApplyFilters} />
        </aside>

        {/* Main Content */}
        <main className="h-full w-full px-0 sm:px-4">
          {/* Header Cards (View Toggle and Sort Options) */}
          <div className="bg-white dark:bg-gray-800 flex flex-col lg:flex-row justify-between items-center py-1 pb-2 px-[10px] sm:px-2 gap-2 lg:gap-4">
            {/* Top on Mobile, Right on Desktop - View Toggle Buttons */}
            <div className="hidden lg:flex justify-center lg:justify-end w-full lg:w-auto order-1 lg:order-2">
              <div className="bg-white rounded-lg p-1 shadow-sm border flex gap-1">
            <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 lg:px-4 lg:py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-transparent"
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
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-transparent"
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
            <div className="order-2  lg:order-1 w-full -mt-[28px] lg:mt-4 lg:w-auto">
              <ul ref={sortListRef} className="filter-sorts flex flex-nowrap items-center overflow-x-scroll scroll-x-touch scrollbar-hide whitespace-nowrap -mx-2 px-2 pr-4 gap-2 lg:gap-4 cursor-grab select-none active:cursor-grabbing">
                <li className="sort-option pr-3 flex-none">
              <button
                    onClick={() => handleSort("best-match")}
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${
                      sortBy === "best-match"
                        ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current"
                        : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"
                    } bg-transparent focus:outline-none appearance-none`}
                  >
                    Najlepsze dopasowanie
              </button>
                </li>
                <li className="sort-option pr-3 flex-none">
              <button
                    onClick={() => handleSort("lowest-price")}
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${
                      sortBy === "lowest-price"
                        ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current"
                        : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"
                    } bg-transparent focus:outline-none appearance-none`}
                  >
                    Najniższa cena
              </button>
                </li>
                <li className="sort-option pr-3 flex-none">
              <button
                    onClick={() => handleSort("highest-price")}
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${
                      sortBy === "highest-price"
                        ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current"
                        : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"
                    } bg-transparent focus:outline-none appearance-none`}
                  >
                    Najwyższa cena
              </button>
                </li>
                <li className="sort-option pr-3 flex-none">
              <button
                    onClick={() => handleSort("lowest-mileage")}
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${
                      sortBy === "lowest-mileage"
                        ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current"
                        : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"
                    } bg-transparent focus:outline-none appearance-none`}
                  >
                    Najniższy przebieg
              </button>
                </li>
                <li className="sort-option pr-3 flex-none">
              <button
                    onClick={() => handleSort("highest-mileage")}
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${
                      sortBy === "highest-mileage"
                        ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current"
                        : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"
                    } bg-transparent focus:outline-none appearance-none`}
                  >
                    Najwyższy przebieg
              </button>
                </li>
                <li className="sort-option pr-3 flex-none">
              <button
                    onClick={() => handleSort("newest-year")}
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${
                      sortBy === "newest-year"
                        ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current"
                        : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"
                    } bg-transparent focus:outline-none appearance-none`}
                  >
                    Najnowszy rok
              </button>
                </li>
                <li className="sort-option pr-3 flex-none">
              <button
                    onClick={() => handleSort("oldest-year")}
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${
                      sortBy === "oldest-year"
                        ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current"
                        : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"
                    } bg-transparent focus:outline-none appearance-none`}
                  >
                    Najstarszy rok
              </button>
                </li>
              </ul>
            </div>
          </div>
          

          {/* Car Cards - Responsive grid/list layout */}
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 -mt-[5px] lg:mt-4"
              : "flex flex-col space-y-4 -mt-[5px] lg:mt-4"
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
          {!isLoading && !error && allCars.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={allCars.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPage={true}
              className="border-t border-gray-200"
            />
          )}

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
