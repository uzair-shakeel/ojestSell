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
      toast.error("Nie udało się załadować Twojego zapytania");
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
      toast.error("Nie udało się załadować ofert");
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
      toast.error("Nie udało się załadować ofert");
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
      toast.error("Nie udało się załadować ofert dla tego zapytania");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm("Czy na pewno chcesz anulować to zapytanie?")) {
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
        toast.success("Zapytanie zostało anulowane");
        fetchRequests(activeTab);
      } catch (error) {
        console.error("Error deleting request:", error);
        toast.error("Nie udało się anulować zapytania");
      }
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (
      window.confirm(
        "Czy na pewno chcesz zaakceptować tę ofertę? Spowoduje to zamknięcie Twojego zapytania i odrzucenie wszystkich pozostałych ofert."
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
        toast.success("Oferta została zaakceptowana");
        if (activeTab === "received-offers") {
          fetchAllOffers();
        } else {
          fetchRequests(activeTab);
        }
        setShowOffersModal(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error("Error accepting offer:", error);
        toast.error("Nie udało się zaakceptować oferty");
      }
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (window.confirm("Czy na pewno chcesz odrzucić tę ofertę?")) {
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
        toast.success("Oferta została odrzucona");
        if (activeTab === "received-offers") {
          fetchAllOffers();
        } else {
          fetchRequests(activeTab);
        }
        setShowOffersModal(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error("Error rejecting offer:", error);
        toast.error("Nie udało się odrzucić oferty");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
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
      Active: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800",
      Fulfilled: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      Expired: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800",
      Cancelled: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Twoje Zapytania 📋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Zarządzaj swoimi poszukiwaniami i przeglądaj oferty od sprzedawców.
            </p>
          </div>
          <Link
            href="/dashboard/buyer-requests/add"
            className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-1"
          >
            <FiPlus className="w-5 h-5" /> Nowe Zapytanie
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-fit">
          {[
            { id: "active", label: "Aktywne" },
            { id: "fulfilled", label: "Zrealizowane" },
            { id: "cancelled", label: "Anulowane" },
            { id: "expired", label: "Wygasłe" },
            { id: "received-offers", label: "Otrzymane Oferty" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                ? "bg-gray-900 dark:bg-blue-600 text-white shadow-md"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "received-offers" ? (
          // Received Offers Tab
          allOffersLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allOffers.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-800">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full inline-flex mb-4">
                    <FiDollarSign className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Brak ofert
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Nie otrzymałeś jeszcze żadnych ofert. Utwórz prośbę o samochód, aby rozpocząć otrzymywanie ofert od sprzedawców.
                  </p>
                  <Link
                    href="/dashboard/buyer-requests/add"
                    className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-1"
                  >
                    <FiPlus className="mr-2" /> Utwórz nowe zapytanie
                  </Link>
                </div>
              ) : (
                allOffers.map((offer) => (
                  <div
                    key={offer._id}
                    className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all group flex flex-col"
                  >
                    {/* Car Image Header */}
                    <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {offer.carInfo?.images?.[0] ? (
                        <img
                          src={offer.carInfo.images[0]}
                          alt={offer.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                          <TbCar className="w-12 h-12 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase shadow-sm backdrop-blur-md ${offer.status === "Pending"
                            ? "bg-yellow-100/90 dark:bg-yellow-900/90 text-yellow-800 dark:text-yellow-200"
                            : offer.status === "Accepted"
                              ? "bg-emerald-100/90 dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-200"
                              : offer.status === "Rejected"
                                ? "bg-red-100/90 dark:bg-red-900/90 text-red-800 dark:text-red-200"
                                : "bg-gray-100/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200"
                            }`}
                        >
                          {offer.status === "Pending" ? "Oczekująca" : offer.status}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 dark:from-black via-black/40 to-transparent p-4">
                        <p className="text-white font-bold text-xl">
                          ${offer.price?.toLocaleString() || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1 mb-1">
                          {offer.title}
                        </h3>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-medium bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg w-fit">
                          <TbCar className="mr-1.5" />
                          Do zapytania: <span className="text-gray-900 dark:text-gray-200 ml-1 truncate max-w-[120px]">{offer.requestTitle}</span>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl">
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase block mb-1">Auto</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate block">
                            {offer.carInfo ? `${offer.carInfo.make} ${offer.carInfo.model}` : "Info niedostępne"}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl">
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase block mb-1">Sprzedawca</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate block">
                            {offer.sellerInfo?.firstName} {offer.sellerInfo?.lastName}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                        <button
                          onClick={() => handleAcceptOffer(offer._id)}
                          className="flex items-center justify-center py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-bold text-sm shadow-lg shadow-emerald-100 dark:shadow-emerald-900/40"
                        >
                          Potwierdź
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer._id)}
                          className="flex items-center justify-center py-2.5 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold text-sm"
                        >
                          Odrzuć
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
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-800">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full inline-flex mb-4">
                    <TbCar className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Brak {activeTab === "active" ? "aktywnych" : activeTab} zapytań
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Utwórz nowe zapytanie, aby zacząć otrzymywać oferty od sprzedawców i znaleźć swój wymarzony samochód.
                  </p>
                  <Link
                    href="/dashboard/buyer-requests/add"
                    className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-1"
                  >
                    <FiPlus className="mr-2" /> Utwórz nowe zapytanie
                  </Link>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all group flex flex-col"
                  >
                    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-50 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${request.status === "Active"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : request.status === "Fulfilled"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : request.status === "Cancelled"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                          }`}
                      >
                        {request.status === "Active" ? "Aktywne" : request.status}
                      </span>
                      {request.status === "Active" && (
                        <span className="text-xs font-bold text-gray-400 flex items-center">
                          <FiClock className="mr-1" /> {calculateDaysLeft(request.expiryDate)} dni
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {request.title}
                      </h3>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 mt-2">
                        {(request.make || request.model) && (
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Pojazd</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                              <TbCar className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                              {request.make} {request.model}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Budżet</p>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            <FiDollarSign className="text-emerald-500 dark:text-emerald-500 flex-shrink-0" />
                            {request.budgetMin
                              ? `${(request.budgetMin / 1000).toFixed(0)}k - ${(request.budgetMax / 1000).toFixed(0)}k`
                              : `< ${(request.budgetMax / 1000).toFixed(0)}k`}
                          </div>
                        </div>
                      </div>

                      {/* Stats & Metadata */}
                      <div className="flex items-center justify-between py-3 border-t border-b border-gray-50 dark:border-gray-800 mb-4">
                        <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                          <FiCalendar className="mr-1.5" />
                          {formatDate(request.createdAt)}
                        </div>
                        <button
                          onClick={() => toggleRequestExpanded(request._id)}
                          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors ${expandedRequests.has(request._id) ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                          <FiDollarSign />
                          {requestOffers[request._id]?.length || 0} Ofert
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/buyer-requests/${request._id}`}
                          className="flex-1 py-2.5 flex items-center justify-center bg-gray-900 dark:bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors shadow-md"
                        >
                          Szczegóły
                        </Link>
                        <Link
                          href={`/dashboard/buyer-requests/${request._id}/edit`}
                          className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Edytuj"
                        >
                          <FiEdit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteRequest(request._id)}
                          className="p-2.5 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Usuń"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Inline Offers - Premium Dropdown */}
                      {expandedRequests.has(request._id) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              Oferty ({requestOffers[request._id]?.length || 0})
                            </span>
                            {requestOffers[request._id]?.length > 0 && (
                              <button
                                onClick={() => handleViewOffers(request)}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Zobacz wszystkie
                              </button>
                            )}
                          </div>

                          {!requestOffers[request._id] ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 mx-auto"></div>
                            </div>
                          ) : requestOffers[request._id].length === 0 ? (
                            <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Brak ofert</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {requestOffers[request._id]
                                .slice(0, 3)
                                .map((offer) => (
                                  <div
                                    key={offer._id}
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex gap-3 items-center group/offer hover:border-blue-100 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors"
                                  >
                                    <div className="h-10 w-14 bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                      {offer.carInfo?.images?.[0] ? (
                                        <img src={offer.carInfo.images[0]} className="w-full h-full object-cover" alt="" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600"><TbCar /></div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-bold text-gray-800 dark:text-gray-200 text-xs truncate">{offer.title}</h5>
                                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">${offer.price?.toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover/offer:opacity-100 transition-opacity">
                                      <button onClick={() => handleAcceptOffer(offer._id)} className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900" title="Akceptuj"><span className="sr-only">Akceptuj</span>✓</button>
                                      <button onClick={() => handleRejectOffer(offer._id)} className="p-1.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900" title="Odrzuć"><span className="sr-only">Odrzuć</span>✕</button>
                                    </div>
                                  </div>
                                ))}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-transparent dark:border-gray-800">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Oferty dla: {selectedRequest.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                    {selectedRequest.make} {selectedRequest.model}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowOffersModal(false);
                    setSelectedOffer(null);
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
                {offersLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 m-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FiInfo className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Brak ofert
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Sprzedawcy nie zrobili żadnych ofert dla tego zapytania.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div
                        key={offer._id}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Car Images */}
                          <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden self-start">
                            {offer.carInfo?.images?.[0] ? (
                              <div className="aspect-video relative">
                                <img
                                  src={offer.carInfo.images[0]}
                                  alt={`${offer.carInfo.make} ${offer.carInfo.model}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                  {offer.carInfo.images.length} zdjęć
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-video flex items-center justify-center text-gray-300 dark:text-gray-600">
                                <TbCar className="w-12 h-12" />
                              </div>
                            )}
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                              <p className="font-bold text-gray-900 dark:text-white text-sm">
                                {offer.carInfo?.make} {offer.carInfo?.model} {offer.carInfo?.year}
                              </p>
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                {offer.title}
                              </h4>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  ${offer.price?.toLocaleString() || "N/A"}
                                </div>
                                <span
                                  className={`inline-block mt-1 px-3 py-1 rounded-lg text-xs font-bold uppercase ${offer.status === "Pending"
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                    : offer.status === "Accepted"
                                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                                      : offer.status === "Rejected"
                                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                                    }`}
                                >
                                  {offer.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                              {offer.description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                              {offer.sellerInfo && (
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl w-full md:w-auto">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                    {offer.sellerInfo.firstName[0]}
                                  </div>
                                  <div className="text-sm">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                      {offer.sellerInfo.firstName} {offer.sellerInfo.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {offer.sellerInfo.companyName || "Osoba prywatna"}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 w-full md:w-auto">
                                <button
                                  onClick={() => handleAcceptOffer(offer._id)}
                                  className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-bold text-sm shadow-md dark:shadow-emerald-900/40"
                                >
                                  Akceptuj
                                </button>
                                <button
                                  onClick={() => handleRejectOffer(offer._id)}
                                  className="flex-1 md:flex-none px-6 py-2.5 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold text-sm"
                                >
                                  Odrzuć
                                </button>
                              </div>
                            </div>
                          </div>
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
