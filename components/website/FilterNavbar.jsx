"use client";
import { useState, useEffect, useRef } from "react";

export default function FilterNavbar({ onApplyFilters }) {
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
  const dropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const mileageDropdownRef = useRef(null);
  const priceDropdownRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Apply filters immediately
    const updatedFilters = {
      ...filters,
      [name]: value
    };
    
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
    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 shadow-sm">
      <div className="w-full lg:w-[50vw] px-4 lg:px-6 py-6">
        {/* Filter Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Filtrowanie</h2>
        </div>
        
        <div className="space-y-1">
        {/* Desktop Layout: First Line - Make Model Type Year */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between w-full gap-2">
            {/* Make Filter */}
            <div className="relative flex-1">
              <select
                name="make"
                value={filters.make}
                onChange={handleInputChange}
                className="px-2 py-1.5 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                className="px-2 py-1.5 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
            <div className="relative flex-1" ref={yearDropdownRef}>
              <button
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className={`w-full px-2 py-1.5 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md text-left ${
                  showYearDropdown || filters.yearFrom || filters.yearTo
                    ? 'text-black bg-white border-blue-300' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                {getYearDisplayText()}
              </button>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Year Dropdown */}
              {showYearDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-64">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <select
                        name="yearFrom"
                        value={filters.yearFrom}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <select
                        name="yearTo"
                        value={filters.yearTo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
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
              className="px-2 py-1.5 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-md lg:rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-1 justify-center"
            >
              Resetuj
            </button>

            {/* Show More Button - Desktop only */}
            <button
              onClick={() => setShowMoreFilters(true)}
              className="flex items-center gap-1 lg:gap-2 px-2 py-1.5 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-blue-500 rounded-md lg:rounded-lg focus:outline-none whitespace-nowrap shadow-sm flex-1 justify-center text-white bg-blue-500"
            >
              <span className="flex items-center gap-1">
              Pokaż Więcej 
              </span>
              <svg className="w-3 h-3 lg:w-4 lg:h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Mobile Layout: Two selectors per row */}
        <div className="md:hidden space-y-1">
          {/* Row 1 Mobile: Make + Model */}
          <div className="flex items-center justify-between w-full gap-2">
            {/* Make Filter */}
            <div className="relative flex-1">
              <select
                name="make"
                value={filters.make}
                onChange={handleInputChange}
                className="px-3 py-3 pr-6 text-sm font-medium border border-gray-200 rounded-md focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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

            {/* Model Filter */}
            <div className="relative flex-1">
              <select
                name="model"
                value={filters.model}
                onChange={handleInputChange}
                className="px-3 py-3 pr-6 text-sm font-medium border border-gray-200 rounded-md focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
          </div>

          {/* Row 2 Mobile: Type + Year */}
          <div className="flex items-center justify-between w-full gap-2">
            {/* Type Filter */}
            <div className="relative flex-1">
              <select
                name="type"
                value={filters.type}
                onChange={handleInputChange}
                className="px-3 py-3 pr-6 text-sm font-medium border border-gray-200 rounded-md focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
              >
              <option value="">Typ</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Certified">Certified</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Year Button with Dropdown */}
            <div className="relative flex-1" ref={yearDropdownRef}>
              <button
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className={`w-full px-3 py-3 pr-6 text-sm font-medium border border-gray-200 rounded-md focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md text-left ${
                  showYearDropdown || filters.yearFrom || filters.yearTo
                    ? 'text-black bg-white border-blue-300' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                {getYearDisplayText()}
              </button>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className={`w-3 h-3 text-gray-400 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Year Dropdown */}
              {showYearDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-64">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <select
                        name="yearFrom"
                        value={filters.yearFrom}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <select
                        name="yearTo"
                        value={filters.yearTo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="">roku Do </option>
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

          {/* Row 3 Mobile: Reset + Show More buttons (hidden when expanded) */}
          {!showMoreFilters && (
            <div className="flex items-center justify-between w-full gap-2">
              {/* Reset Button - Mobile only */}
              <button
                onClick={handleReset}
                className="px-3 py-3 pr-6 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-md transition-all duration-200 shadow-sm hover:shadow-md flex-1 justify-center"
              >
                Resetuj
              </button>

              {/* Show More Button - Mobile only */}
              <button
                onClick={() => setShowMoreFilters(true)}
                className="flex items-center gap-1 px-3 py-3 pr-6 text-sm font-medium border border-blue-500 rounded-md focus:outline-none whitespace-nowrap shadow-sm flex-1 justify-center text-white bg-blue-500"
              >
                <span className="flex items-center gap-1">
                  Pokaż Więcej
                </span>
                <svg className="w-3 h-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Additional Filters - Show/Hide */}
        {showMoreFilters && (
          <>
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
                      className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full"
                    />
                  </div>

                  {/* Distance Filter */}
                  <div className="relative flex-1 mx-0.5 my-0.5">
                    <select
                      name="maxDistance"
                      value={filters.maxDistance}
                      onChange={handleInputChange}
                      className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                      className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                      onClick={() => setShowMileageDropdown(!showMileageDropdown)}
                      className={`w-full px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md text-left ${
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
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-64">
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
                      className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                      className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                      className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                      className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                      className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                      className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full"
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
                      onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                      className={`w-full px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-gray-200 rounded-md lg:rounded-lg focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md text-left ${
                        showPriceDropdown || filters.priceFrom || filters.priceTo
                          ? 'text-black bg-white border-blue-300' 
                          : 'text-gray-700 bg-white hover:bg-gray-50'
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
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-64">
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
                className="px-3 py-3 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-md lg:rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-1 justify-center"
              >
                Resetuj
              </button>

              {/* Show Less Button */}
              <button
                onClick={() => setShowMoreFilters(false)}
                className="flex items-center gap-1 lg:gap-2 px-2 py-1.5 pr-6 text-sm lg:px-3 lg:py-2 lg:pr-8 lg:text-sm font-medium border border-blue-500 rounded-md lg:rounded-lg focus:outline-none whitespace-nowrap shadow-sm flex-1 justify-center text-white bg-blue-500"
              >
                <span className="flex items-center gap-1">
                  Pokaż mniej
                </span>
                <svg className="w-3 h-3 lg:w-4 lg:h-4 transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

          </>
        )}


        </div>
      </div>
    </div>
  );
}