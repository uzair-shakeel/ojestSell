"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { useMakesModels } from "../../hooks/useMakesModels";
import { createPortal } from "react-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const COUNTRY_OPTIONS = [
  { value: "albania", label: "Albania" },
  { value: "saudi-arabia", label: "Arabia Saudyjska" },
  { value: "armenia", label: "Armenia" },
  { value: "australia", label: "Australia" },
  { value: "austria", label: "Austria" },
  { value: "azerbaijan", label: "Azerbejdżan" },
  { value: "bahrain", label: "Bahrajn" },
  { value: "belgium", label: "Belgia" },
  { value: "belarus", label: "Białoruś" },
  { value: "bulgaria", label: "Bułgaria" },
  { value: "china", label: "Chiny" },
  { value: "croatia", label: "Chorwacja" },
  { value: "montenegro", label: "Czarnogóra" },
  { value: "czech-republic", label: "Czechy" },
  { value: "denmark", label: "Dania" },
  { value: "dubai", label: "Dubaj" },
  { value: "estonia", label: "Estonia" },
  { value: "finland", label: "Finlandia" },
  { value: "france", label: "Francja" },
  { value: "georgia", label: "Gruzja" },
  { value: "spain", label: "Hiszpania" },
  { value: "netherlands", label: "Holandia" },
  { value: "india", label: "Indie" },
  { value: "ireland", label: "Irlandia" },
  { value: "iceland", label: "Islandia" },
  { value: "israel", label: "Izrael" },
  { value: "japan", label: "Japonia" },
  { value: "canada", label: "Kanada" },
  { value: "qatar", label: "Katar" },
  { value: "kazakhstan", label: "Kazachstan" },
  { value: "south-korea", label: "Korea Południowa" },
  { value: "kuwait", label: "Kuwejt" },
  { value: "lithuania", label: "Litwa" },
  { value: "luxembourg", label: "Luksemburg" },
  { value: "latvia", label: "Łotwa" },
  { value: "north-macedonia", label: "Macedonia Północna" },
  { value: "germany", label: "Niemcy" },
  { value: "norway", label: "Norwegia" },
  { value: "oman", label: "Oman" },
  { value: "portugal", label: "Portugalia" },
  { value: "romania", label: "Rumunia" },
  { value: "serbia", label: "Serbia" },
  { value: "slovakia", label: "Słowacja" },
  { value: "slovenia", label: "Słowenia" },
  { value: "united-states", label: "Stany Zjednoczone" },
  { value: "switzerland", label: "Szwajcaria" },
  { value: "sweden", label: "Szwecja" },
  { value: "turkey", label: "Turcja" },
  { value: "ukraine", label: "Ukraina" },
  { value: "hungary", label: "Węgry" },
  { value: "united-kingdom", label: "Wielka Brytania" },
  { value: "italy", label: "Włochy" },
  { value: "united-arab-emirates", label: "Zjednoczone Emiraty Arabskie" },
];

const ORIGIN_COUNTRY_OPTIONS = [
  { value: "australia", label: "Australia" },
  { value: "china", label: "Chiny" },
  { value: "czech-republic", label: "Czechy" },
  { value: "france", label: "Francja" },
  { value: "spain", label: "Hiszpania" },
  { value: "netherlands", label: "Holandia" },
  { value: "india", label: "Indie" },
  { value: "japan", label: "Japonia" },
  { value: "canada", label: "Kanada" },
  { value: "south-korea", label: "Korea Południowa" },
  { value: "germany", label: "Niemcy" },
  { value: "russia", label: "Rosja" },
  { value: "romania", label: "Rumunia" },
  { value: "united-states", label: "Stany Zjednoczone" },
  { value: "sweden", label: "Szwecja" },
  { value: "united-kingdom", label: "Wielka Brytania" },
  { value: "italy", label: "Włochy" },
];

