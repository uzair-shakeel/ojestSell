"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../lib/auth/AuthContext";
import {
  getOfferById,
  deleteOffer,
} from "../../../../../services/sellerOfferService";
import { getBuyerRequestById } from "../../../../../services/buyerRequestService";
import { toast } from "react-hot-toast";
import {
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiMessageCircle,
  FiTrash2,
  FiInfo,
  FiAlertTriangle,
  FiPlus,
} from "react-icons/fi";
import { TbCar } from "react-icons/tb";

const OfferDetailPage = ({ params }) => {
  const { offerId } = React.use(params);
  const router = useRouter();
  const { userId, getToken } = useAuth();

  const [offer, setOffer] = useState(null);
  const [buyerRequest, setBuyerRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (userId && offerId) {
      fetchOfferDetails();
    }
  }, [userId, offerId]);

  const fetchOfferDetails = async () => {
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

      const offerData = await getOfferById(offerId, getTokenFn);
      setOffer(offerData);

      // Fetch the associated buyer request
      if (offerData.requestId) {
        const requestId =
          typeof offerData.requestId === "object"
            ? offerData.requestId._id
            : offerData.requestId;

        const requestData = await getBuyerRequestById(requestId);
        setBuyerRequest(requestData);
      }
    } catch (error) {
      console.error("Error fetching offer details:", error);
      toast.error("Failed to load offer details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async () => {
    if (!window.confirm("Are you sure you want to cancel this offer?")) {
      return;
    }

    setDeleting(true);
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
      router.push("/dashboard/seller-opportunities/my-offers");
    } catch (error) {
      console.error("Error cancelling offer:", error);
      toast.error("Failed to cancel offer");
    } finally {
      setDeleting(false);
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
      Pending: <FiClock className="mr-2" />,
      Accepted: <FiCheckCircle className="mr-2" />,
      Rejected: <FiXCircle className="mr-2" />,
      Expired: <FiX className="mr-2" />,
      Cancelled: <FiX className="mr-2" />,
    };

    return (
      <div
        className={`flex items-center px-4 py-2 rounded-lg ${statusColors[status]}`}
      >
        {statusIcons[status]}
        <span className="font-medium">{status}</span>
      </div>
    );
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "Pending":
        return {
          title: "Waiting for buyer response",
          message:
            "The buyer is reviewing your offer. You'll be notified when they respond.",
          icon: <FiClock className="h-6 w-6 text-yellow-500" />,
          color: "bg-yellow-50 border-yellow-100",
        };
      case "Accepted":
        return {
          title: "Offer accepted!",
          message:
            "The buyer has accepted your offer. You can now proceed with the transaction.",
          icon: <FiCheckCircle className="h-6 w-6 text-green-500" />,
          color: "bg-green-50 border-green-100",
        };
      case "Rejected":
        return {
          title: "Offer rejected",
          message:
            "The buyer has rejected your offer. You may want to submit a new offer or contact them for more information.",
          icon: <FiXCircle className="h-6 w-6 text-red-500" />,
          color: "bg-red-50 border-red-100",
        };
      case "Expired":
        return {
          title: "Offer expired",
          message:
            "This offer has expired. You can submit a new offer if you're still interested.",
          icon: <FiAlertTriangle className="h-6 w-6 text-gray-500" />,
          color: "bg-gray-50 border-gray-100",
        };
      case "Cancelled":
        return {
          title: "Offer cancelled",
          message:
            "You cancelled this offer. You can submit a new offer if you're still interested.",
          icon: <FiX className="h-6 w-6 text-gray-500" />,
          color: "bg-gray-50 border-gray-100",
        };
      default:
        return {
          title: "Status unknown",
          message: "The status of this offer is unknown.",
          icon: <FiInfo className="h-6 w-6 text-gray-500" />,
          color: "bg-gray-50 border-gray-100",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link
            href="/dashboard/seller-opportunities/my-offers"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to My Offers
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 text-center border">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FiX className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Offer not found</h2>
          <p className="text-gray-500 mb-4">
            The offer you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link
            href="/dashboard/seller-opportunities/my-offers"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to My Offers
          </Link>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log("Offer data:", offer);
  console.log("Offer price:", offer.price);
  console.log("Offer status:", offer.status);

  const statusInfo = getStatusMessage(offer.status || "Pending");

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Link
          href="/dashboard/seller-opportunities/my-offers"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to My Offers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Offer Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Offer Details
                </h1>
                {getOfferStatusBadge(offer.status || "Pending")}
              </div>

              {/* Status message */}
              <div className={`p-4 rounded-lg border mb-6 ${statusInfo.color}`}>
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">{statusInfo.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {statusInfo.title}
                    </h3>
                    <p className="text-gray-600">{statusInfo.message}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  {offer.title || "No title"}
                </h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {offer.description || "No description"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiDollarSign className="mr-2 text-blue-600" />
                    <span className="font-medium">Price</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${offer.price ? offer.price.toLocaleString() : "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiCalendar className="mr-2 text-blue-600" />
                    <span className="font-medium">Dates</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-500">Submitted:</span>{" "}
                      {offer.createdAt ? formatDate(offer.createdAt) : "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Expires:</span>{" "}
                      {offer.expiryDate ? formatDate(offer.expiryDate) : "N/A"}
                    </p>
                    {offer.updatedAt &&
                      offer.createdAt &&
                      offer.updatedAt !== offer.createdAt && (
                        <p className="text-sm">
                          <span className="text-gray-500">Last updated:</span>{" "}
                          {formatDate(offer.updatedAt)}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Images */}
              {offer.images && offer.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {offer.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border"
                      >
                        <img
                          src={image}
                          alt={`Offer image ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="border-t pt-6 mt-6">
                <div className="flex flex-wrap gap-4">
                  {(offer.status || "Pending") === "Pending" && (
                    <button
                      onClick={handleDeleteOffer}
                      disabled={deleting}
                      className="flex items-center px-5 py-2.5 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 className="mr-2" />
                      {deleting ? "Cancelling..." : "Cancel Offer"}
                    </button>
                  )}

                  {((offer.status || "Pending") === "Accepted" ||
                    (offer.status || "Pending") === "Rejected") && (
                    <Link
                      href="/dashboard/messages"
                      className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiMessageCircle className="mr-2" />
                      Contact Buyer
                    </Link>
                  )}

                  {((offer.status || "Pending") === "Rejected" ||
                    (offer.status || "Pending") === "Expired" ||
                    (offer.status || "Pending") === "Cancelled") &&
                    buyerRequest &&
                    buyerRequest.status === "Active" && (
                      <Link
                        href={`/dashboard/seller-opportunities/${buyerRequest._id}`}
                        className="flex items-center px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FiPlus className="mr-2" />
                        Make New Offer
                      </Link>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Request Details */}
        <div className="lg:col-span-1">
          {buyerRequest ? (
            <div className="bg-white rounded-xl shadow-md p-6 border sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Buyer Request
              </h2>

              <h3 className="font-medium text-lg mb-2">
                {buyerRequest.title || "No title"}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {buyerRequest.description || "No description"}
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <FiCalendar className="mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Posted</p>
                    <p className="text-sm font-medium">
                      {buyerRequest.createdAt
                        ? formatDate(buyerRequest.createdAt)
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {(buyerRequest.yearFrom || buyerRequest.yearTo) && (
                  <div className="flex items-start">
                    <FiCalendar className="mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Year Range</p>
                      <p className="text-sm font-medium">
                        {buyerRequest.yearFrom && buyerRequest.yearTo
                          ? `${buyerRequest.yearFrom} - ${buyerRequest.yearTo}`
                          : buyerRequest.yearFrom
                          ? `From ${buyerRequest.yearFrom}`
                          : `Until ${buyerRequest.yearTo}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <FiDollarSign className="mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-sm font-medium text-green-700">
                      {buyerRequest.budgetMin
                        ? `$${buyerRequest.budgetMin.toLocaleString()} - $${buyerRequest.budgetMax.toLocaleString()}`
                        : `Up to $${buyerRequest.budgetMax.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <TbCar className="mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <p className="text-sm font-medium">
                      {buyerRequest.make} {buyerRequest.model}
                    </p>
                  </div>
                </div>
              </div>

              {buyerRequest.status === "Active" && (
                <div className="mt-6 pt-4 border-t">
                  <Link
                    href={`/dashboard/seller-opportunities/${buyerRequest._id}`}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Request Details
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 border">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Buyer Request
              </h2>
              <p className="text-gray-500">Request details not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPage;
