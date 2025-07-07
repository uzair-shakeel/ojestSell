"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  getMyOffers,
  deleteOffer,
} from "../../../../services/sellerOfferService";
import { toast } from "react-hot-toast";
import {
  FiArrowLeft,
  FiFilter,
  FiX,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import { TbCar } from "react-icons/tb";

const MyOffersPage = () => {
  const router = useRouter();
  const { userId, getToken, isLoaded } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && userId) {
      fetchOffers();
    }
  }, [isLoaded, userId, page, filters]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      // Create a proper getToken function
      const getTokenFn = async () => {
        try {
          const token = await getToken();
          return token;
        } catch (error) {
          console.error("Error getting token:", error);
          return null;
        }
      };

      const response = await getMyOffers(getTokenFn, {
        ...filters,
        page,
        limit: 10,
      });

      setOffers(response.offers);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load your offers");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOffers();
  };

  const clearFilters = () => {
    setFilters({
      status: "",
    });
    setPage(1);
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to cancel this offer?")) {
      return;
    }

    try {
      // Create a proper getToken function
      const getTokenFn = async () => {
        try {
          const token = await getToken();
          return token;
        } catch (error) {
          console.error("Error getting token:", error);
          return null;
        }
      };

      await deleteOffer(offerId, getTokenFn);
      toast.success("Offer cancelled successfully");
      fetchOffers(); // Refresh the list
    } catch (error) {
      console.error("Error cancelling offer:", error);
      toast.error("Failed to cancel offer");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      Pending: <FiClock className="mr-1" />,
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

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Link
          href="/dashboard/seller-opportunities"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Buyer Requests
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Offers</h1>
          <p className="text-gray-500 mt-1">
            Track the status of all offers you've made to buyers
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
            Filter Offers
          </h2>
          <form
            onSubmit={handleFilterSubmit}
            className="flex flex-wrap items-end gap-4"
          >
            <div className="w-full md:w-auto flex-grow">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiFilter className="inline mr-1" /> Filter
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
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TbCar className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">No offers found</h2>
          <p className="text-gray-500 mb-4">
            {filters.status
              ? `You don't have any ${filters.status.toLowerCase()} offers.`
              : "You haven't made any offers yet."}
          </p>
          {filters.status && (
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {offers.map((offer) => (
                    <tr key={offer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {offer.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {typeof offer.requestId === "object" &&
                          offer.requestId
                            ? offer.requestId.title
                            : "Request details not available"}
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
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/dashboard/seller-opportunities/my-offers/${offer._id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View details"
                          >
                            <FiEye />
                          </Link>

                          {offer.status === "Pending" && (
                            <button
                              onClick={() => handleDeleteOffer(offer._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Cancel offer"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    </div>
  );
};

export default MyOffersPage;
