"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import FilterSidebar from "../../../components/website/FilterSidebar";
import FilterNavbar from "../../../components/website/FilterNavbar";
import CarCard from "../../../components/website/CarCard";
import HeroFeaturedCarousel from "../../../components/website/HeroFeaturedCarousel";
import Pagination from "../../../components/website/Pagination";
import Image from "next/image";
import { getAllCars, searchCars } from "../../../services/carService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

// Constants

const SLUG_TO_COUNTRY = {
  "germany": "Niemcy",
  "france": "Francja",
  "belgium": "Belgia",
  "netherlands": "Holandia",
  "italy": "Włochy",
  "australia": "Australia",
  "austria": "Austria",
  "switzerland": "Szwajcaria",
  "sweden": "Szwecja",
  "denmark": "Dania",
  "czech-republic": "Czechy",
  "slovakia": "Słowacja",
  "spain": "Hiszpania",
  "portugal": "Portugalia",
  "united-kingdom": "Wielka Brytania",
  "ireland": "Irlandia",
  "luxembourg": "Luksemburg",
  "finland": "Finlandia",
  "norway": "Norwegia",
  "iceland": "Islandia",
  "hungary": "Węgry",
  "romania": "Rumunia",
  "bulgaria": "Bułgaria",
  "croatia": "Chorwacja",
  "slovenia": "Słowenia",
  "serbia": "Serbia",
  "montenegro": "Czarnogóra",
  "north-macedonia": "Macedonia Północna",
  "albania": "Albania",
  "lithuania": "Litwa",
  "latvia": "Łotwa",
  "estonia": "Estonia",
  "belarus": "Białoruś",
  "ukraine": "Ukraina",
  "united-states": "Stany Zjednoczone",
  "canada": "Kanada",
  "japan": "Japonia",
  "south-korea": "Korea Południowa",
  "china": "Chiny",
  "united-arab-emirates": "Zjednoczone Emiraty Arabskie",
  "dubai": "Dubaj",
  "qatar": "Katar",
  "kuwait": "Kuwejt",
  "saudi-arabia": "Arabia Saudyjska",
  "oman": "Oman",
  "bahrain": "Bahrajn",
  "israel": "Izrael",
  "turkey": "Turcja",
  "kazakhstan": "Kazachstan",
  "georgia": "Gruzja",
  "armenia": "Armenia",
  "azerbaijan": "Azerbejdżan",
  "india": "Indie",
  "russia": "Rosja"
};

const SLUG_TO_ORIGIN = {
  "australia": "Australia",
  "china": "Chiny",
  "czech-republic": "Czechy",
  "france": "Francja",
  "spain": "Hiszpania",
  "netherlands": "Holandia",
  "india": "Indie",
  "japan": "Japonia",
  "canada": "Kanada",
  "south-korea": "Korea Południowa",
  "germany": "Niemcy",
  "russia": "Rosja",
  "romania": "Rumunia",
  "united-states": "Stany Zjednoczone",
  "sweden": "Szwecja",
  "united-kingdom": "Wielka Brytania",
  "italy": "Włochy"
};

// Main Content Component

