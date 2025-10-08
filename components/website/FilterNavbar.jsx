"use client";
import { useState, useEffect, useRef } from "react";
import { useMakesModels } from "../../hooks/useMakesModels";
import { createPortal } from "react-dom";

export default function FilterNavbar({ onApplyFilters }) {
  const { getMakes, getModelsForMake, loading } = useMakesModels();
  const [filters, setFilters] = useState({
    location: "",
    maxDistance: "",
    make: "",
    model: "",
    type: "",
    yearFrom: "",
    yearTo: "",
    condition: "",
    minMileage: "",
    maxMileage: "",
    drivetrain: "",
    transmission: "",
    fuel: "",
    engine: "",
    serviceHistory: "",
    accidentHistory: "",
    priceFrom: "",
    priceTo: "",
  });

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMileageDropdown, setShowMileageDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState('grid');
  const [isSticky, setIsSticky] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const mileageDropdownRef = useRef(null);
  const priceDropdownRef = useRef(null);
  const filterRef = useRef(null);
  useEffect(() => {
    setIsMounted(true);
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
      maxDistance: "",
      make: "",
      model: "",
      type: "",
      yearFrom: "",
      yearTo: "",
      condition: "",
      minMileage: "",
      maxMileage: "",
      drivetrain: "",
      transmission: "",
      fuel: "",
      engine: "",
      serviceHistory: "",
      accidentHistory: "",
      priceFrom: "",
      priceTo: "",
    };
    setFilters(resetFilters);
    setShowYearDropdown(false);
    setShowMileageDropdown(false);
    setShowPriceDropdown(false);
    onApplyFilters(resetFilters);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreFilters(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
      if (mileageDropdownRef.current && !mileageDropdownRef.current.contains(event.target)) {
        setShowMileageDropdown(false);
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        setShowPriceDropdown(false);
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
    if (filters.minMileage && filters.maxMileage) {
      return `${filters.minMileage} - ${filters.maxMileage}`;
    } else if (filters.minMileage) {
      return `Od ${filters.minMileage}`;
    } else if (filters.maxMileage) {
      return `Do ${filters.maxMileage}`;
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
      className={`bg-white z-50 ${
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
            <h2 className="font-bold text-gray-900 text-2xl">Filtrowanie</h2>
            {/* Mobile inline view toggle (adjacent to heading) */}
            <div className="flex md:hidden items-center gap-0.5 bg-white rounded-md p-0.5 shadow-sm border">
              <button
                type="button"
                onClick={() => { setMobileViewMode('grid'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('ojest:viewMode', { detail: 'grid' })); }}
                className={`px-1.5 py-1 rounded-md text-[11px] leading-none font-medium flex items-center justify-center ${mobileViewMode === 'grid' ? 'text-white bg-blue-500' : 'text-gray-600'}`}
                aria-label="Grid view"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => { setMobileViewMode('list'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('ojest:viewMode', { detail: 'list' })); }}
                className={`px-1.5 py-1 rounded-md text-[11px] leading-none font-medium flex items-center justify-center ${mobileViewMode === 'list' ? 'text-white bg-blue-500' : 'text-gray-600'}`}
                aria-label="List view"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-1">
        {/* Desktop Layout: First Line - Make Model Type Year */}
        <div className="hidden md:block lg:w-full">
          {/* First row: Make, Model, Type, Year */}
          <div className="flex items-center justify-between w-full gap-3 overflow-visible relative">
            {/* Make Filter */}
            <div className="relative flex-1">
              <select
                name="make"
                value={filters.make}
                onChange={handleInputChange}
                className="px-2 py-1.5 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                className="px-2 py-1.5 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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

            {/* Type Filter */}
            <div className="relative flex-1">
              <select
                name="type"
                value={filters.type}
                onChange={handleInputChange}
                className="px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
              >
              <option value="">Typ</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Certified">Certified</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Year Button with Dropdown */}
            <div className="relative flex-1 overflow-visible" ref={yearDropdownRef}>
              <button
                onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMileageDropdown(false); setShowPriceDropdown(false); }}
                className={`w-full px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm text-left ${
                  showYearDropdown || filters.yearFrom || filters.yearTo
                    ? 'text-black bg-white border-blue-300' 
                    : 'text-gray-700 bg-white'
                }`}
              >
                {getYearDisplayText()}
              </button>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                <svg className={`w-3 h-3 lg:w-4 lg:h-4 text-gray-400 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {showYearDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 max-h-72 overflow-y-auto pointer-events-auto">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rok od</label>
                      <select
                        name="yearFrom"
                        value={filters.yearFrom}
                        onChange={handleInputChange}
                        className="w-full px-3 h-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 leading-[17px]"
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
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Roku do</label>
                      <select
                        name="yearTo"
                        value={filters.yearTo}
                        onChange={handleInputChange}
                        className="w-full px-3 h-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 leading-[17px]"
                      >
                        <option value="">Roku Do </option>
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
                    </div>
                  </div>
                </div>
              )}
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
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
                {/* Type + Year */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="relative flex-1">
                    <select name="type" value={filters.type} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Typ</option>
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                      <option value="Certified">Certified</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div className="relative flex-1 overflow-visible" ref={yearDropdownRef}>
                    <button onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMileageDropdown(false); setShowPriceDropdown(false); }} className={`w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none shadow-sm text-left ${showYearDropdown || filters.yearFrom || filters.yearTo ? 'text-black bg-white border-blue-300' : 'text-gray-700 bg-white'}`}>{getYearDisplayText()}</button>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className={`w-3 h-3 text-gray-400 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    {showYearDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-full z-50 pointer-events-auto">
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rok od</label>
                            <select name="yearFrom" value={filters.yearFrom} onChange={handleInputChange} className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md focus:outline-none">
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
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Roku do</label>
                            <select name="yearTo" value={filters.yearTo} onChange={handleInputChange} className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md focus:outline-none">
                              <option value="">Roku Do </option>
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
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Condition + Mileage */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="relative flex-1">
                    <select name="condition" value={filters.condition} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Stan</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div className="relative flex-1 overflow-visible" ref={mileageDropdownRef}>
                    <button onClick={() => { setShowMileageDropdown(!showMileageDropdown); setShowYearDropdown(false); setShowPriceDropdown(false); }} className={`w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none shadow-sm text-left ${showMileageDropdown || filters.minMileage || filters.maxMileage ? 'text-black bg-white border-blue-300' : 'text-gray-700 bg-white'}`}>{getMileageDisplayText()}</button>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className={`w-3 h-3 text-gray-400 transition-transform ${showMileageDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    {showMileageDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-72 overflow-y-auto pointer-events-auto z-50">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" name="minMileage" value={filters.minMileage} onChange={handleInputChange} placeholder="Min" className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md focus:outline-none" />
                          <input type="number" name="maxMileage" value={filters.maxMileage} onChange={handleInputChange} placeholder="Max" className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md focus:outline-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Fuel + Engine */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="relative flex-1">
                    <select name="fuel" value={filters.fuel} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Paliwo Typ</option>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                      <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                      <option value="CNG">CNG</option>
                      <option value="LPG">LPG</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                  <div className="relative flex-1">
                    <select name="engine" value={filters.engine} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Silnik</option>
                      <option value="1.0L">1.0L</option>
                      <option value="1.2L">1.2L</option>
                      <option value="1.4L">1.4L</option>
                      <option value="1.6L">1.6L</option>
                      <option value="1.8L">1.8L</option>
                      <option value="2.0L">2.0L</option>
                      <option value="2.2L">2.2L</option>
                      <option value="2.4L">2.4L</option>
                      <option value="2.5L">2.5L</option>
                      <option value="3.0L">3.0L</option>
                      <option value="3.5L">3.5L</option>
                      <option value="4.0L">4.0L</option>
                      <option value="4.5L">4.5L</option>
                      <option value="5.0L">5.0L</option>
                      <option value="6.0L">6.0L</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                </div>
                {/* Transmission + Drivetrain */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="relative flex-1">
                    <select name="transmission" value={filters.transmission} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Skrzynia Biegów</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                  <div className="relative flex-1">
                    <select name="drivetrain" value={filters.drivetrain} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none">
                      <option value="">Przewodnik</option>
                      <option value="FWD">FWD</option>
                      <option value="RWD">RWD</option>
                      <option value="AWD">AWD</option>
                      <option value="4WD">4WD</option>
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
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                </div>
                {/* Price */}
                <div className="w-full">
                  <div className="relative overflow-visible" ref={priceDropdownRef}>
                    <button onClick={() => { setShowPriceDropdown(!showPriceDropdown); setShowYearDropdown(false); setShowMileageDropdown(false); }} className={`w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none shadow-sm text-left ${showPriceDropdown || filters.priceFrom || filters.priceTo ? 'text-black bg-white border-blue-300' : 'text-gray-700 bg-white'}`}>{getPriceDisplayText()}</button>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className={`w-3 h-3 text-gray-400 transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    {showPriceDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-72 overflow-y-auto pointer-events-auto z-50">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" name="priceFrom" value={filters.priceFrom} onChange={handleInputChange} placeholder="Min" className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md focus:outline-none" />
                          <input type="number" name="priceTo" value={filters.priceTo} onChange={handleInputChange} placeholder="Max" className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md focus:outline-none" />
                        </div>
                      </div>
                    )}
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
                  name="maxDistance"
                  value={filters.maxDistance}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Dystans</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
                <option value="200">Within 200 miles</option>
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
                  name="condition"
                  value={filters.condition}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Stan</option>
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Mileage Button with Dropdown */}
              <div className="relative flex-1 mx-0.5 my-0.5" ref={mileageDropdownRef}>
                <button
                  onClick={() => { setShowMileageDropdown(!showMileageDropdown); setShowYearDropdown(false); setShowPriceDropdown(false); }}
                  className={`w-full px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md text-left ${
                    showMileageDropdown || filters.minMileage || filters.maxMileage
                      ? 'text-black bg-white border-blue-300' 
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {getMileageDisplayText()}
                </button>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${showMileageDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Mileage Dropdown */}
                {showMileageDropdown && (
                      <div className="absolute top-full left-0 right-auto mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-64">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <input
                          type="number"
                          name="minMileage"
                          value={filters.minMileage}
                          onChange={handleInputChange}
                          placeholder="Min Mileage"
                              className="w-full px-3 py-3 lg:px-3 lg:py-2 text-sm lg:text-sm border border-gray-200 rounded-md lg:rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input
                          type="number"
                          name="maxMileage"
                          value={filters.maxMileage}
                          onChange={handleInputChange}
                          placeholder="Max Mileage"
                              className="w-full px-3 py-3 lg:px-3 lg:py-2 text-sm lg:text-sm border border-gray-200 rounded-md lg:rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                  </div>
                </div>
              </div>
            </div>

            {/* Third Line: Fuel Engine Transmission Drivetrain */}
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
                    <option value="">Paliwo Typ</option>
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                <option value="CNG">CNG</option>
                <option value="LPG">LPG</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Engine Filter */}
              <div className="relative flex-1 mx-0.5 my-0.5">
                <select
                  name="engine"
                  value={filters.engine}
                  onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
                >
                    <option value="">Silnik</option>
                <option value="1.0L">1.0L</option>
                <option value="1.2L">1.2L</option>
                <option value="1.4L">1.4L</option>
                <option value="1.6L">1.6L</option>
                <option value="1.8L">1.8L</option>
                <option value="2.0L">2.0L</option>
                <option value="2.2L">2.2L</option>
                <option value="2.4L">2.4L</option>
                <option value="2.5L">2.5L</option>
                <option value="3.0L">3.0L</option>
                <option value="3.5L">3.5L</option>
                <option value="4.0L">4.0L</option>
                <option value="4.5L">4.5L</option>
                <option value="5.0L">5.0L</option>
                <option value="6.0L">6.0L</option>
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
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
                <option value="Semi-Automatic">Semi-Automatic</option>
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
                    <option value="">Przewodnik</option>
                <option value="FWD">FWD</option>
                <option value="RWD">RWD</option>
                <option value="AWD">AWD</option>
                <option value="4WD">4WD</option>
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
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                    </div>
                </div>
              </div>

                {/* Row 2 Mobile: Price + Reset, Desktop: All in one row */}
                <div className="flex items-center justify-between w-full gap-2 md:gap-0">
              {/* Price Button with Dropdown */}
              <div className="relative flex-1 mx-0.5 my-0.5" ref={priceDropdownRef}>
                <button
                  onClick={() => { setShowPriceDropdown(!showPriceDropdown); setShowYearDropdown(false); setShowMileageDropdown(false); }}
                  className={`w-full px-3 py-3 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md text-left ${
                    showPriceDropdown || filters.priceFrom || filters.priceTo
                      ? 'text-black bg-white border-blue-300' 
                      : 'text-gray-700 bg-white'
                  }`}
                >
                  {getPriceDisplayText()}
                </button>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Price Dropdown */}
                {showPriceDropdown && (
                      <div className="absolute top-full left-0 right-auto mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-72 overflow-y-auto pointer-events-auto">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <input
                          type="number"
                          name="priceFrom"
                          value={filters.priceFrom}
                          onChange={handleInputChange}
                          placeholder="Min Price"
                          className="w-full px-3 py-3 lg:px-3 lg:py-2 text-sm lg:text-sm border border-gray-200 rounded-md lg:rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input
                          type="number"
                          name="priceTo"
                          value={filters.priceTo}
                          onChange={handleInputChange}
                          placeholder="Max Price"
                          className="w-full px-3 py-3 lg:px-3 lg:py-2 text-sm lg:text-sm border border-gray-200 rounded-md lg:rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
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