"use client";
import { useState, useRef, useEffect } from "react";
import { X, SlidersHorizontal } from "lucide-react";

// Custom utility for hiding scrollbars
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
  
  @media (max-width: 768px) {
    .mobile-large-select select {
      min-height: 4rem;
      font-size: 1.25rem;
      padding: 1rem 1.25rem;
    }
    
    .mobile-large-text {
      font-size: 1.25rem !important;
    }
    
    .mobile-large-input {
      min-height: 4rem;
      font-size: 1.25rem;
    }
  }

  .custom-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
  }

  .custom-button:focus {
    outline: none;
    ring: 2px;
    ring-offset: 2px;
    ring-blue-500;
  }

  .custom-button-outline {
    background: white;
    border: 1.5px solid #2563eb;
    color: #2563eb;
    padding: 0.5rem 1rem;
  }

  .custom-button-ghost {
    background: transparent;
    border: none;
    color: #4b5563;
    padding: 0.5rem;
  }

  .custom-button-primary {
    background: #2563eb;
    border: none;
    color: white;
    padding: 0.75rem 1rem;
  }

  .custom-button-primary:hover {
    background: #1d4ed8;
  }

  .custom-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #111827;
    background-color: white;
    transition: border-color 0.2s;
  }

  .custom-input:focus {
    outline: none;
    border-color: #2563eb;
    ring: 1px;
    ring-blue-500;
  }
`;

const drawerStyles = `
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    max-width: 425px;
    background: white;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .drawer.open {
    transform: translateX(0);
  }

  .drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease-in-out;
  }

  .drawer-overlay.open {
    opacity: 1;
    visibility: visible;
  }
