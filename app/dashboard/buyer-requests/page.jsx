"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
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
  const { userId, getToken, isLoaded } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && userId) {
      fetchRequests(activeTab);
    }
  }, [isLoaded, userId, activeTab]);

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
      setOffers(offersData);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setOffersLoading(false);
    }
  };

  const handleViewOffers = (request) => {
    setSelectedRequest(request);
    fetchOffers(request._id);
    setShowOffersModal(true);
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
        toast.success("Offer rejected");
        fetchOffers(selectedRequest._id);
      } catch (error) {
        console.error("Error rejecting offer:", error);
        toast.error("Failed to reject offer");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Active: "bg-green-100 text-green-800 border border-green-200",
      Fulfilled: "bg-blue-100 text-blue-800 border border-blue-200",
      Expired: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Cancelled: "bg-red-100 text-red-800 border border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
      >
        {status}
      </span>
    );
  };

  const getOfferStatusBadge = (status) => {
    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Accepted: "bg-green-100 text-green-800 border border-green-200",
      Rejected: "bg-red-100 text-red-800 border border-red-200",
      Expired: "bg-gray-100 text-gray-800 border border-gray-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
      >
        {status}
      </span>
    );
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

  const viewOfferDetail = (offer) => {
    setSelectedOffer(offer);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Car Requests</h1>
          <p className="text-gray-500 mt-1">
            Manage your vehicle requests and view offers from sellers
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
      </div>

      {loading ? (
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
                        <span>{calculateDaysLeft(request.expiryDate)} days left</span>
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

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleViewOffers(request)}
                      className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <FiEye className="mr-2" /> View Offers
                    </button>

                    {request.status === "Active" && (
                      <>
                        <Link
                          href={`/dashboard/buyer-requests/${request._id}/edit`}
                          className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <FiEdit className="mr-2" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteRequest(request._id)}
                          className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 className="mr-2" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
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
                <FiX className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Offers List */}
              <div className={`${selectedOffer ? "hidden md:block md:w-1/3" : "w-full"} border-r overflow-y-auto`}>
                {offersLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <div className="flex justify-center mb-3">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <FiClock className="h-8 w-8 text-gray-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No offers received yet
                    </h3>
                    <p className="text-gray-500">
                      Sellers will be able to make offers on your request soon
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {offers.map((offer) => (
                      <div
                        key={offer._id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedOffer?._id === offer._id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => viewOfferDetail(offer)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-800 line-clamp-1">
                            {offer.title}
                          </h3>
                          {getOfferStatusBadge(offer.status)}
                        </div>
                        <p className="text-green-600 font-bold mb-1">
                          ${offer.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {offer.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          Expires: {formatDate(offer.expiryDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Offer Detail */}
              {selectedOffer ? (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="md:hidden mb-4">
                    <button
                      onClick={() => setSelectedOffer(null)}
                      className="flex items-center text-blue-600"
                    >
                      <FiArrowLeft className="mr-1" /> Back to offers
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {selectedOffer.title}
                      </h3>
                      {getOfferStatusBadge(selectedOffer.status)}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center text-2xl font-bold text-green-600 mb-2">
                        <FiDollarSign className="mr-1" />
                        {selectedOffer.price.toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="mr-1" />
                        Offer expires: {formatDate(selectedOffer.expiryDate)}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">DESCRIPTION</h4>
                      <p className="text-gray-800 whitespace-pre-line">
                        {selectedOffer.description}
                      </p>
                    </div>

                    {selectedOffer.images && selectedOffer.images.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">IMAGES</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedOffer.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Offer image ${index + 1}`}
                                className="h-40 w-full object-cover rounded-lg border border-gray-200"
                              />
                              <a 
                                href={image} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <FiExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedOffer.carId && (
                      <div className="mb-6 border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">CAR DETAILS</h4>
                        <Link
                          href={`/dashboard/cars/${selectedOffer.carId._id}`}
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <TbCar className="mr-2" /> View complete car details
                        </Link>
                      </div>
                    )}

                    {selectedOffer.status === "Pending" && (
                      <div className="mt-8 flex justify-end space-x-4">
                        <button
                          onClick={() => handleRejectOffer(selectedOffer._id)}
                          className="px-6 py-2.5 border border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                          <FiX className="inline mr-1" /> Reject Offer
                        </button>
                        <button
                          onClick={() => handleAcceptOffer(selectedOffer._id)}
                          className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          <FiCheck className="inline mr-1" /> Accept Offer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
                  <div className="text-center">
                    <FiInfo className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">Select an offer</h3>
                    <p className="text-gray-500">
                      Click on an offer from the list to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerRequestsDashboard;
