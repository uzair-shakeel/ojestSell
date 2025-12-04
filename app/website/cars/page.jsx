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

const CarsContent = () => {
  const { t } = useLanguage();
  const [view, setView] = useState("list");

  // Functional State
  const [cars, setCars] = useState([]); // Displayed cars (paginated)
  const [allCars, setAllCars] = useState([]); // All fetched cars (for client-side sort)
  const [totalItems, setTotalItems] = useState(0);

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [sortBy, setSortBy] = useState("best-match");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filter State
  const [activeFilters, setActiveFilters] = useState({});

  const router = useRouter();
  const pathname = usePathname();

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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileFilter]);

  // FUNCTIONAL LOGIC: URL Params Initialization
  useEffect(() => {
    const initialFilters = {};
    const getParam = (key) => searchParams.get(key);

    const make = getParam("make");
    const model = getParam("model");
    const type = getParam("type") || getParam("bodyType");
    
    const minPrice = getParam("minPrice") || getParam("priceFrom");
    const maxPrice = getParam("maxPrice") || getParam("priceTo");
    
    const yearFrom = getParam("yearFrom") || getParam("minYear") || getParam("startYear");
    const yearTo = getParam("yearTo") || getParam("maxYear") || getParam("endYear");
    
    const fuel = getParam("fuel");
    const transmission = getParam("transmission");
    const location = getParam("location");
    const distance = getParam("maxDistance");
    const condition = getParam("stan") || getParam("condition");
    const drivetrain = getParam("drivetrain");
    const color = getParam("color");
    const serviceHistory = getParam("serviceHistory");
    const accidentHistory = getParam("accidentHistory");

    // Range strings from FilterNavbar (e.g., "30000-50000")
    const mileageRange = getParam("mileageRange");
    const engineCapacityRange = getParam("engineCapacityRange");

    // Country params
    const origin = getParam("krajPochodzenia") || getParam("origin");
    const manufacturer = getParam("krajProducenta") || getParam("countryOfManufacturer");

    if (make) initialFilters.make = make;
    if (model) initialFilters.model = model;
    if (type) initialFilters.bodyType = type;
    if (minPrice) initialFilters.priceFrom = minPrice;
    if (maxPrice) initialFilters.priceTo = maxPrice;
    if (yearFrom) initialFilters.yearFrom = yearFrom;
    if (yearTo) initialFilters.yearTo = yearTo;
    if (fuel) initialFilters.fuel = fuel;
    if (transmission) initialFilters.transmission = transmission;
    if (location) initialFilters.location = location;
    if (distance) initialFilters.maxDistance = distance;
    if (condition) initialFilters.condition = condition;
    if (drivetrain) initialFilters.drivetrain = drivetrain;
    if (color) initialFilters.color = color;
    if (serviceHistory) initialFilters.serviceHistory = serviceHistory;
    if (accidentHistory) initialFilters.accidentHistory = accidentHistory;

    // Handle range strings if present
    if (mileageRange) initialFilters.mileageRange = mileageRange;
    if (engineCapacityRange) initialFilters.engineCapacityRange = engineCapacityRange;

    if (manufacturer) {
      initialFilters.countryOfManufacturer = SLUG_TO_COUNTRY[manufacturer] || manufacturer;
    }

    if (origin) {
      initialFilters.krajPochodzenia = SLUG_TO_ORIGIN[origin] || origin;
    }

    setActiveFilters(initialFilters);
  }, [searchParams]);

  // FUNCTIONAL LOGIC: Data Fetching
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryFilters = { ...activeFilters };

      // API mapping for bodyType
      if (queryFilters.bodyType) {
        queryFilters.type = queryFilters.bodyType;
        delete queryFilters.bodyType;
      }

      // Handle Mileage Range Parsing for API
      // If we have a range string from the navbar dropdown (e.g., "30000-50000")
      if (queryFilters.mileageRange) {
        if (queryFilters.mileageRange.includes("+")) {
           // e.g., "100000+"
           queryFilters.minMileage = parseInt(queryFilters.mileageRange.replace("+", ""));
        } else if (queryFilters.mileageRange.includes("-")) {
          const [min, max] = queryFilters.mileageRange.split("-");
          queryFilters.minMileage = parseInt(min);
          queryFilters.maxMileage = parseInt(max);
        } else {
           // "0"
           queryFilters.minMileage = 0;
        }
        delete queryFilters.mileageRange;
      }

      // Handle Engine Capacity Range Parsing for API
      if (queryFilters.engineCapacityRange) {
        if (queryFilters.engineCapacityRange.includes("+")) {
          queryFilters.minEngineCapacity = parseInt(queryFilters.engineCapacityRange.replace("+", ""));
        } else if (queryFilters.engineCapacityRange.includes("-")) {
          const [min, max] = queryFilters.engineCapacityRange.split("-");
          queryFilters.minEngineCapacity = parseInt(min);
          queryFilters.maxEngineCapacity = parseInt(max);
        }
        delete queryFilters.engineCapacityRange;
      }

      // Map specific keys to what searchCars likely expects
      if (queryFilters.yearFrom) queryFilters.minYear = queryFilters.yearFrom;
      if (queryFilters.yearTo) queryFilters.maxYear = queryFilters.yearTo;
      if (queryFilters.priceFrom) queryFilters.minPrice = queryFilters.priceFrom;
      if (queryFilters.priceTo) queryFilters.maxPrice = queryFilters.priceTo;
      
      // Remove original keys after mapping if necessary, or keep them if API is flexible.
      // Keeping original keys usually doesn't hurt.

      // Fetch large batch for client-side pagination/sorting
      queryFilters.limit = 1000;
      queryFilters.page = 1;

      // Clean undefined/empty values
      Object.keys(queryFilters).forEach(key => {
        if (queryFilters[key] === undefined || queryFilters[key] === "" || queryFilters[key] === null) delete queryFilters[key];
      });

      let response = await searchCars(queryFilters);

      // Normalize response
      let fetchedCars = [];
      if (Array.isArray(response)) {
        fetchedCars = response;
      } else if (response?.cars && Array.isArray(response.cars)) {
        fetchedCars = response.cars;
      }

      // Client-side filter for Origin (Country) if API misses it
      const originParam = activeFilters.krajPochodzenia;
      if (originParam) {
        fetchedCars = fetchedCars.filter(c => c?.country === originParam || c?.origin === originParam);
      }

      // Client-side filter for Price (double check)
      if (activeFilters.priceFrom || activeFilters.priceTo) {
        const min = activeFilters.priceFrom ? Number(activeFilters.priceFrom) : 0;
        const max = activeFilters.priceTo ? Number(activeFilters.priceTo) : Infinity;
        fetchedCars = fetchedCars.filter(c => {
          const price = Number(c.financialInfo?.priceNetto || 0);
          return price >= min && price <= max;
        });
      }

      setAllCars(fetchedCars);
      setTotalItems(fetchedCars.length);

    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Failed to load cars. Please try again.");
      setAllCars([]);
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters]);

  // Trigger fetch when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // FUNCTIONAL LOGIC: Sorting & Pagination (Client Side)
  useEffect(() => {
    let data = [...allCars];

    // Sorting logic
    if (sortBy !== 'best-match') {
      data.sort((a, b) => {
        switch (sortBy) {
          case "lowest-price":
            return (a.financialInfo?.priceNetto || 0) - (b.financialInfo?.priceNetto || 0);
          case "highest-price":
            return (b.financialInfo?.priceNetto || 0) - (a.financialInfo?.priceNetto || 0);
          case "lowest-mileage":
            const mA = parseInt(String(a.mileage || "0").replace(/[^\d]/g, ""), 10);
            const mB = parseInt(String(b.mileage || "0").replace(/[^\d]/g, ""), 10);
            return mA - mB;
          case "highest-mileage":
            const mHA = parseInt(String(a.mileage || "0").replace(/[^\d]/g, ""), 10);
            const mHB = parseInt(String(b.mileage || "0").replace(/[^\d]/g, ""), 10);
            return mHB - mHA;
          case "newest-year":
            return (b.year || 0) - (a.year || 0);
          case "oldest-year":
            return (a.year || 0) - (b.year || 0);
          case "newest-listed":
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case "oldest-listed":
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          default:
            return 0;
        }
      });
    }

    // Pagination Logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCars = data.slice(startIndex, endIndex);

    setCars(paginatedCars);
  }, [allCars, sortBy, currentPage, itemsPerPage]);


  const handleSort = (sortValue) => {
    setSortBy(sortValue);
    setCurrentPage(1); // Reset to first page on sort
  };

  const handleApplyFilters = (newFilters) => {
    // Map incoming filter structure from Navbar/Sidebar to URL params
    const mappedFilters = {
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
      // Map the dropdown range strings directly to URL so the Navbar can read them back
      mileageRange: newFilters.mileage, 
      engineCapacityRange: newFilters.engineCapacity,
      
      krajPochodzenia: newFilters.krajPochodzenia,
      krajProducenta: newFilters.krajProducenta,
    };

    // Clean undefined/empty keys
    const params = new URLSearchParams();
    Object.entries(mappedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, value);
      }
    });

    // Update the URL without reloading the page
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    
    // activeFilters will be updated via the useEffect hook listening to searchParams
    setCurrentPage(1); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); 
  };

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
                  className={`px-3 py-2 lg:px-4 lg:py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${viewMode === "grid"
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
                  className={`px-3 py-2 lg:px-4 lg:py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${viewMode === "list"
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
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "best-match"
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
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "lowest-price"
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
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "highest-price"
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
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "lowest-mileage"
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
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "highest-mileage"
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
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "newest-year"
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
                    className={`text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 ${sortBy === "oldest-year"
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