export default function FilterNavbar({ onApplyFilters }) {
  const { getMakes, getModelsForMake, loading } = useMakesModels();
  const [filters, setFilters] = useState({
    location: "",
    distance: "",
    make: "",
    model: "",
    bodyType: "",
    yearFrom: "",
    yearTo: "",
    stan: "",
    mileage: "",
    drivetrain: "",
    transmission: "",
    fuel: "",
    engineCapacity: "",
    color: "",
    krajProducenta: "",
    krajPochodzenia: "",
    serviceHistory: "",
    accidentHistory: "",
    priceFrom: "",
    priceTo: "",
  });
  const searchParams = useSearchParams();

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState('grid');
  const [isSticky, setIsSticky] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize filters from URL query on first mount
  useEffect(() => {
    if (!searchParams) return;

    // Helper to get param or default to empty string
    const getParam = (key) => searchParams.get(key) || "";

    const newFilters = {
      location: getParam("location"),
      distance: getParam("maxDistance"),
      make: getParam("make"),
      model: getParam("model"),
      bodyType: getParam("bodyType") || getParam("type"), // Handle both
      yearFrom: getParam("yearFrom") || getParam("startYear") || getParam("minYear"),
      yearTo: getParam("yearTo") || getParam("endYear") || getParam("maxYear"),
      stan: getParam("stan") || getParam("condition"),
      mileage: getParam("mileageRange") || "",
      drivetrain: getParam("drivetrain"),
      transmission: getParam("transmission"),
      fuel: getParam("fuel"),
      engineCapacity: getParam("engineCapacityRange") || "",
      color: getParam("color"),
      krajProducenta: getParam("krajProducenta") || getParam("countryOfManufacturer"),
      krajPochodzenia: getParam("krajPochodzenia") || getParam("origin"),
      serviceHistory: getParam("serviceHistory"),
      accidentHistory: getParam("accidentHistory"),
      priceFrom: getParam("priceFrom") || getParam("minPrice"),
      priceTo: getParam("priceTo") || getParam("maxPrice"),
    };

    setFilters((prev) => {
      // Only update if something changed to avoid loops
      if (JSON.stringify(prev) !== JSON.stringify(newFilters)) {
        return { ...prev, ...newFilters };
      }
      return prev;
    });
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };

    // Reset model when make changes
    if (name === 'make') {
      updatedFilters.model = '';
    }

    setFilters(updatedFilters);
    onApplyFilters(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      location: "",
      distance: "",
      make: "",
      model: "",
      bodyType: "",
      yearFrom: "",
      yearTo: "",
      stan: "",
      mileage: "",
      drivetrain: "",
      transmission: "",
      fuel: "",
      engineCapacity: "",
      color: "",
      krajProducenta: "",
      krajPochodzenia: "",
      serviceHistory: "",
      accidentHistory: "",
      priceFrom: "",
      priceTo: "",
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll detection for sticky behavior (mobile only)
  useEffect(() => {
    let originalTop = 0;
    let isInitialized = false;
    let ticking = false;
    let lastScrollY = 0;
    let isStickyState = false;
    const threshold = 10;

    const update = () => {
      ticking = false;

      // Only apply sticky behavior on mobile (screen width < 768px)
      if (window.innerWidth >= 768) {
        if (isStickyState) {
          setIsSticky(false);
          isStickyState = false;
        }
        return;
      }

      if (filterRef.current && !isInitialized) {
        originalTop = filterRef.current.offsetTop;
        // Measure navbar height for spacer
        setNavbarHeight(filterRef.current.offsetHeight);
        isInitialized = true;
      }

      if (filterRef.current && isInitialized) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldStick = scrollTop > originalTop + threshold;

        if (shouldStick !== isStickyState) {
          setIsSticky(shouldStick);
          isStickyState = shouldStick;
        }

        lastScrollY = scrollTop;
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Update navbar height when sticky state changes
  useEffect(() => {
    if (filterRef.current && !isSticky) {
      const currentHeight = filterRef.current.offsetHeight;
      setNavbarHeight(currentHeight);
    }
  }, [isSticky]);

  return (
    <>
      <div
        ref={filterRef}
        className={`bg-white dark:bg-gray-800 z-50 ${isSticky
          ? 'fixed top-0 left-0 right-0 shadow-xl backdrop-blur-sm bg-white/70'
          : 'relative'
          }`}
      >
        <div className={`w-full lg:w-full px-0 lg:px-8 ${isSticky ? 'py-2' : 'py-6'
          }`}>
          {/* Filter Heading with mobile view toggle on the right - Hidden when sticky */}
          {!isSticky && (
            <div className="flex items-center justify-between mx-[10px] mb-[10px]">
              <h2 className="font-bold text-gray-900 dark:text-white text-2xl transition-colors duration-300">Filtrowanie</h2>
              {/* Mobile inline view toggle (adjacent to heading) */}
              <div className="flex md:hidden items-center gap-1 bg-white rounded-md p-1 shadow-sm border">
                <button
                  type="button"
                  onClick={() => { setMobileViewMode('grid'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('ojest:viewMode', { detail: 'grid' })); }}
                  className={`px-2 py-2 rounded-md text-[12px] leading-none font-medium flex items-center justify-center ${mobileViewMode === 'grid' ? 'text-white bg-blue-500' : 'text-gray-600'}`}
                  aria-label="Grid view"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => { setMobileViewMode('list'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('ojest:viewMode', { detail: 'list' })); }}
                  className={`px-2 py-2 rounded-md text-[12px] leading-none font-medium flex items-center justify-center ${mobileViewMode === 'list' ? 'text-white bg-blue-500' : 'text-gray-600'}`}
                  aria-label="List view"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {/* Desktop Layout: First Line - Make Model Type Year */}
            <div className="hidden md:block space-y-1 lg:w-full">
              {/* First row: Make, Model, Body Type, Origin Country (Swapped) */}
              <div className="flex items-center justify-between w-full gap-1 overflow-visible relative">

                {/* Make Filter */}
                <div className="relative flex-1">
                  <select
                    name="make"
                    value={filters.make}
                    onChange={handleInputChange}
                    className="px-2 py-1.5 pr-6 text-sm lg:px-3 lg:py-3 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                    disabled={loading}
                  >
                    <option value="">Marka</option>
                    {getMakes().map((make, index) => (
                      <option key={`${index}, ${make}`} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Model Filter */}
                <div className="relative flex-1">
                  <select
                    name="model"
                    value={filters.model}
                    onChange={handleInputChange}
                    className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                    disabled={loading || !filters.make}
                  >
                    <option value="">Model</option>
                    {filters.make && getModelsForMake(filters.make).map((model, index) => (
                      <option key={`${index}, ${model}`} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Body Type Filter */}
                <div className="relative flex-1">
                  <select
                    name="bodyType"
                    value={filters.bodyType}
                    onChange={handleInputChange}
                    className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                  >
                    <option value="">Typ nadwozia</option>
                    <option value="Bus I Van">Bus I Van</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Crossover">Crossover</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Kabriolet">Kabriolet</option>
                    <option value="Kamper">Kamper</option>
                    <option value="Klasyk">Klasyk</option>
                    <option value="Kombi">Kombi</option>
                    <option value="Kompakt">Kompakt</option>
                    <option value="Limuzyna">Limuzyna</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Sportowe">Sportowe</option>
                    <option value="SUV">SUV</option>
                    <option value="Terenowe">Terenowe</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Origin Country (Kraj Pochodzenia) - Swapped to Row 1 */}
                <div className="relative flex-1">
                  <select
                    name="krajPochodzenia"
                    value={filters.krajPochodzenia}
                    onChange={handleInputChange}
                    className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                  >
                    <option value="">Kraj Pochodzenia</option>
                    {ORIGIN_COUNTRY_OPTIONS.map(({ value, label }, idx) => (
                      <option key={`${idx}-${value}`} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Second Line: Manufacturer Country, Year From, Year To, Color */}
              <div className="flex items-center justify-between w-full gap-1 overflow-visible relative">

                {/* Manufacturer Country (Kraj Producenta) - Swapped to Row 2 */}
                <div className="relative flex-1">
                  <select
                    name="krajProducenta"
                    value={filters.krajProducenta}
                    onChange={handleInputChange}
                    className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                  >
                    <option value="">Kraj Producenta</option>
                    {COUNTRY_OPTIONS.map(({ value, label }, idx) => (
                      <option key={`${idx}-${value}`} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Year From */}
                <div className="relative flex-1">
                  <select
                    name="yearFrom"
                    value={filters.yearFrom}
                    onChange={handleInputChange}
                    className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                  >
                    <option value="">Rok od</option>
                    {Array.from({ length: 30 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Year To */}
                <div className="relative flex-1">
                  <select
                    name="yearTo"
                    value={filters.yearTo}
                    onChange={handleInputChange}
                    className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                  >
                    <option value="">Rok do</option>
                    {Array.from({ length: 30 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Color Filter */}
                <div className="relative flex-1">
                  <select
                    name="color"
                    value={filters.color}
                    onChange={handleInputChange}
                    className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                  >
                    <option value="">Kolor</option>
                    <option value="Biały">Biały</option>
                    <option value="Czarny">Czarny</option>
                    <option value="Srebrny">Srebrny</option>
                    <option value="Szary">Szary</option>
                    <option value="Czerwony">Czerwony</option>
                    <option value="Niebieski">Niebieski</option>
                    <option value="Zielony">Zielony</option>
                    <option value="Żółty">Żółty</option>
                    <option value="Brązowy">Brązowy</option>
                    <option value="Beżowy">Beżowy</option>
                    <option value="Złoty">Złoty</option>
                    <option value="Inny">Inny</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Collapsible Section: Third and Fourth Lines */}
              {isDesktopExpanded && (
                <>
                  {/* Third Row: Mileage, Fuel, Transmission, Engine Capacity */}
                  <div className="flex items-center justify-between w-full gap-1 overflow-visible relative">

                    {/* Mileage (Przebieg) */}
                    <div className="relative flex-1">
                      <select name="mileage" value={filters.mileage} onChange={handleInputChange} className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full">
                        <option value="">Przebieg</option>
                        <option value="0-30000">do 30 000 km</option>
                        <option value="30000-50000">od 30 000 km do 50 000 km</option>
                        <option value="50000-100000">od 50 000 km do 100 000 km</option>
                        <option value="100000-200000">od 100 000 km do 200 000 km</option>
                        <option value="200000+">powyżej 200 000 km</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    {/* Fuel (Typ Paliwa) */}
                    <div className="relative flex-1">
                      <select name="fuel" value={filters.fuel} onChange={handleInputChange} className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full">
                        <option value="">Typ Paliwa</option>
                        <option value="Petrol">Benzyna</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Elektryk</option>
                        <option value="Hybrid">Hybryda</option>
                        <option value="LPG">LPG</option>
                        <option value="Wodór">Wodór</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    {/* Transmission (Skrzynia Biegów) */}
                    <div className="relative flex-1">
                      <select name="transmission" value={filters.transmission} onChange={handleInputChange} className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full">
                        <option value="">Skrzynia Biegów</option>
                        <option value="Automatic">Automat</option>
                        <option value="Manual">Manual</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    {/* Engine Capacity (Pojemność) */}
                    <div className="relative flex-1">
                      <select name="engineCapacity" value={filters.engineCapacity} onChange={handleInputChange} className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full">
                        <option value="">Pojemność</option>
                        <option value="0-1000">do 1000 cm³</option>
                        <option value="1000-2000">1000 - 2000 cm³</option>
                        <option value="2000-3000">2000 - 3000 cm³</option>
                        <option value="3000+">powyżej 3000 cm³</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Fourth Row: Drivetrain, Condition, Price From, Price To */}
                  <div className="flex items-center justify-between w-full gap-1 overflow-visible relative">

                    {/* Drivetrain (Napęd) */}
                    <div className="relative flex-1">
                      <select name="drivetrain" value={filters.drivetrain} onChange={handleInputChange} className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full">
                        <option value="">Napęd</option>
                        <option value="FWD">Przód (FWD)</option>
                        <option value="RWD">Tył (RWD)</option>
                        <option value="AWD">4x4 (AWD)</option>
                        <option value="4WD">4x4 (4WD)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    {/* Condition (Stan) */}
                    <div className="relative flex-1">
                      <select name="stan" value={filters.stan} onChange={handleInputChange} className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full">
                        <option value="">Stan</option>
                        <option value="Used">Używany</option>
                        <option value="New">Nowy</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    {/* Price From (Cena od) */}
                    <div className="relative flex-1">
                      <input type="number" name="priceFrom" value={filters.priceFrom} onChange={handleInputChange} placeholder="Cena od" className="px-2 py-1.5 text-sm lg:px-4 lg:py-3 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full" />
                    </div>

                    {/* Price To (Cena do) */}
                    <div className="relative flex-1">
                      <input type="number" name="priceTo" value={filters.priceTo} onChange={handleInputChange} placeholder="Cena do" className="px-2 py-1.5 text-sm lg:px-4 lg:py-3 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full" />
                    </div>
                  </div>
                </>
              )}

              {/* Reset + Show More buttons (hidden when expanded) */}
              {!showMoreFilters && (
                <div className="hidden md:flex items-center justify-center w-full gap-1">
                  <button
                    onClick={handleReset}
                    className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-md lg:rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-1 justify-center"
                  >
                    Resetuj
                  </button>
                  <button
                    onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
                    className="flex items-center gap-1 lg:gap-2 px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-blue-500 rounded-md lg:rounded-lg focus:outline-none whitespace-nowrap shadow-sm flex-1 justify-center text-white bg-blue-500"
                  >
                    <span className="flex items-center gap-1">
                      Filtry
                    </span>
                    <MdKeyboardArrowDown className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Reset + Show More/Less buttons (Visible always on Desktop) */}
              {/* <div className="hidden md:flex w-full justify-end items-end">
                <button
                  onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
                  aria-expanded={isDesktopExpanded}
                  aria-label="Toggle filters"
                  className="
      group flex items-center gap-2 text-base font-medium
      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      transition-all hover:text-blue-500
    "
                >
                  <span>
                    {isDesktopExpanded ? "Mniej filtrów" : "Więcej filtrów"}
                  </span>

                  <span className="transition-transform duration-300 group-hover:text-blue-500">
                    {isDesktopExpanded ? (
                      <MdKeyboardArrowUp className="w-5 h-5" />
                    ) : (
                      <MdKeyboardArrowDown className="w-5 h-5" />
                    )}
                  </span>
                </button>
              </div> */}

            </div>

            {/* Mobile Layout: Single row with Make, Model, Show More + View Toggle */}
            <div className="md:hidden">
              <div className={`flex items-center justify-between w-[calc(100%-18px)] gap-2 mx-[10px] ${isSticky ? 'mb-0' : 'mb-[10px]'}`}>
                {/* Make */}
                <div className="relative flex-1">
                  <select
                    name="make"
                    value={filters.make}
                    onChange={handleInputChange}
                    className="px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none w-full leading-[17px]"
                  >
                    <option value="">Marka</option>
                    {getMakes().map((make, index) => (
                      <option key={`${index}, ${make}`} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Model */}
                <div className="relative flex-1">
                  <select
                    name="model"
                    value={filters.model}
                    onChange={handleInputChange}
                    className="px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none w-full leading-[17px] transition-all duration-200 hover:border-gray-300"
                  >
                    <option value="">Model</option>
                    {filters.make && getModelsForMake(filters.make).map((model, index) => (
                      <option key={`${index},${model}`} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Show More - Mobile; hidden when expanded */}
                {!showMoreFilters && (
                  <div className="relative flex-1">
                    <button
                      onClick={() => setShowMoreFilters(true)}
                      className="w-full px-3 h-10 pr-6 text-sm font-medium border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 whitespace-nowrap shadow-sm flex items-center justify-start text-white bg-blue-500 leading-[17px] transition-all duration-200 hover:bg-blue-600 hover:shadow-md"
                    >
                      <span className="flex items-center text-left">Filtry</span>
                    </button>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <MdKeyboardArrowDown className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile overlay for filters */}
          {showMoreFilters && isMounted && createPortal(
            <div className="md:hidden fixed inset-0 z-[2147483647]">
              <div className="fixed inset-0 bg-black/40" onClick={() => setShowMoreFilters(false)}></div>
              <div className="fixed inset-0 bg-white shadow-xl p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Filtry</h3>
                  <button onClick={() => setShowMoreFilters(false)} className="text-sm text-gray-600 border border-gray-200 rounded-md px-2 py-1">Zamknij</button>
                </div>
                <div className="space-y-3">
                  {/* Make + Model */}
                  <div className="flex items-center justify-between w-full gap-1">
                    <div className="relative flex-1">
                      <select
                        name="make"
                        value={filters.make}
                        onChange={handleInputChange}
                        className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none"
                        disabled={loading}
                      >
                        <option value="">Marka</option>
                        {getMakes().map((make, index) => (
                          <option key={`${index}, ${make}`} value={make}>
                            {make}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="relative flex-1">
                      <select
                        name="model"
                        value={filters.model}
                        onChange={handleInputChange}
                        className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none"
                        disabled={loading || !filters.make}
                      >
                        <option value="">Model</option>
                        {filters.make && getModelsForMake(filters.make).map((model, index) => (
                          <option key={`${index}, ${model}`} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  {/* Location + Distance */}
                  <div className="flex items-center justify-between w-full gap-1">
                    <div className="relative flex-1">
                      <input type="text" name="location" value={filters.location} onChange={handleInputChange} placeholder="Lokalizacja" className="w-full px-3 h-10 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm" />
                    </div>
                    <div className="relative flex-1">
                      <select name="maxDistance" value={filters.maxDistance} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Dystans</option>
                        <option value="10">Within 10 miles</option>
                        <option value="25">Within 25 miles</option>
                        <option value="50">Within 50 miles</option>
                        <option value="100">Within 100 miles</option>
                        <option value="200">Within 200 miles</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  {/* Year From + Year To */}
                  <div className="flex items-center justify-between w-full gap-1">
                    <div className="relative flex-1">
                      <select name="yearFrom" value={filters.yearFrom} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Rok od</option>
                        {Array.from({ length: 30 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                    </div>
                    <div className="relative flex-1">
                      <select name="yearTo" value={filters.yearTo} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Rok do</option>
                        {Array.from({ length: 30 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  {/* Origin Country (Kraj Pochodzenia) - mobile overlay */}
                  <div className="flex items-center justify-between w-full gap-1">
                    {/* Kraj Pochodzenia (Swapped to first) */}
                    <div className="relative flex-1">
                      <select
                        name="krajPochodzenia"
                        value={filters.krajPochodzenia}
                        onChange={handleInputChange}
                        className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none"
                      >
                        <option value="">Kraj Pochodzenia</option>
                        {ORIGIN_COUNTRY_OPTIONS.map(({ value, label }, idx) => (
                          <option key={`${idx}-${value}`} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    {/* Kraj Producenta (Swapped to second) */}
                    <div className="relative flex-1">
                      <select name="krajProducenta" value={filters.krajProducenta} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Kraj Producenta</option>
                        {COUNTRY_OPTIONS.map(({ value, label }, idx) => (
                          <option key={`${idx}-${value}`} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full gap-1">
                    {/* Body Type Filter */}
                    <div className="relative flex-1">
                      <select
                        name="bodyType"
                        value={filters.bodyType}
                        onChange={handleInputChange}
                        className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                      >
                        <option value="">Typ nadwozia</option>
                        <option value="Bus I Van">Bus I Van</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Crossover">Crossover</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Kabriolet">Kabriolet</option>
                        <option value="Kamper">Kamper</option>
                        <option value="Klasyk">Klasyk</option>
                        <option value="Kombi">Kombi</option>
                        <option value="Kompakt">Kompakt</option>
                        <option value="Limuzyna">Limuzyna</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Sportowe">Sportowe</option>
                        <option value="SUV">SUV</option>
                        <option value="Terenowe">Terenowe</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                    {/* Color (Kolor) */}
                    <div className="relative flex-1">
                      <select
                        name="color"
                        value={filters.color}
                        onChange={handleInputChange}
                        className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none"
                      >
                        <option value="">Kolor</option>
                        <option value="Biały">Biały</option>
                        <option value="Czarny">Czarny</option>
                        <option value="Srebrny">Srebrny</option>
                        <option value="Szary">Szary</option>
                        <option value="Czerwony">Czerwony</option>
                        <option value="Niebieski">Niebieski</option>
                        <option value="Zielony">Zielony</option>
                        <option value="Żółty">Żółty</option>
                        <option value="Brązowy">Brązowy</option>
                        <option value="Beżowy">Beżowy</option>
                        <option value="Złoty">Złoty</option>
                        <option value="Inny">Inny</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Condition + Mileage */}
                  <div className="flex items-center justify-between w-full gap-1">
                    <div className="relative flex-1">
                      <select name="stan" value={filters.stan} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Stan</option>
                        <option value="Demo">Demo</option>
                        <option value="New">Nowy</option>
                        <option value="Used">Używany</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="relative flex-1">
                      <select name="mileage" value={filters.mileage} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Przebieg</option>
                        <option value="0-30000">do 30 000 km</option>
                        <option value="30000-50000">od 30 000 km do 50 000 km</option>
                        <option value="50000-100000">od 50 000 km do 100 000 km</option>
                        <option value="100000-200000">od 100 000 km do 200 000 km</option>
                        <option value="200000+">powyżej 200 000 km</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                    </div>
                  </div>
                  {/* Fuel + Engine */}
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="relative flex-1">
                      <select name="fuel" value={filters.fuel} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Typ Paliwa</option>
                        <option value="Petrol">Benzyna</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Elektryk</option>
                        <option value="Hybrid">Hybryda</option>
                        <option value="LPG">LPG</option>
                        <option value="Wodór">Wodór</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                    </div>
                    <div className="relative flex-1">
                      <select name="engineCapacity" value={filters.engineCapacity} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Pojemność</option>
                        <option value="0-1000">do 1000 cm³</option>
                        <option value="1000-2000">1000 - 2000 cm³</option>
                        <option value="2000-3000">2000 - 3000 cm³</option>
                        <option value="3000+">powyżej 3000 cm³</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                    </div>
                  </div>
                  {/* Transmission + Drivetrain */}
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="relative flex-1">
                      <select name="transmission" value={filters.transmission} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Skrzynia Biegów</option>
                        <option value="Automatic">Automat</option>
                        <option value="Manual">Manual</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                    </div>
                    {/* Drivetrain (Napęd) */}
                    <div className="relative flex-1">
                      <select
                        name="drivetrain"
                        value={filters.drivetrain}
                        onChange={handleInputChange}
                        className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                      >
                        <option value="">Napęd</option>
                        {/* FIX: Values changed to match Database Enums */}
                        <option value="FWD">Przód (FWD)</option>
                        <option value="RWD">Tył (RWD)</option>
                        <option value="AWD">4x4 (AWD)</option>
                        <option value="4WD">4x4 (4WD)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                        <MdKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  {/* Service + Accident */}
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="relative flex-1">
                      <select name="serviceHistory" value={filters.serviceHistory} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Historia Serwisowa</option>
                        <option value="Yes">Tak</option>
                        <option value="No">Nie</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                    </div>
                    <div className="relative flex-1">
                      <select name="accidentHistory" value={filters.accidentHistory} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                        <option value="">Bezwypadkowość</option>
                        <option value="Yes">Tak</option>
                        <option value="No">Nie</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                    </div>
                  </div>
                  {/* Price From + Price To */}
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="relative flex-1">
                      <input type="number" name="priceFrom" value={filters.priceFrom} onChange={handleInputChange} placeholder="Cena od" className="w-full px-3 h-10 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm" />
                    </div>
                    <div className="relative flex-1">
                      <input type="number" name="priceTo" value={filters.priceTo} onChange={handleInputChange} placeholder="Cena do" className="w-full px-3 h-10 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm" />
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={handleReset} className="flex-1 px-3 h-10 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg">Resetuj</button>
                    <button onClick={() => setShowMoreFilters(false)} className="flex-1 px-3 h-10 text-sm font-medium text-white bg-blue-500 border border-blue-500 rounded-lg">Zastosuj</button>
                  </div>
                </div>
              </div>
            </div>,
            typeof window !== 'undefined' ? document.body : null
          )}
        </div>
      </div>
      {isSticky && (
        <div style={{ height: navbarHeight }} />
      )}
    </>
  );
}