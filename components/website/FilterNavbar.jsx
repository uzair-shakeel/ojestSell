"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { useMakesModels } from "../../hooks/useMakesModels";
import { createPortal } from "react-dom";

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
  const [mobileViewMode, setMobileViewMode] = useState('grid');
  const [isSticky, setIsSticky] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef(null);
  const filterRef = useRef(null);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize origin from URL (?origin=...)
  useEffect(() => {
    const qpOrigin = searchParams?.get?.("origin");
    if (qpOrigin) {
      setFilters((prev) => ({ ...prev, krajPochodzenia: qpOrigin }));
      onApplyFilters({ ...filters, krajPochodzenia: qpOrigin });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const threshold = 10; // Increased threshold for more stability

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
        
        // Stick when scrolled past original position, unstick when back to original position
        const shouldStick = scrollTop > originalTop + threshold;
        
        // Only update state if it actually changed to prevent blinking
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
      // Measure height when returning to normal position
      const currentHeight = filterRef.current.offsetHeight;
      setNavbarHeight(currentHeight);
    }
  }, [isSticky]);

  const getYearDisplayText = () => {
    if (filters.yearFrom && filters.yearTo) {
      return `${filters.yearFrom} - ${filters.yearTo}`;
    } else if (filters.yearFrom) {
      return `From ${filters.yearFrom}`;
    }
    return "Rok";
  };

  const getMileageDisplayText = () => {
    if (filters.mileage) {
      const mileageOptions = {
        "0": "0 km",
        "0-30000": "do 30 000 km",
        "30000-50000": "od 30 000 km do 50 000 km",
        "50000-100000": "od 50 000 km do 100 000 km",
        "100000+": "powyżej 100 000 km",
        "100000-200000": "od 100 000 km do 200 000 km",
        "200000+": "powyżej 200 000 km"
      };
      return mileageOptions[filters.mileage] || "Przebieg";
    }
    return "Przebieg";
  };

  const getPriceDisplayText = () => {
    if (filters.priceFrom && filters.priceTo) {
      return `${filters.priceFrom} - ${filters.priceTo}`;
    } else if (filters.priceFrom) {
      return `Od ${filters.priceFrom}`;
    } else if (filters.priceTo) {
      return `Do ${filters.priceTo}`;
    }
    return "Cena";
  };
  return (
    <>
    <div 
      ref={filterRef}
      className={`bg-white dark:bg-gray-800 z-50 ${
        isSticky 
          ? 'fixed top-0 left-0 right-0 shadow-xl backdrop-blur-sm bg-white/70' 
          : 'relative'
      }`}
    >
      <div className={`w-full lg:w-full px-0 lg:px-8 ${
        isSticky ? 'py-2' : 'py-6'
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
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-1">
        {/* Desktop Layout: First Line - Make Model Type Year */}
        <div className="hidden md:block lg:w-full">
          {/* First row: Make, Model, Type, Country, Year */}
          <div className="flex items-center justify-between w-full gap-3 overflow-visible relative">

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
                {getMakes().map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                {filters.make && getModelsForMake(filters.make).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Manufacturer Country (Kraj Producenta) */}
            <div className="relative flex-1">
              <select
                name="krajProducenta"
                value={filters.krajProducenta}
                onChange={handleInputChange}
                className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
              >
                <option value="">Kraj Producenta</option>
                <option value="czech">Czechy</option>
                <option value="china">Chiny</option>
                <option value="france">Francja</option>
                <option value="holland">Holandia</option>
                <option value="japan">Japonia</option>
                <option value="south-korea">Korea Południowa</option>
                <option value="germany">Niemcy</option>
                <option value="poland">Polska</option>
                <option value="russia">Rosja</option>
                <option value="sweden">Szwecja</option>
                <option value="united-states">USA</option>
                <option value="united-kingdom">Wielka Brytania</option>
                <option value="italy">Włochy</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Origin Country (Kraj Pochodzenia) */}
            <div className="relative flex-1">
              <select
                name="krajPochodzenia"
                value={filters.krajPochodzenia}
                onChange={handleInputChange}
                className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
              >
                <option value="">Kraj Pochodzenia</option>
                <option value="czech">Czechy</option>
                <option value="china">Chiny</option>
                <option value="france">Francja</option>
                <option value="holland">Holandia</option>
                <option value="japan">Japonia</option>
                <option value="south-korea">Korea Południowa</option>
                <option value="germany">Niemcy</option>
                <option value="poland">Polska</option>
                <option value="russia">Rosja</option>
                <option value="sweden">Szwecja</option>
                <option value="united-states">USA</option>
                <option value="united-kingdom">Wielka Brytania</option>
                <option value="italy">Włochy</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
                <option value="2017">2017</option>
                <option value="2016">2016</option>
                <option value="2015">2015</option>
                <option value="2014">2014</option>
                <option value="2013">2013</option>
                <option value="2012">2012</option>
                <option value="2011">2011</option>
                <option value="2010">2010</option>
                <option value="2009">2009</option>
                <option value="2008">2008</option>
                <option value="2007">2007</option>
                <option value="2006">2006</option>
                <option value="2005">2005</option>
                <option value="2004">2004</option>
                <option value="2003">2003</option>
                <option value="2002">2002</option>
                <option value="2001">2001</option>
                <option value="2000">2000</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
                <option value="2017">2017</option>
                <option value="2016">2016</option>
                <option value="2015">2015</option>
                <option value="2014">2014</option>
                <option value="2013">2013</option>
                <option value="2012">2012</option>
                <option value="2011">2011</option>
                <option value="2010">2010</option>
                <option value="2009">2009</option>
                <option value="2008">2008</option>
                <option value="2007">2007</option>
                <option value="2006">2006</option>
                <option value="2005">2005</option>
                <option value="2004">2004</option>
                <option value="2003">2003</option>
                <option value="2002">2002</option>
                <option value="2001">2001</option>
                <option value="2000">2000</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
            </div>

        {/* Desktop Layout: Second Line - Reset + Show More buttons (hidden when expanded) */}
        {!showMoreFilters && (
          <div className="hidden md:flex items-center justify-center w-full gap-2">
            {/* Reset Button - Desktop only */}
            <button
              onClick={handleReset}
            className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-md lg:rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-1 justify-center"
            >
              Resetuj
            </button>

            {/* Show More Button - Desktop only */}
            <button
              onClick={() => setShowMoreFilters(true)}
            className="flex items-center gap-1 lg:gap-2 px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-blue-500 rounded-md lg:rounded-lg focus:outline-none whitespace-nowrap shadow-sm flex-1 justify-center text-white bg-blue-500"
            >
              <span className="flex items-center gap-1">
              Filtry
              </span>
              <svg className="w-3 h-3 lg:w-4 lg:h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Mobile Layout: Single row with Make, Model, Show More + View Toggle */}
          <div className="md:hidden">
             <div className={`flex items-center justify-between w-[calc(100%-18px)] gap-2 mx-[10px] ${
               isSticky ? 'mb-0' : 'mb-[10px]'
             }`}>
            {/* Make */}
            <div className="relative flex-1">
              <select
                name="make"
                value={filters.make}
                onChange={handleInputChange}
                className="px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none w-full leading-[17px]"
              >
                <option value="">Marka</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Audi">Audi</option>
                <option value="Volkswagen">Volkswagen</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Ford">Ford</option>
                <option value="Nissan">Nissan</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Kia">Kia</option>
                <option value="Mazda">Mazda</option>
                <option value="Subaru">Subaru</option>
                <option value="Lexus">Lexus</option>
                <option value="Infiniti">Infiniti</option>
                <option value="Acura">Acura</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="Wagon">Wagon</option>
                <option value="Pickup">Pickup</option>
                <option value="Crossover">Crossover</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          
        </div>

        {/* Additional Filters - Show/Hide */}
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
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="relative flex-1">
                    <select
                      name="make"
                      value={filters.make}
                      onChange={handleInputChange}
                      className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none"
                      disabled={loading}
                    >
                      <option value="">Marka</option>
                      {getMakes().map((make) => (
                        <option key={make} value={make}>
                          {make}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
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
                      {filters.make && getModelsForMake(filters.make).map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Location + Distance */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="relative flex-1">
                    <input type="text" name="location" value={filters.location} onChange={handleInputChange} placeholder="Lokalizacja" className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm" />
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
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Body Type + Manufacturer Country */}
                <div className="flex items-center justify-between w-full gap-2">
                 <div className="relative flex-1">
                    <select name="yearFrom" value={filters.yearFrom} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Rok od</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                      <option value="2019">2019</option>
                      <option value="2018">2018</option>
                      <option value="2017">2017</option>
                      <option value="2016">2016</option>
                      <option value="2015">2015</option>
                      <option value="2014">2014</option>
                      <option value="2013">2013</option>
                      <option value="2012">2012</option>
                      <option value="2011">2011</option>
                      <option value="2010">2010</option>
                      <option value="2009">2009</option>
                      <option value="2008">2008</option>
                      <option value="2007">2007</option>
                      <option value="2006">2006</option>
                      <option value="2005">2005</option>
                      <option value="2004">2004</option>
                      <option value="2003">2003</option>
                      <option value="2002">2002</option>
                      <option value="2001">2001</option>
                      <option value="2000">2000</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                  <div className="relative flex-1">
                    <select name="yearTo" value={filters.yearTo} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Rok do</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                      <option value="2019">2019</option>
                      <option value="2018">2018</option>
                      <option value="2017">2017</option>
                      <option value="2016">2016</option>
                      <option value="2015">2015</option>
                      <option value="2014">2014</option>
                      <option value="2013">2013</option>
                      <option value="2012">2012</option>
                      <option value="2011">2011</option>
                      <option value="2010">2010</option>
                      <option value="2009">2009</option>
                      <option value="2008">2008</option>
                      <option value="2007">2007</option>
                      <option value="2006">2006</option>
                      <option value="2005">2005</option>
                      <option value="2004">2004</option>
                      <option value="2003">2003</option>
                      <option value="2002">2002</option>
                      <option value="2001">2001</option>
                      <option value="2000">2000</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                  </div>
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="relative flex-1">
                    <select name="bodyType" value={filters.bodyType} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Typ nadwozia</option>
                      <option value="hatchback">Hatchback</option>
<option value="sedan">Sedan</option>
<option value="kombi">Kombi</option>
<option value="coupe">Coupe</option>
<option value="sports">Sports</option>
<option value="limousine">Limousine</option>
<option value="suv">SUV</option>
<option value="convertible">Convertible</option>
<option value="pickup">Pickup</option>
<option value="offroad">Offroad</option>
<option value="bus">Bus</option>
<option value="classic">Classic</option>
<option value="campers">Campers</option>

                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <select name="krajProducenta" value={filters.krajProducenta} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Kraj Producenta</option>
                      <option value="czech">Czechy</option>
                      <option value="china">Chiny</option>
                      <option value="france">Francja</option>
                      <option value="holland">Holandia</option>
                      <option value="japan">Japonia</option>
                      <option value="south-korea">Korea Południowa</option>
                      <option value="germany">Niemcy</option>
                      <option value="poland">Polska</option>
                      <option value="russia">Rosja</option>
                      <option value="sweden">Szwecja</option>
                      <option value="united-states">USA</option>
                      <option value="united-kingdom">Wielka Brytania</option>
                      <option value="italy">Włochy</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                 
                </div>
                {/* Condition + Mileage */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="relative flex-1">
                    <select name="stan" value={filters.stan} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Stan</option>
                      <option value="Demo">Demo</option>
                      <option value="New">Nowy</option>
                      <option value="Used">Używany</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <select name="mileage" value={filters.mileage} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Przebieg</option>
                      <option value="0">0 km</option>
                      <option value="0-30000">do 30 000 km</option>
                      <option value="30000-50000">od 30 000 km do 50 000 km</option>
                      <option value="50000-100000">od 50 000 km do 100 000 km</option>
                      <option value="100000+">powyżej 100 000 km</option>
                      <option value="100000-200000">od 100 000 km do 200 000 km</option>
                      <option value="200000+">powyżej 200 000 km</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                </div>
                {/* Fuel + Engine */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="relative flex-1">
                    <select name="fuel" value={filters.fuel} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Typ Paliwa</option>
                      <option value="Benzyna">Benzyna</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Elektryk">Elektryk</option>
                      <option value="Hybryda">Hybryda</option>
                      <option value="LPG">LPG</option>
                      <option value="Wodór">Wodór</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                  <div className="relative flex-1">
                    <select name="engineCapacity" value={filters.engineCapacity} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Pojemność</option>
                      <option value="0-1000">do 1000 cm³</option>
                      <option value="0-2000">do 2000 cm³</option>
                      <option value="2000-3000">od 2000 cm³ do 3000 cm³</option>
                      <option value="2900+">powyżej 2900 cm³</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
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
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                  <div className="relative flex-1">
                    <select name="drivetrain" value={filters.drivetrain} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Napęd</option>
                      <option value="Przód">Przód</option>
                      <option value="Tył">Tył</option>
                      <option value="4x4/AWD">4x4/AWD</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
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
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                  <div className="relative flex-1">
                    <select name="accidentHistory" value={filters.accidentHistory} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Bezwypadkowość</option>
                      <option value="Yes">Tak</option>
                      <option value="No">Nie</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
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
        {showMoreFilters && (
          <div className="hidden md:block">
            {/* Second Line: Location Distance Condition Mileage */}
            <div className="space-y-0.5 md:space-y-0">
              {/* Mobile: Two selectors per row, Desktop: All in one row */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between w-full gap-1">
                {/* Row 1 Mobile: Location + Distance, Desktop: All in one row */}
                <div className="flex items-center justify-between w-full gap-1 md:gap-0">
              {/* Location Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleInputChange}
                      placeholder="Lokalizacja"
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full"
                />
              </div>

              {/* Distance Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="distance"
                  value={filters.distance}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Dystans</option>
                <option value="100">Do 100 km</option>
                <option value="200">Do 200 km</option>
                <option value="300">Do 300 km</option>
                <option value="500">Do 500 km</option>
                <option value="nationwide">Cały Kraj</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                    </div>
                </div>
              </div>

                {/* Row 2 Mobile: Condition + Mileage, Desktop: All in one row */}
                <div className="flex items-center justify-between w-full gap-1 md:gap-0">
              {/* Condition Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="stan"
                  value={filters.stan}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Stan</option>
                <option value="Demo">Demo</option>
                <option value="New">Nowy</option>
                <option value="Used">Używany</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Mileage Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="mileage"
                  value={filters.mileage}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Przebieg</option>
                <option value="0">0 km</option>
                <option value="0-30000">do 30 000 km</option>
                <option value="30000-50000">od 30 000 km do 50 000 km</option>
                <option value="50000-100000">od 50 000 km do 100 000 km</option>
                <option value="100000+">powyżej 100 000 km</option>
                <option value="100000-200000">od 100 000 km do 200 000 km</option>
                <option value="200000+">powyżej 200 000 km</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
                </div>
              </div>
            </div>

            {/* Third Line: Fuel Engine Color Transmission Drivetrain */}
            <div className="space-y-2 md:space-y-0">
              {/* Mobile: Two selectors per row, Desktop: All in one row */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between w-full gap-2">
                {/* Row 1 Mobile: Fuel + Engine, Desktop: All in one row */}
                <div className="flex items-center justify-between w-full gap-2 md:gap-0">
              {/* Fuel Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="fuel"
                  value={filters.fuel}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Typ Paliwa</option>
                <option value="Benzyna">Benzyna</option>
                <option value="Diesel">Diesel</option>
                <option value="Elektryk">Elektryk</option>
                <option value="Hybryda">Hybryda</option>
                <option value="LPG">LPG</option>
                <option value="Wodór">Wodór</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Engine Capacity Filter (Pojemność) */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="engineCapacity"
                  value={filters.engineCapacity}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Pojemność</option>
                <option value="0-1000">do 1000 cm³</option>
                <option value="0-2000">do 2000 cm³</option>
                <option value="2000-3000">od 2000 cm³ do 3000 cm³</option>
                <option value="2900+">powyżej 2900 cm³</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                    </div>
                </div>
              </div>

              {/* Color Filter */}
              <div className="flex items-center justify-between w-full gap-2 md:gap-0">
                <div className="relative flex-1 mx-0.5 my-0.5">
                  <select
                    name="color"
                    value={filters.color}
                    onChange={handleInputChange}
                    className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                  >
                    <option value="">Kolor</option>
                    <option value="bialy">Biały</option>
                    <option value="czarny">Czarny</option>
                    <option value="srebrny">Srebrny</option>
                    <option value="szary">Szary</option>
                    <option value="czerwony">Czerwony</option>
                    <option value="niebieski">Niebieski</option>
                    <option value="zielony">Zielony</option>
                    <option value="zolty">Żółty</option>
                    <option value="brazowy">Brązowy</option>
                    <option value="inny">Inny</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

                {/* Row 2 Mobile: Transmission + Drivetrain, Desktop: All in one row */}
                <div className="flex items-center justify-between w-full gap-2 md:gap-0">
              {/* Transmission Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="transmission"
                  value={filters.transmission}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Skrzynia Biegów</option>
                <option value="Automatic">Automat</option>
                <option value="Manual">Manual</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Drivetrain Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="drivetrain"
                  value={filters.drivetrain}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Napęd</option>
                <option value="Przód">Przód</option>
                <option value="Tył">Tył</option>
                <option value="4x4/AWD">4x4/AWD</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Line: Kraj Pochodzenia (Origin Country) */}
            <div className="space-y-2 md:space-y-0 mt-1">
              <div className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between w-full gap-2">
                <div className="flex items-center justify-between w-full gap-2 md:gap-0">
                  <div className="relative flex-1 mx-0.5 my-0.5">
                    <select
                      name="krajPochodzenia"
                      value={filters.krajPochodzenia}
                      onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                    >
                      <option value="">Kraj Pochodzenia</option>
                      <option value="czech">Czechy</option>
                      <option value="china">Chiny</option>
                      <option value="france">Francja</option>
                      <option value="holland">Holandia</option>
                      <option value="japan">Japonia</option>
                      <option value="south-korea">Korea Południowa</option>
                      <option value="germany">Niemcy</option>
                      <option value="poland">Polska</option>
                      <option value="russia">Rosja</option>
                      <option value="sweden">Szwecja</option>
                      <option value="united-states">USA</option>
                      <option value="united-kingdom">Wielka Brytania</option>
                      <option value="italy">Włochy</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                      <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fourth Line: Service History Accident History Price */}
            <div className="space-y-2 md:space-y-0">
              {/* Mobile: Two selectors per row, Desktop: All in one row */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between w-full gap-2">
                {/* Row 1 Mobile: Service History + Accident History, Desktop: All in one row */}
                <div className="flex items-center justify-between w-full gap-2 md:gap-0">
              {/* Service History Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="serviceHistory"
                  value={filters.serviceHistory}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                    >
                    <option value="">Historia Serwisowa</option>
                    <option value="Yes">Tak</option>
                    <option value="No">Nie</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Accident History Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="accidentHistory"
                  value={filters.accidentHistory}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Bezwypadkowość</option>
                <option value="Yes">Tak</option>
                <option value="No">Nie</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                    </div>
                </div>
              </div>

                {/* Row 2 Mobile: Price From + Price To, Desktop: All in one row */}
                <div className="flex items-center justify-between w-full gap-2 md:gap-0">
              {/* Price From */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <input
                  type="number"
                  name="priceFrom"
                  value={filters.priceFrom}
                  onChange={handleInputChange}
                  placeholder="Cena od"
                  className="w-full px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>

              {/* Price To */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <input
                  type="number"
                  name="priceTo"
                  value={filters.priceTo}
                  onChange={handleInputChange}
                  placeholder="Cena do"
                  className="w-full px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>

            </div>
              </div>
            </div>

            {/* Reset and Show Less Buttons - At the end of additional filters */}
            <div className="flex items-center justify-center w-full gap-2 mt-2">
        {/* Reset Button */}
          <button
            onClick={handleReset}
                className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-md lg:rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-1 justify-center"
              >
                Resetuj
              </button>

              {/* Show Less Button */}
              <button
                onClick={() => setShowMoreFilters(false)}
                className="flex items-center gap-1 lg:gap-2 px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-blue-500 rounded-md lg:rounded-lg focus:outline-none whitespace-nowrap shadow-sm flex-1 justify-center text-white bg-blue-500"
              >
                <span className="flex items-center gap-1">
                  Pokaż mniej
                </span>
                <svg className="w-3 h-3 lg:w-4 lg:h-4 transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
          </button>
        </div>

        </div>
        )}


      </div>
    </div>
    </div>
    {isSticky && (
      <div style={{ height: navbarHeight }} />
    )}
    </>
  );
}