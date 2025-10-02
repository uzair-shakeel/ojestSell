"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth/AuthContext";
import {
  getMyBuyerRequests,
  getOffersForRequest,
  deleteBuyerRequest,
} from "../../../services/buyerRequestService";
import { acceptOffer, rejectOffer } from "../../../services/sellerOfferService";
import { toast } from "react-hot-toast";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiX,
  FiCheck,
  FiInfo,
  FiExternalLink,
  FiArrowLeft,
} from "react-icons/fi";
import { TbCar } from "react-icons/tb";

const BuyerRequestsDashboard = () => {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [allOffers, setAllOffers] = useState([]);
  const [allOffersLoading, setAllOffersLoading] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState(new Set());
  const [requestOffers, setRequestOffers] = useState({});

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (userId) {
      if (activeTab === "received-offers") {
        fetchAllOffers();
      } else {
      fetchRequests(activeTab);
      }
    }
  }, [userId, activeTab]);

  const fetchRequests = async (status) => {
    setLoading(true);
    try {
      console.log("Fetching buyer requests with status:", status);
      console.log("getToken function available:", !!getToken);

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

      const response = await getMyBuyerRequests({ status }, getTokenFn);
      console.log("Buyer requests response:", response);
      setRequests(response.buyerRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async (requestId) => {
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

      const offersData = await getOffersForRequest(requestId, getTokenFn);
      console.log("Offers response:", offersData);
      // The backend returns { offers: [...] }, so we need to extract the offers array
      setOffers(offersData.offers || offersData);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchAllOffers = async () => {
    setAllOffersLoading(true);
    try {
      // Create a proper getToken function
      const getTokenFn = async () => {
        try {
          const token = await getToken();
          return token;
        } catch (error) {
          console.error("Error getting token for all offers:", error);
          return null;
        }
      };

      // Fetch all buyer requests for this user first
      const requestsResponse = await getMyBuyerRequests({}, getTokenFn);
      const userRequests = requestsResponse.buyerRequests;

      // Fetch offers for each request
      const allOffersData = [];
      for (const request of userRequests) {
        try {
          const offersData = await getOffersForRequest(request._id, getTokenFn);
          const offers = offersData.offers || offersData;
          // Add request info to each offer
          const offersWithRequest = offers.map((offer) => ({
            ...offer,
            requestTitle: request.title,
            requestId: request._id,
          }));
          allOffersData.push(...offersWithRequest);
        } catch (error) {
          console.error(
            `Error fetching offers for request ${request._id}:`,
            error
          );
        }
      }

      console.log("All offers data:", allOffersData);
      console.log("Sample offer carInfo:", allOffersData[0]?.carInfo);
      console.log("Sample offer images:", allOffersData[0]?.carInfo?.images);
      setAllOffers(allOffersData);
    } catch (error) {
      console.error("Error fetching all offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setAllOffersLoading(false);
    }
  };

  const handleViewOffers = (request) => {
    setSelectedRequest(request);
    fetchOffers(request._id);
    setShowOffersModal(true);
  };

  const toggleRequestExpanded = async (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
      // Fetch offers for this request if not already loaded
      if (!requestOffers[requestId]) {
        await fetchOffersForRequest(requestId);
      }
    }
    setExpandedRequests(newExpanded);
  };

  const fetchOffersForRequest = async (requestId) => {
    try {
      const getTokenFn = async () => {
        try {
          const token = await getToken();
          return token;
        } catch (error) {
          console.error("Error getting token for request offers:", error);
          return null;
        }
      };

      const offersData = await getOffersForRequest(requestId, getTokenFn);
      const offers = offersData.offers || offersData;
      console.log(`Offers for request ${requestId}:`, offers);
      console.log(`Sample offer carInfo:`, offers[0]?.carInfo);
      console.log(`Sample offer images:`, offers[0]?.carInfo?.images);
      setRequestOffers((prev) => ({
        ...prev,
        [requestId]: offers,
      }));
    } catch (error) {
      console.error(`Error fetching offers for request ${requestId}:`, error);
      toast.error("Failed to load offers for this request");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      try {
        // Create a proper getToken function
        const getTokenFn = async () => {
          try {
            const token = await getToken();
            return token;
          } catch (error) {
            console.error("Error getting token for delete:", error);
            return null;
          }
        };

        await deleteBuyerRequest(requestId, getTokenFn);
        toast.success("Request cancelled successfully");
        fetchRequests(activeTab);
      } catch (error) {
        console.error("Error deleting request:", error);
        toast.error("Failed to cancel request");
      }
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (
      window.confirm(
        "Are you sure you want to accept this offer? This will close your request and reject all other offers."
      )
    ) {
      try {
        // Create a proper getToken function
        const getTokenFn = async () => {
          try {
            const token = await getToken();
            return token;
          } catch (error) {
            console.error("Error getting token for accept:", error);
            return null;
          }
        };

        await acceptOffer(offerId, getTokenFn);
        toast.success("Offer accepted successfully");
        fetchRequests(activeTab);
        setShowOffersModal(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error("Error accepting offer:", error);
        toast.error("Failed to accept offer");
      }
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (window.confirm("Are you sure you want to reject this offer?")) {
      try {
        // Create a proper getToken function
        const getTokenFn = async () => {
          try {
            const token = await getToken();
            return token;
          } catch (error) {
            console.error("Error getting token for reject:", error);
            return null;
          }
        };

        await rejectOffer(offerId, getTokenFn);
        toast.success("Offer rejected successfully");
        fetchRequests(activeTab);
        setShowOffersModal(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error("Error rejecting offer:", error);
        toast.error("Failed to reject offer");
      }
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

  const calculateDaysLeft = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Active: "bg-green-100 text-green-800 border border-green-200",
      Fulfilled: "bg-blue-100 text-blue-800 border border-blue-200",
      Expired: "bg-red-100 text-red-800 border border-red-200",
      Cancelled: "bg-gray-100 text-gray-800 border border-gray-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
      >
        {status}
      </span>
    );
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Buyer Requests Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your car requests and view offers from sellers
          </p>
        </div>
        <Link
          href="/dashboard/buyer-requests/add"
          className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <FiPlus className="mr-2" /> Create New Request
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap mb-8 bg-white rounded-lg shadow-sm border overflow-hidden">
        <button
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === "active"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active Requests
        </button>
        <button
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === "fulfilled"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("fulfilled")}
        >
          Fulfilled
        </button>
        <button
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === "cancelled"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled
        </button>
        <button
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === "expired"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("expired")}
        >
          Expired
        </button>
          <button
            className={`py-3 px-6 font-medium transition-colors ${
              activeTab === "received-offers"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("received-offers")}
          >
            Received Offers
        </button>
      </div>

        {/* Content */}
        {activeTab === "received-offers" ? (
          // Received Offers Tab
          allOffersLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allOffers.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-md p-8 text-center border">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FiDollarSign className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    No offers received yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Create a buyer request to start receiving offers from
                    sellers
                  </p>
                  <Link
                    href="/dashboard/buyer-requests/add"
                    className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="mr-2" /> Create New Request
                  </Link>
                </div>
              ) : (
                allOffers.map((offer) => (
                  <div
                    key={offer._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition-all"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {offer.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            offer.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : offer.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : offer.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {offer.status}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {offer.description}
                      </p>

                      {/* Compact Request Indicator */}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <TbCar className="h-3 w-3 mr-1" />
                          <span
                            className="truncate max-w-[150px]"
                            title={offer.requestTitle}
                          >
                            {offer.requestTitle}
                          </span>
                        </div>
                      </div>

                      {/* Car Images */}
                      {offer.carInfo &&
                        offer.carInfo.images &&
                        offer.carInfo.images.length > 0 && (
                          <div className="mb-3">
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                              {offer.carInfo.images
                                .slice(0, 3)
                                .map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`${offer.carInfo.make} ${offer.carInfo.model}`}
                                    className="h-16 w-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                    onError={(e) => {
                                      console.error(
                                        `Failed to load image ${index}:`,
                                        image
                                      );
                                      e.target.style.display = "none";
                                    }}
                                    onLoad={() =>
                                      console.log(
                                        `Successfully loaded image ${index}:`,
                                        image
                                      )
                                    }
                                  />
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Debug Info */}
                      {process.env.NODE_ENV === "development" && (
                        <div className="mb-2 p-2 bg-yellow-50 rounded text-xs text-gray-600">
                          <div>CarInfo: {offer.carInfo ? "Yes" : "No"}</div>
                          <div>
                            Images:{" "}
                            {offer.carInfo?.images
                              ? offer.carInfo.images.length
                              : 0}
                          </div>
                          <div>
                            First Image: {offer.carInfo?.images?.[0] || "None"}
                          </div>
                        </div>
                      )}

                      {/* Car Details */}
                      {offer.carInfo && (
                        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Car:</span>{" "}
                            {offer.carInfo.make} {offer.carInfo.model}{" "}
                            {offer.carInfo.year}
                          </div>
                        </div>
                      )}

                      {/* Seller Information */}
                      {offer.sellerInfo && (
                        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-gray-700">
                              <span className="font-medium">Seller:</span>{" "}
                              {offer.sellerInfo.firstName}{" "}
                              {offer.sellerInfo.lastName}
                              {offer.sellerInfo.companyName && (
                                <span className="text-gray-500 ml-1">
                                  ({offer.sellerInfo.companyName})
                                </span>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                offer.sellerInfo.sellerType === "company"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {offer.sellerInfo.sellerType === "company"
                                ? "Company"
                                : "Private"}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-blue-600">
                          ${offer.price?.toLocaleString() || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {offer.requestTitle}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleAcceptOffer(offer._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        ) : // Regular Requests Tabs
        loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-md p-8 text-center border">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <TbCar className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                No {activeTab} requests found
              </h3>
              <p className="text-gray-500 mb-6">
                Create a new request to start receiving offers from sellers
              </p>
              <Link
                href="/dashboard/buyer-requests/add"
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" /> Create New Request
              </Link>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {request.title}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <FiCalendar className="mr-1 text-gray-400" />
                      <span>{formatDate(request.createdAt)}</span>
                    </div>

                    {request.status === "Active" && (
                      <div className="flex items-center">
                        <FiClock className="mr-1 text-gray-400" />
                        <span>
                          {calculateDaysLeft(request.expiryDate)} days left
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {(request.make || request.model) && (
                      <div className="flex items-center text-sm">
                        <TbCar className="mr-2 text-gray-400" />
                        <span className="font-medium">Car:</span>
                        <span className="ml-1 text-gray-700">
                          {request.make} {request.model}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm">
                      <FiDollarSign className="mr-2 text-gray-400" />
                      <span className="font-medium">Budget:</span>
                      <span className="ml-1 text-gray-700">
                        {request.budgetMin
                          ? `$${request.budgetMin.toLocaleString()} - $${request.budgetMax.toLocaleString()}`
                          : `Up to $${request.budgetMax.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/buyer-requests/${request._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Details"
                    >
                      <FiEye size={18} />
                    </Link>
                    <button
                        onClick={() => toggleRequestExpanded(request._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title={
                          expandedRequests.has(request._id)
                            ? "Hide Offers"
                            : "Show Offers"
                        }
                    >
                      <FiDollarSign size={18} />
                        <span className="ml-1 text-xs">
                          {expandedRequests.has(request._id) ? "Hide" : "Show"}
                        </span>
                    </button>
                    <Link
                      href={`/dashboard/buyer-requests/${request._id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Request"
                    >
                      <FiEdit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteRequest(request._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Request"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>

                    {/* Inline Offers Section */}
                    {expandedRequests.has(request._id) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-800">
                            Offers ({requestOffers[request._id]?.length || 0})
                          </h4>
                          <button
                            onClick={() => handleViewOffers(request)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View All Details →
                          </button>
                        </div>

                        {!requestOffers[request._id] ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                            <p className="text-gray-500 text-sm">
                              Loading offers...
                            </p>
                          </div>
                        ) : requestOffers[request._id].length === 0 ? (
                          <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <FiDollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">
                              No offers received yet
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {requestOffers[request._id]
                              .slice(0, 3)
                              .map((offer) => (
                                <div
                                  key={offer._id}
                                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                >
                                  {/* Compact Request Indicator */}
                                  <div className="flex items-center mb-2">
                                    <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      <TbCar className="h-3 w-3 mr-1" />
                                      <span
                                        className="truncate max-w-[120px]"
                                        title={request.title}
                                      >
                                        {request.title}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Car Images */}
                                  {offer.carInfo &&
                                    offer.carInfo.images &&
                                    offer.carInfo.images.length > 0 && (
                                      <div className="mb-2">
                                        <div className="flex space-x-1 overflow-x-auto pb-1">
                                          {offer.carInfo.images
                                            .slice(0, 2)
                                            .map((image, index) => (
                                              <img
                                                key={index}
                                                src={image}
                                                alt={`${offer.carInfo.make} ${offer.carInfo.model}`}
                                                className="h-12 w-16 object-cover rounded border border-gray-200 flex-shrink-0"
                                                onError={(e) => {
                                                  console.error(
                                                    `Failed to load inline image ${index}:`,
                                                    image
                                                  );
                                                  e.target.style.display =
                                                    "none";
                                                }}
                                                onLoad={() =>
                                                  console.log(
                                                    `Successfully loaded inline image ${index}:`,
                                                    image
                                                  )
                                                }
                                              />
                                            ))}
                                        </div>
                                      </div>
                                    )}

                                  {/* Debug Info */}
                                  {process.env.NODE_ENV === "development" && (
                                    <div className="mb-1 p-1 bg-yellow-50 rounded text-xs text-gray-500">
                                      <div>
                                        CarInfo: {offer.carInfo ? "Yes" : "No"}
                                      </div>
                                      <div>
                                        Images:{" "}
                                        {offer.carInfo?.images
                                          ? offer.carInfo.images.length
                                          : 0}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-800">
                                        {offer.title}
                                      </h5>
                                      <p className="text-sm text-gray-600 line-clamp-2">
                                        {offer.description}
                                      </p>

                                      {/* Car Details */}
                                      {offer.carInfo && (
                                        <div className="mt-1 text-xs text-gray-600">
                                          {offer.carInfo.make}{" "}
                                          {offer.carInfo.model}{" "}
                                          {offer.carInfo.year}
                                        </div>
                                      )}

                                      {/* Seller Info */}
                                      {offer.sellerInfo && (
                                        <div className="mt-1 text-xs text-gray-500">
                                          {offer.sellerInfo.firstName}{" "}
                                          {offer.sellerInfo.lastName}
                                          {offer.sellerInfo.companyName &&
                                            ` (${offer.sellerInfo.companyName})`}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right ml-3">
                                      <div className="text-lg font-bold text-blue-600">
                                        $
                                        {offer.price?.toLocaleString() || "N/A"}
                                      </div>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          offer.status === "Pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : offer.status === "Accepted"
                                            ? "bg-green-100 text-green-800"
                                            : offer.status === "Rejected"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {offer.status}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() =>
                                        handleAcceptOffer(offer._id)
                                      }
                                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejectOffer(offer._id)
                                      }
                                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ))}

                            {requestOffers[request._id].length > 3 && (
                              <div className="text-center pt-2">
                                <button
                                  onClick={() => handleViewOffers(request)}
                                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  View all {requestOffers[request._id].length}{" "}
                                  offers →
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Offers Modal */}
      {showOffersModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Offers for: {selectedRequest.title}
                </h2>
                <p className="text-gray-500 mt-1">
                  {selectedRequest.make} {selectedRequest.model}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOffersModal(false);
                  setSelectedOffer(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                  <FiX size={24} />
              </button>
            </div>

              <div className="flex-1 overflow-y-auto p-6">
                {offersLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FiInfo className="h-8 w-8 text-gray-400" />
                      </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No offers yet
                    </h3>
                    <p className="text-gray-500">
                      Sellers haven't made any offers for this request yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div
                        key={offer._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {/* Car Images */}
                        {offer.carInfo &&
                          offer.carInfo.images &&
                          offer.carInfo.images.length > 0 && (
                            <div className="mb-3">
                              <div className="flex space-x-2 overflow-x-auto pb-2">
                                {offer.carInfo.images.map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`${offer.carInfo.make} ${offer.carInfo.model}`}
                                    className="h-20 w-28 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                  />
                                ))}
                        </div>
                            </div>
                          )}

                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800">
                              {offer.title}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                          {offer.description}
                        </p>

                            {/* Car Details */}
                            {offer.carInfo && (
                              <div className="mb-2 p-2 bg-blue-50 rounded-lg">
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium">Car:</span>{" "}
                                  {offer.carInfo.make} {offer.carInfo.model}{" "}
                                  {offer.carInfo.year}
                      </div>
                  </div>
                )}

                            {/* Seller Information */}
                            {offer.sellerInfo && (
                              <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="text-gray-700">
                                    <span className="font-medium">Seller:</span>{" "}
                                    {offer.sellerInfo.firstName}{" "}
                                    {offer.sellerInfo.lastName}
                                    {offer.sellerInfo.companyName && (
                                      <span className="text-gray-500 ml-1">
                                        ({offer.sellerInfo.companyName})
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      offer.sellerInfo.sellerType === "company"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {offer.sellerInfo.sellerType === "company"
                                      ? "Company"
                                      : "Private"}
                                  </span>
                  </div>
                    </div>
                            )}
                      </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-blue-600">
                              ${offer.price?.toLocaleString() || "N/A"}
                      </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                offer.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : offer.status === "Accepted"
                                  ? "bg-green-100 text-green-800"
                                  : offer.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {offer.status}
                            </span>
                              </div>
                          </div>

                        <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => handleAcceptOffer(offer._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleRejectOffer(offer._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Reject
                        </button>
                      </div>
                  </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default BuyerRequestsDashboard;