`;

export default function FilterSidebar({ onApplyFilters }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
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
  });

  const desktopFilterContentRef = useRef(null);
  const mobileFilterContentRef = useRef(null);
  const [desktopScrollPosition, setDesktopScrollPosition] = useState(0);
  const [mobileScrollPosition, setMobileScrollPosition] = useState(0);

  // Add effect to maintain scroll position
  useEffect(() => {
    const restoreScroll = () => {
      if (desktopFilterContentRef.current) {
        desktopFilterContentRef.current.scrollTop = desktopScrollPosition;
      }
      if (mobileFilterContentRef.current) {
        mobileFilterContentRef.current.scrollTop = mobileScrollPosition;
      }
    };

    restoreScroll();
  }, [desktopScrollPosition, mobileScrollPosition, filters, openIndex]);

  const toggle = (index) => {
    // Save current scroll position before toggling
    if (desktopFilterContentRef.current) {
      setDesktopScrollPosition(desktopFilterContentRef.current.scrollTop);
    }
    if (mobileFilterContentRef.current) {
      setMobileScrollPosition(mobileFilterContentRef.current.scrollTop);
    }
    setOpenIndex(index === openIndex ? null : index);
  };

  const handleInputChange = (e) => {
    // Save current scroll position before updating filters
    if (desktopFilterContentRef.current) {
      setDesktopScrollPosition(desktopFilterContentRef.current.scrollTop);
    }
    if (mobileFilterContentRef.current) {
      setMobileScrollPosition(mobileFilterContentRef.current.scrollTop);
    }
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const queryParams = {
      longitude: filters.location ? "19.945" : undefined,
      latitude: filters.location ? "50.0647" : undefined,
      maxDistance: filters.maxDistance || undefined,
      make: filters.make || undefined,
      model: filters.model || undefined,
      type: filters.type || undefined,
      yearFrom: filters.yearFrom || undefined,
      yearTo: filters.yearTo || undefined,
      condition: filters.condition || undefined,
      minMileage: filters.minMileage || undefined,
      maxMileage: filters.maxMileage || undefined,
      drivetrain: filters.drivetrain || undefined,
      transmission: filters.transmission || undefined,
      fuel: filters.fuel || undefined,
      engine: filters.engine || undefined,
      serviceHistory: filters.serviceHistory || undefined,
      accidentHistory: filters.accidentHistory || undefined,
    };
    onApplyFilters(queryParams);
    setMobileFiltersOpen(false);
  };

  const handleReset = () => {
    setFilters({
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
    });
    onApplyFilters({});
  };

  // Create filter content component
  const FilterContent = ({ isMobile }) => {
    const ref = isMobile ? mobileFilterContentRef : desktopFilterContentRef;

    const handleScroll = (e) => {
      if (isMobile) {
        setMobileScrollPosition(e.currentTarget.scrollTop);
      } else {
        setDesktopScrollPosition(e.currentTarget.scrollTop);
      }
    };

    return (
      <div
        className="space-y-6 mobile-large-select"
        ref={ref}
        onScroll={handleScroll}
      >
        <div className="divide-y overflow-auto max-h-[calc(100vh-150px)] scrollbar-hide">
          {/* 0 - Location */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 0 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(0)}
            >
              Location
            </div>
            <div className="collapse-content space-y-2">
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleInputChange}
                placeholder="Enter location"
                className="custom-input"
              />
              <select
                name="maxDistance"
                value={filters.maxDistance}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">Select distance</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="15">15 km</option>
                <option value="20">20 km</option>
              </select>
            </div>
          </div>

          {/* 1 - Make */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 1 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(1)}
            >
              Make
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="make"
                value={filters.make}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Nissan">Nissan</option>
                <option value="BMW">BMW</option>
              </select>
            </div>
          </div>

          {/* 2 - Model */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 2 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(2)}
            >
              Model
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="model"
                value={filters.model}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="MX3">MX3</option>
                <option value="MX2">MX2</option>
                <option value="MX1">MX1</option>
                <option value="320i">320i</option>
              </select>
            </div>
          </div>

          {/* 3 - Type */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 3 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(3)}
            >
              Type
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="type"
                value={filters.type}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
          </div>

          {/* 4 - Year */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 4 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(4)}
            >
              Year
            </div>
            <div className="collapse-content space-y-2">
              <div className="flex gap-2">
                <select
                  name="yearFrom"
                  value={filters.yearFrom}
                  onChange={handleInputChange}
                  className="custom-input"
                >
                  <option value="">From</option>
                  <option value="2015">2015</option>
                  <option value="2016">2016</option>
                  <option value="2017">2017</option>
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                </select>
                <select
                  name="yearTo"
                  value={filters.yearTo}
                  onChange={handleInputChange}
                  className="custom-input"
                >
                  <option value="">To</option>
                  <option value="2015">2015</option>
                  <option value="2016">2016</option>
                  <option value="2017">2017</option>
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5 - Condition */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 5 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(5)}
            >
              Condition
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="condition"
                value={filters.condition}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>
          </div>

          {/* 6 - Mileage */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 6 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(6)}
            >
              Mileage
            </div>
            <div className="collapse-content space-y-2">
              <div className="flex gap-2">
                <select
                  name="minMileage"
                  value={filters.minMileage}
                  onChange={handleInputChange}
                  className="custom-input"
                >
                  <option value="">From</option>
                  <option value="50000">50,000 km</option>
                  <option value="100000">100,000 km</option>
                  <option value="150000">150,000 km</option>
                  <option value="200000">200,000 km</option>
                </select>
                <select
                  name="maxMileage"
                  value={filters.maxMileage}
                  onChange={handleInputChange}
                  className="custom-input"
                >
                  <option value="">To</option>
                  <option value="50000">50,000 km</option>
                  <option value="100000">100,000 km</option>
                  <option value="150000">150,000 km</option>
                  <option value="200000">200,000 km</option>
                </select>
              </div>
            </div>
          </div>

          {/* 7 - Drivetrain */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 7 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(7)}
            >
              Drivetrain
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="drivetrain"
                value={filters.drivetrain}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="FWD">FWD</option>
                <option value="RWD">RWD</option>
                <option value="AWD">AWD</option>
              </select>
            </div>
          </div>

          {/* 8 - Transmission */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 8 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(8)}
            >
              Transmission
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>

          {/* 9 - Fuel Type */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 9 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(9)}
            >
              Fuel Type
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="fuel"
                value={filters.fuel}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* 10 - Engine */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 10 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(10)}
            >
              Engine
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="engine"
                value={filters.engine}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="1.6L">1.6L</option>
                <option value="2.0L">2.0L</option>
                <option value="2.5L">2.5L</option>
                <option value="3.0L">3.0L</option>
                <option value="4.0L">4.0L</option>
                <option value="5.0L">5.0L</option>
                <option value="6.0L">6.0L</option>
                <option value="8.0L">8.0L</option>
              </select>
            </div>
          </div>

          {/* 11 - Service History */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 11 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(11)}
            >
              Service History
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="serviceHistory"
                value={filters.serviceHistory}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="Full">Full</option>
                <option value="Partial">Partial</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {/* 12 - Accident History */}
          <div
            className={`collapse collapse-arrow px-2 rounded-none ${
              openIndex === 12 ? "collapse-open" : ""
            }`}
          >
            <div
              className="collapse-title text-lg font-medium cursor-pointer"
              onClick={() => toggle(12)}
            >
              Accident History
            </div>
            <div className="collapse-content space-y-2">
              <select
                name="accidentHistory"
                value={filters.accidentHistory}
                onChange={handleInputChange}
                className="custom-input"
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile filters toggle button
  const MobileToggle = () => (
    <div className="lg:hidden sticky top-20 left-40 pl-4 right-0 z-10 bg-background py-3">
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="custom-button custom-button-outline flex items-center gap-2 text-base"
      >
        <SlidersHorizontal size={20} />
        <span>Filters</span>
      </button>
    </div>
  );

  return (
    <>
      <style jsx global>{`
        ${scrollbarHideStyles}
        ${drawerStyles}
      `}</style>

      <MobileToggle />

      {/* Mobile Drawer */}
      <div className="lg:hidden">
        <div
          className={`drawer-overlay ${mobileFiltersOpen ? "open" : ""}`}
          onClick={() => setMobileFiltersOpen(false)}
        />
        <div className={`drawer ${mobileFiltersOpen ? "open" : ""}`}>
          <div className="sticky top-0 z-10 bg-white p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={handleReset}
                  className="custom-button custom-button-ghost h-8 px-2"
                >
                  Reset
                </button>
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="custom-button custom-button-ghost h-8 w-8"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <FilterContent isMobile={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-full  border  rounded-lg bg-white lg:max-w-xs">
        <div className="bg-white rounded-lg shadow-sm   flex flex-col h-[calc(100vh-2rem)] sticky top-4">
          <div className="sticky top-0 z-10 bg-white rounded-t-lg p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                className="custom-button custom-button-ghost h-8 px-2"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
            <FilterContent isMobile={false} />
          </div>
        </div>
      </div>
    </>
  );
}
