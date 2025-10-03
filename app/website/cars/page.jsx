"use client";
import { useState, useEffect, Suspense } from "react";
import FilterSidebar from "../../../components/website/FilterSidebar";
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
        // Get filter values from URL parameters
        const make = searchParams.get("make");
        const model = searchParams.get("model");
        const type = searchParams.get("type");
        const startYear = searchParams.get("startYear");
        const endYear = searchParams.get("endYear");

        // If we have any filter parameters, apply them
        if (make || model || type || startYear || endYear) {
          // Create filter object with only defined values
          const filters = {
            ...(make && { make }),
            ...(model && { model }),
            ...(type && { type }),
            ...(startYear && { yearFrom: startYear }),
            ...(endYear && { yearTo: endYear }),
          };

          // Apply filters
          const allCars = await getAllCars();
          const filteredCars = allCars.filter((car) => {
            const makeMatch =
              !make || car.make.toLowerCase().includes(make.toLowerCase());
            const modelMatch =
              !model || car.model.toLowerCase().includes(model.toLowerCase());
            const typeMatch =
              !type || car.type.toLowerCase().includes(type.toLowerCase());
            const yearMatch =
              (!startYear || Number(car.year) >= Number(startYear)) &&
              (!endYear || Number(car.year) <= Number(endYear));

            return makeMatch && modelMatch && typeMatch && yearMatch;
          });

          setCars(filteredCars);
        } else {
          // If no filters, get all cars
          const data = await getAllCars();
          setCars(data);
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
        setError(t("cars.error"));
        setCars([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarsWithFilters();
  }, [searchParams, t]); // Re-run when URL parameters change

  // Handle sorting
  const handleSort = (value) => {
    setSortBy(value);
    let sortedCars = [...cars];

    switch (value) {
      case "lowest-price":
        sortedCars.sort(
          (a, b) => a.financialInfo.priceNetto - b.financialInfo.priceNetto
        );
        break;
      case "highest-price":
        sortedCars.sort(
          (a, b) => b.financialInfo.priceNetto - a.financialInfo.priceNetto
        );
        break;
      case "lowest-mileage":
        sortedCars.sort(
          (a, b) => Number(a.mileage || 0) - Number(b.mileage || 0)
        );
        break;
      case "highest-mileage":
        sortedCars.sort(
          (a, b) => Number(b.mileage || 0) - Number(a.mileage || 0)
        );
        break;
      case "newest-year":
        sortedCars.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
        break;
      case "oldest-year":
        sortedCars.sort((a, b) => Number(a.year || 0) - Number(b.year || 0));
        break;
      case "newest-listed":
        sortedCars.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest-listed":
        sortedCars.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "best-match":
      default:
        // For best match, we'll use the original order from the API
        getAllCars()
          .then((data) => setCars(data))
          .catch((error) => console.error("Error fetching cars:", error));
        return;
    }

    setCars(sortedCars);
  };

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
            Find your dream car easily with advanced search filters.sss
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
              {t("cars.filters.mobileButton")}
            </button>
            <select
              className="flex items-center font-sans border border-black rounded bg-transparent px-7 py-2 text-black font-medium"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              disabled={isLoading}
            >
              <option className="font-sans" value="best-match">
                {t("cars.filters.sort.options.bestMatch")}
              </option>
              <option className="font-sans" value="lowest-price">
                {t("cars.filters.sort.options.lowestPrice")}
              </option>
              <option className="font-sans" value="highest-price">
                {t("cars.filters.sort.options.highestPrice")}
              </option>
              <option className="font-sans" value="lowest-mileage">
                {t("cars.filters.sort.options.lowestMileage")}
              </option>
              <option className="font-sans" value="highest-mileage">
                {t("cars.filters.sort.options.highestMileage")}
              </option>
              <option className="font-sans" value="newest-year">
                {t("cars.filters.sort.options.newestYear")}
              </option>
              <option className="font-sans" value="oldest-year">
                {t("cars.filters.sort.options.oldestYear")}
              </option>
              <option className="font-sans" value="newest-listed">
                {t("cars.filters.sort.options.newestListed")}
              </option>
              <option className="font-sans" value="oldest-listed">
                {t("cars.filters.sort.options.oldestListed")}
              </option>
            </select>
          </div>

          {/* Car Cards */}
          <div className={`grid gap-7 grid-cols-1`}>
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
              cars.map((car) => <CarCard key={car._id} view={view} car={car} />)
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