const CarsContent = () => {
  const { t } = useLanguage();

  // State Management

  // View Mode (Default is Grid)
  const [viewMode, setViewMode] = useState("grid");

  // Data State
  const [allCars, setAllCars] = useState([]);
  const [cars, setCars] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // UI State
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState("best-match");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortListRef = useRef(null);

  // Effects

  // 1. Handle Resize: Ensure View Mode logic
  useEffect(() => {
    const handleResize = () => {
      // Force grid on mobile
      if (window.innerWidth < 768) {
        setViewMode("grid");
      }
      // Note: We removed the 'else { setViewMode("list") }' block 
      // to respect the user's preference or default "grid" on desktop.
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Handle Drag Scroll for Sort List (Desktop/Mobile touch)
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
      const walk = (x - startX) * 1;
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

  // 3. Listen for Custom View Mode Events
  useEffect(() => {
    const onViewMode = (e) => {
      const mode = e.detail;
      if (mode === 'grid' || mode === 'list') setViewMode(mode);
    };
    window.addEventListener('ojest:viewMode', onViewMode);
    return () => window.removeEventListener('ojest:viewMode', onViewMode);
  }, []);

  // 4. Lock Scroll when Mobile Filter is Open
  useEffect(() => {
    if (showMobileFilter) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileFilter]);

  // Helper: Parse URL to API Filters
  const getFiltersFromUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    const apiFilters = {};

    // Helper to get param safely
    const get = (key) => params.get(key);

    // Direct Mappings
    if (get("make")) apiFilters.make = get("make");
    if (get("model")) apiFilters.model = get("model");
    if (get("bodyType") || get("type")) apiFilters.type = get("bodyType") || get("type");
    if (get("fuel")) apiFilters.fuel = get("fuel");

    // FIX: Drivetrain (Frontend now sends English values like FWD, RWD)
    if (get("drivetrain")) apiFilters.drivetrain = get("drivetrain");

    if (get("transmission")) apiFilters.transmission = get("transmission");
    if (get("location")) apiFilters.location = get("location");
    if (get("condition") || get("stan")) apiFilters.condition = get("condition") || get("stan");
    if (get("color")) apiFilters.color = get("color");
    if (get("serviceHistory")) apiFilters.serviceHistory = get("serviceHistory");
    if (get("accidentHistory")) apiFilters.accidentHistory = get("accidentHistory");

    // Numeric Mappings
    if (get("priceFrom")) apiFilters.minPrice = Number(get("priceFrom"));
    if (get("priceTo")) apiFilters.maxPrice = Number(get("priceTo"));

    // Year Mapping
    if (get("yearFrom") || get("minYear")) apiFilters.yearFrom = Number(get("yearFrom") || get("minYear"));
    if (get("yearTo") || get("maxYear")) apiFilters.yearTo = Number(get("yearTo") || get("maxYear"));

    // Default Years logic to ensure valid range for backend
    if (apiFilters.yearFrom && !apiFilters.yearTo) {
      apiFilters.yearTo = new Date().getFullYear() + 1;
    }
    if (!apiFilters.yearFrom && apiFilters.yearTo) {
      apiFilters.yearFrom = 1900;
    }

    if (get("maxDistance") || get("distance")) apiFilters.maxDistance = Number(get("maxDistance") || get("distance"));

    // Mileage Range Mapping
    const mileageRange = get("mileageRange");
    if (mileageRange) {
      if (mileageRange.includes("+")) {
        apiFilters.minMileage = parseInt(mileageRange.replace("+", ""), 10);
      } else if (mileageRange.includes("-")) {
        const [min, max] = mileageRange.split("-");
        apiFilters.minMileage = parseInt(min, 10);
        apiFilters.mileage = parseInt(max, 10); // Map 'max' to API's 'mileage' param
      }
    }

    // FIX: Engine Capacity Range Mapping (Parsing ranges like "2000-3000")
    const engineRange = get("engineCapacityRange");
    if (engineRange) {
      if (engineRange.includes("+")) {
        apiFilters.minEngine = parseInt(engineRange.replace("+", ""), 10);
      } else if (engineRange.includes("-")) {
        const [min, max] = engineRange.split("-");
        apiFilters.minEngine = parseInt(min, 10);
        apiFilters.maxEngine = parseInt(max, 10);
      }
    }

    // FIX: Country/Origin Mapping (Checks for 'krajPochodzenia' and maps slug)
    const origin = get("krajPochodzenia") || get("country") || get("origin");
    if (origin) {
      apiFilters.country = SLUG_TO_ORIGIN[origin] || origin;
    }

    // Manufacturer Country Mapping
    const manufacturer = get("krajProducenta") || get("countryOfManufacturer");
    if (manufacturer) {
      apiFilters.countryOfManufacturer = SLUG_TO_COUNTRY[manufacturer] || manufacturer;
    }

    // Page Sync
    const pageParam = get("page");
    if (pageParam) setCurrentPage(Number(pageParam));

    return apiFilters;
  }, [searchParams]);

  // 5. Fetch Data Effect
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const filters = getFiltersFromUrl();

        // Strategy: Fetch a large batch to allow client-side sorting/pagination accuracy
        filters.limit = 1000;
        filters.page = 1;

        // Cleanup empty keys before sending
        const apiPayload = { ...filters };
        Object.keys(apiPayload).forEach(key => {
          if (apiPayload[key] === undefined || apiPayload[key] === "" || Number.isNaN(apiPayload[key])) {
            delete apiPayload[key];
          }
        });

        const response = await searchCars(apiPayload);

        // Normalize API response
        let fetchedCars = [];
        if (Array.isArray(response)) {
          fetchedCars = response;
        } else if (response?.cars && Array.isArray(response.cars)) {
          fetchedCars = response.cars;
        }

        // Client-Side Filtering (for fields backend might ignore)

        // 1. Price Filtering (Safety net)
        if (filters.minPrice) fetchedCars = fetchedCars.filter(c => (c.financialInfo?.priceNetto || 0) >= filters.minPrice);
        if (filters.maxPrice) fetchedCars = fetchedCars.filter(c => (c.financialInfo?.priceNetto || 0) <= filters.maxPrice);

        // 2. Color Filtering
        if (filters.color) {
          fetchedCars = fetchedCars.filter(c => c.color && c.color.toLowerCase() === filters.color.toLowerCase());
        }

        // 3. Min Mileage Filtering
        if (filters.minMileage !== undefined) {
          fetchedCars = fetchedCars.filter(c => (c.mileage || 0) >= filters.minMileage);
        }

        // 4. Origin/Country Filtering
        if (filters.country) {
          fetchedCars = fetchedCars.filter(c => c.country === filters.country);
        }

        // 5. Engine Capacity Filtering (Client Side Fallback)
        if (filters.minEngine !== undefined || filters.maxEngine !== undefined) {
          fetchedCars = fetchedCars.filter(c => {
            const carEngine = parseInt(c.engine || "0", 10);
            if (filters.minEngine !== undefined && carEngine < filters.minEngine) return false;
            if (filters.maxEngine !== undefined && carEngine > filters.maxEngine) return false;
            return true;
          });
        }

        setAllCars(fetchedCars);
        setTotalItems(fetchedCars.length);

      } catch (err) {
        console.error("Fetch error:", err);
        setError(t("cars.error.tryAgain"));
        setAllCars([]);
        setCars([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getFiltersFromUrl, t]);

  // 6. Sorting & Pagination Effect (Client Side)
  useEffect(() => {
    let data = [...allCars];

    // Sorting
    if (sortBy !== 'best-match') {
      data.sort((a, b) => {
        const priceA = Number(a.financialInfo?.priceNetto || 0);
        const priceB = Number(b.financialInfo?.priceNetto || 0);

        // Clean mileage strings for sorting
        const getMileage = (car) => Number(String(car.mileage || "0").replace(/\D/g, ""));
        const mileA = getMileage(a);
        const mileB = getMileage(b);

        const yearA = Number(a.year || 0);
        const yearB = Number(b.year || 0);

        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);

        switch (sortBy) {
          case "lowest-price": return priceA - priceB;
          case "highest-price": return priceB - priceA;
          case "lowest-mileage": return mileA - mileB;
          case "highest-mileage": return mileB - mileA;
          case "newest-year": return yearB - yearA;
          case "oldest-year": return yearA - yearB;
          case "newest-listed": return dateB - dateA;
          case "oldest-listed": return dateA - dateB;
          default: return 0;
        }
      });
    }

    // Pagination Slicing
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCars = data.slice(startIndex, endIndex);

    setCars(paginatedCars);
  }, [allCars, sortBy, currentPage, itemsPerPage]);

  // Event Handlers

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams();

    // Map UI Keys to URL Keys
    const mapping = {
      make: newFilters.make,
      model: newFilters.model,
      bodyType: newFilters.bodyType || newFilters.type,
      location: newFilters.location,
      maxDistance: newFilters.distance || newFilters.maxDistance,
      yearFrom: newFilters.yearFrom,
      yearTo: newFilters.yearTo,
      priceFrom: newFilters.priceFrom,
      priceTo: newFilters.priceTo,
      stan: newFilters.stan || newFilters.condition,
      fuel: newFilters.fuel,
      transmission: newFilters.transmission,
      drivetrain: newFilters.drivetrain,
      color: newFilters.color,
      serviceHistory: newFilters.serviceHistory,
      accidentHistory: newFilters.accidentHistory,
      mileageRange: newFilters.mileage,
      engineCapacityRange: newFilters.engineCapacity,
      krajPochodzenia: newFilters.krajPochodzenia,
      krajProducenta: newFilters.krajProducenta,
    };

    Object.entries(mapping).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, value);
      }
    });

    params.set("page", "1");
    setCurrentPage(1);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setShowMobileFilter(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Render

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      {/* Hero Section */}
      <HeroFeaturedCarousel />

      {/* Horizontal Filter Navbar */}
      <div className="w-full">
        <FilterNavbar onApplyFilters={handleApplyFilters} />
      </div>

      <div className="max-w-screen-2xl mx-auto sm:py-12 flex flex-row lg:space-x-4 h-full mt-4">
        {/* Desktop Sidebar (Hidden in favor of navbar) */}
        <aside className="w-[380px] hidden sticky top-0 self-start h-fit">
          <FilterSidebar onApplyFilters={handleApplyFilters} />
        </aside>

        {/* Main Content Area */}
        <main className="h-full w-full px-0 sm:px-4">
          {/* Controls: View Toggle & Sort */}
          <div className="bg-white dark:bg-gray-800 flex flex-col lg:flex-row justify-between items-center py-1 pb-2 px-[10px] sm:px-2 gap-2 lg:gap-4">

            {/* View Toggle Buttons */}
            <div className="hidden lg:flex justify-center lg:justify-end w-full lg:w-auto order-1 lg:order-2">
              <div className="bg-white rounded-lg p-1 shadow-sm border flex gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 lg:px-4 lg:py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${viewMode === "grid"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-transparent"
                    }`}
                >
                  {/* Grid Icon */}
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 lg:px-4 lg:py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${viewMode === "list"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-transparent"
                    }`}
                >
                  {/* List Icon */}
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sort Options List */}
            <div className="order-2 lg:order-1 w-full -mt-[28px] lg:mt-4 lg:w-auto">
              <ul ref={sortListRef} className="filter-sorts flex flex-nowrap items-center overflow-x-scroll scroll-x-touch scrollbar-hide whitespace-nowrap -mx-2 px-2 pr-4 gap-2 lg:gap-4 cursor-grab select-none active:cursor-grabbing">
                <li className="sort-option pr-3 flex-none">
                  <button
                    onClick={() => handleSort("best-match")}
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "best-match"
                      ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current"
                      : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"
                      } bg-transparent focus:outline-none appearance-none`}
                  >
                    Najlepsze dopasowanie
                  </button>
                </li>
                {/* Additional Sort Options */}
                <li className="sort-option pr-3 flex-none">
                  <button onClick={() => handleSort("lowest-price")} className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "lowest-price" ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current" : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"} bg-transparent focus:outline-none appearance-none`}>
                    Najniższa cena
                  </button>
                </li>
                <li className="sort-option pr-3 flex-none">
                  <button onClick={() => handleSort("highest-price")} className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "highest-price" ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current" : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"} bg-transparent focus:outline-none appearance-none`}>
                    Najwyższa cena
                  </button>
                </li>
                <li className="sort-option pr-3 flex-none">
                  <button onClick={() => handleSort("lowest-mileage")} className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "lowest-mileage" ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current" : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"} bg-transparent focus:outline-none appearance-none`}>
                    Najniższy przebieg
                  </button>
                </li>
                <li className="sort-option pr-3 flex-none">
                  <button onClick={() => handleSort("highest-mileage")} className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "highest-mileage" ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current" : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"} bg-transparent focus:outline-none appearance-none`}>
                    Najwyższy przebieg
                  </button>
                </li>
                <li className="sort-option pr-3 flex-none">
                  <button onClick={() => handleSort("newest-year")} className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "newest-year" ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current" : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"} bg-transparent focus:outline-none appearance-none`}>
                    Najnowszy rok
                  </button>
                </li>
                <li className="sort-option pr-3 flex-none">
                  <button onClick={() => handleSort("oldest-year")} className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "oldest-year" ? "text-gray-900 dark:text-white border-gray-900 dark:border-white relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:border-b-2 after:border-current" : "text-gray-500 dark:text-gray-300 border-transparent hover:text-gray-700 dark:hover:text-white"} bg-transparent focus:outline-none appearance-none`}>
                    Najstarszy rok
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Car Listing Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid gap-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 -mt-[5px] lg:mt-4"
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
              cars.map((car, index) => (
                <CarCard key={`${index} ${car._id}`} car={car} viewMode={viewMode} />
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
          {!isLoading && !error && totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPage={true}
              className="border-t border-gray-200"
            />
          )}

          {/* Mobile Filter Sidebar Overlay */}
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

// Page Wrapper

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CarsContent />
    </Suspense>
  );
};

export default Page;