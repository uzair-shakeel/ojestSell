"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth/AuthContext";
import {
  getAvailableBuyerRequests,
  getMyOffers,
} from "../../../services/sellerOfferService";
import { getCarsByUserId } from "../../../services/carService";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiPlus,
  FiArrowRight,
  FiMapPin,
  FiChevronRight,
  FiTag,
  FiList,
  FiCheckCircle,
  FiXCircle,
  FiClock as FiClockPending,
  FiEye,
} from "react-icons/fi";
import { TbCar, TbCarGarage } from "react-icons/tb";
import { getUserById } from "../../../services/userService";

const SellerOpportunitiesPage = () => {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [requests, setRequests] = useState([]);
  const [userCars, setUserCars] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [carsLoading, setCarsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sellerType, setSellerType] = useState(null);
  const [filters, setFilters] = useState({
    make: "",
    model: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const checkSellerType = async () => {
      if (!userId) {
        router.push("/sign-in");
        return;
      }

      if (userId) {
        try {
          const userData = await getUserById(userId);
          setSellerType(userData.sellerType);

          // Redirect private sellers away from seller opportunities
          if (userData.sellerType === "private") {
            router.push("/dashboard");
            toast.error(
              "Seller opportunities are only available for company sellers"
            );
            return;
          }

          fetchRequests();
          fetchUserCars();
          fetchMyOffers();
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user information");
        }
      }
    };

    checkSellerType();
  }, [userId, page, filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      console.log("Fetching buyer requests with filters:", filters);

      // Create a proper getToken function
      const getTokenFn = async () => {
        try {
          const token = await getToken();
          console.log("Token available:", !!token);
          return token;
        } catch (error) {
          console.error("Error getting token:", error);
          return null;
        }
      };

      const response = await getAvailableBuyerRequests(getTokenFn, {
        ...filters,
        page,
        limit: 10,
      });
      console.log("Available buyer requests response:", response);
      setRequests(response.buyerRequests);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching buyer requests:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error("Failed to load buyer requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOffers = async () => {
    setOffersLoading(true);
    try {
      // Create a proper getToken function
      const getTokenFn = async () => {
        try {
          const token = await getToken();
          return token;
        } catch (error) {
          console.error("Error getting token for offers:", error);
          return null;
        }
      };

      const response = await getMyOffers(getTokenFn, { limit: 5 });
      setMyOffers(response.offers);
    } catch (error) {
      console.error("Error fetching my offers:", error);
      toast.error("Failed to load your offers");
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchUserCars = async () => {
    setCarsLoading(true);
    try {
      if (userId) {
        // Create a proper getToken function
        const getTokenFn = async () => {
          try {
            const token = await getToken();
            console.log("Token available for car fetch:", !!token);
            return token;
          } catch (error) {
            console.error("Error getting token for car fetch:", error);
            return null;
          }
        };

        const cars = await getCarsByUserId(userId, getTokenFn);
        setUserCars(cars);
      }
    } catch (error) {
      console.error("Error fetching user cars:", error);
    } finally {
      setCarsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const clearFilters = () => {
    setFilters({
      make: "",
      model: "",
    });
    setPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDaysLeft = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getOfferStatusBadge = (status) => {
    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Accepted: "bg-green-100 text-green-800 border border-green-200",
      Rejected: "bg-red-100 text-red-800 border border-red-200",
      Expired: "bg-gray-100 text-gray-800 border border-gray-200",
      Cancelled: "bg-gray-100 text-gray-800 border border-gray-200",
    };

    const statusIcons = {
      Pending: <FiClockPending className="mr-1" />,
      Accepted: <FiCheckCircle className="mr-1" />,
      Rejected: <FiXCircle className="mr-1" />,
      Expired: <FiX className="mr-1" />,
      Cancelled: <FiX className="mr-1" />,
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${statusColors[status]}`}
      >
        {statusIcons[status]} {status}
      </span>
    );
  };

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* My Offers Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">My Offers</h2>
          <Link
            href="/dashboard/seller-opportunities/my-offers"
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FiList className="mr-2" /> View All Offers
          </Link>
        </div>

        {offersLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : myOffers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiList className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No offers made yet
            </h3>
            <p className="text-gray-500 mb-6">
              Browse buyer requests below and make your first offer.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myOffers.map((offer) => (
                    <tr key={offer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {offer.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600 font-medium">
                          ${offer.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(offer.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getOfferStatusBadge(offer.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/seller-opportunities/my-offers/${offer._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-right">
              <Link
                href="/dashboard/seller-opportunities/my-offers"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                View all offers <FiArrowRight className="inline ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Buyer Requests</h1>
          <p className="text-gray-500 mt-1">
            Find and respond to buyer requests matching your inventory
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <FiFilter className="mr-2" />{" "}
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Filter Requests
          </h2>
          <form
            onSubmit={handleFilterSubmit}
            className="flex flex-wrap items-end gap-4"
          >
            <div className="w-full md:w-auto flex-grow">
              <label
                htmlFor="make"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Make
              </label>
              <input
                id="make"
                name="make"
                type="text"
                value={filters.make}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Any make"
              />
            </div>

            <div className="w-full md:w-auto flex-grow">
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Model
              </label>
              <input
                id="model"
                name="model"
                type="text"
                value={filters.model}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Any model"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiSearch className="inline mr-1" /> Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <FiX className="inline mr-1" /> Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TbCar className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            No buyer requests found
          </h2>
          <p className="text-gray-500 mb-4">
            There are currently no active buyer requests matching your filters.
          </p>
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition-all"
              >
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <TbCar className="text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">
                      {request.make} {request.model}
                    </span>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full border border-green-200 font-medium">
                    {calculateDaysLeft(request.expiryDate)} days left
                  </span>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    {request.title}
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {request.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {(request.yearFrom || request.yearTo) && (
                      <div className="flex items-start">
                        <FiCalendar className="mr-2 mt-0.5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Year Range</p>
                          <p className="text-sm font-medium">
                            {request.yearFrom && request.yearTo
                              ? `${request.yearFrom} - ${request.yearTo}`
                              : request.yearFrom
                              ? `From ${request.yearFrom}`
                              : `Until ${request.yearTo}`}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start">
                      <FiDollarSign className="mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="text-sm font-medium text-green-700">
                          {request.budgetMin
                            ? `$${request.budgetMin.toLocaleString()} - $${request.budgetMax.toLocaleString()}`
                            : `Up to $${request.budgetMax.toLocaleString()}`}
                        </p>
                      </div>
                    </div>

                    {request.preferredCondition !== "Any" && (
                      <div className="flex items-start">
                        <FiTag className="mr-2 mt-0.5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Condition</p>
                          <p className="text-sm font-medium">
                            {request.preferredCondition}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start">
                      <FiCalendar className="mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Posted</p>
                        <p className="text-sm font-medium">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <Link
                      href={`/dashboard/buyer-requests/${request._id}`}
                      className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <FiEye className="mr-2" /> View Details
                    </Link>
                    <Link
                      href={`/dashboard/seller-opportunities/${request._id}`}
                      className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <FiPlus className="mr-2" /> Make Offer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-1">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 border rounded-lg bg-gray-50">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Cars Section */}
      <div className="mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Your Cars Available for Offers
          </h2>
          <Link
            href="/dashboard/cars/add"
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FiPlus className="mr-2" /> Add a Car
          </Link>
        </div>

        {carsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : userCars.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <TbCarGarage className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No cars listed yet
            </h3>
            <p className="text-gray-500 mb-6">
              Add cars to your inventory to quickly make offers to buyers.
            </p>
            <Link
              href="/dashboard/cars/add"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block font-medium"
            >
              Add Your First Car
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userCars.slice(0, 4).map((car) => (
              <div
                key={car._id}
                className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition-all"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={car.images[0] || "/placeholder.jpg"}
                    alt={car.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white font-bold text-lg">
                      ${car.financialInfo.priceNetto.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 text-gray-800 line-clamp-1">
                    {car.make} {car.model}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <FiCalendar className="mr-1" /> {car.year || "N/A"}
                    <span className="mx-2">•</span>
                    <span>{car.condition}</span>
                  </div>
                  <Link
                    href={`/dashboard/cars/${car._id}`}
                    className="mt-1 text-blue-600 hover:text-blue-800 text-sm flex items-center font-medium"
                  >
                    View details <FiArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}

            {userCars.length > 4 && (
              <div className="flex justify-center items-center bg-gray-50 rounded-xl border p-6 hover:bg-gray-100 transition-colors">
                <Link
                  href="/dashboard/cars"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  View all {userCars.length} cars{" "}
                  <FiArrowRight className="ml-1" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOpportunitiesPage;
