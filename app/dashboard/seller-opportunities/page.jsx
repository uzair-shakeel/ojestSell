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
              "Możliwości sprzedaży są dostępne tylko dla sprzedawców firmowych"
            );
            return;
          }

          fetchRequests();
          fetchUserCars();
          fetchMyOffers();
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Nie udało się załadować informacji o użytkowniku");
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
      toast.error("Nie udało się załadować zapytań kupującego");
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
      toast.error("Nie udało się załadować Twoich ofert");
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Możliwości Sprzedaży 🚀
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              Przeglądaj zapytania kupujących i składaj oferty swoimi samochodami.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/cars/add" className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-1">
              <FiPlus className="w-5 h-5" /> Wystaw Auto
            </Link>
          </div>
        </div>

        {/* My Offers Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FiList />
              </span>
              Twoje Aktywne Oferty
            </h2>
            <Link
              href="/dashboard/seller-opportunities/my-offers"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Zobacz wszystkie →
            </Link>
          </div>

          {offersLoading ? (
            <div className="w-full h-40 flex items-center justify-center bg-white rounded-3xl border border-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : myOffers.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <FiList className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Brak aktywnych ofert
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Nie złożyłeś jeszcze żadnej oferty. Przejrzyj zapytania poniżej i znajdź klienta!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Oferta / Auto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Cena
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Wysłano
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Akcja
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {myOffers.map((offer) => (
                      <tr key={offer._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {offer.title}
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">
                            {/* Placeholder for car model if available in offer object later */}
                            ID: {offer._id.slice(-6)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg w-fit">
                            ${offer.price.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 font-medium">
                            {formatDate(offer.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getOfferStatusBadge(offer.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/dashboard/seller-opportunities/my-offers/${offer._id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <FiChevronRight />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
                  <FiSearch />
                </span>
                Zapytania Kupujących
              </h2>
              <p className="text-gray-500 font-medium mt-1 ml-10">
                Znaleziono {requests.length} pasujących zapytań
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm
                  ${showFilters ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
            >
              <FiFilter />
              {showFilters ? "Ukryj Filtry" : "Filtruj Wyniki"}
            </button>
          </div>

          {showFilters && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 animate-in slide-in-from-top-2 duration-200">
              <form
                onSubmit={handleFilterSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
              >
                <div>
                  <label htmlFor="make" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Marka</label>
                  <input
                    id="make"
                    name="make"
                    type="text"
                    value={filters.make}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="Np. BMW"
                  />
                </div>

                <div>
                  <label htmlFor="model" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Model</label>
                  <input
                    id="model"
                    name="model"
                    type="text"
                    value={filters.model}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="Np. X5"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-1"
                  >
                    Szukaj
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-5 py-3 bg-white text-gray-700 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Wyczyść
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
              {/* Empty state content remains similar but styled */}
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <TbCar className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Nie znaleziono żadnych próśb kupujących

              </h2>
              <p className="text-gray-500 mb-4">
                Obecnie nie ma aktywnych zapytań kupujących, które spełniałyby wybrane przez Ciebie filtry..
              </p>
              {Object.values(filters).some(Boolean) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Wyczyść Filtry
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                  >
                    {/* Car Header with badge */}
                    <div className="bg-blue-50/50 border-b border-blue-50 px-6 py-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <TbCar />
                        </span>
                        <span className="font-bold text-gray-900">
                          {request.make} {request.model}
                        </span>
                      </div>
                      <span className="bg-white text-green-700 text-xs px-3 py-1 rounded-full border border-green-100 font-bold shadow-sm">
                        {calculateDaysLeft(request.expiryDate)} dni
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                        {request.title}
                      </h3>

                      <p className="text-gray-500 mb-6 line-clamp-2 text-sm">
                        {request.description}
                      </p>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                        {(request.yearFrom || request.yearTo) && (
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Rok</p>
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                              <FiCalendar className="text-gray-400" />
                              {request.yearFrom && request.yearTo
                                ? `${request.yearFrom}-${request.yearTo}`
                                : request.yearFrom
                                  ? `Od ${request.yearFrom}`
                                  : `Do ${request.yearTo}`}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Budżet</p>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                            <FiDollarSign className="text-emerald-500" />
                            {request.budgetMin
                              ? `${(request.budgetMin / 1000).toFixed(0)}k - ${(request.budgetMax / 1000).toFixed(0)}k `
                              : `< ${(request.budgetMax / 1000).toFixed(0)}k`}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-gray-50 pt-4">
                        <Link
                          href={`/dashboard/buyer-requests/${request._id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
                        >
                          <FiEye /> Podgląd
                        </Link>
                        <Link
                          href={`/dashboard/seller-opportunities/${request._id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm hover:-translate-y-0.5"
                        >
                          <FiPlus /> Oferta
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      ←
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-gray-900 flex items-center">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* User Cars Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">
                  <TbCarGarage />
                </span>
                Twoja Flota
              </h2>
              <p className="text-gray-500 font-medium mt-1 ml-10">
                Auta gotowe do wystawienia w ofertach
              </p>
            </div>
            <Link
              href="/dashboard/cars/add"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-1"
            >
              <FiPlus /> Dodaj Nowe
            </Link>
          </div>

          {carsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : userCars.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-10 text-center border border-gray-100">
              <div className="bg-gray-50 p-4 rounded-full mb-4 inline-block">
                <TbCarGarage className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Brak wystawionych samochodów
              </h3>
              <p className="text-gray-500 mb-6 font-medium">
                Dodaj samochody do swojego asortymentu, aby szybko składać oferty kupującym.
              </p>
              <Link
                href="/dashboard/cars/add"
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg font-bold inline-block"
              >
                Dodaj pierwszy samochód
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userCars.slice(0, 4).map((car) => (
                <div
                  key={car._id}
                  className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-all group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={car.images[0] || "/placeholder.jpg"}
                      alt={car.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-gray-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                        {car.year}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                      <p className="text-white font-bold text-xl">
                        ${car.financialInfo.priceNetto.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                      {car.make} {car.model}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs font-bold uppercase">
                        {car.condition}
                      </span>
                      <span className="text-gray-300 text-xs">•</span>
                      <span className="text-gray-400 text-xs font-medium">ID: {car._id.slice(-4)}</span>
                    </div>

                    <Link
                      href={`/dashboard/cars/${car._id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors"
                    >
                      Szczegóły <FiArrowRight />
                    </Link>
                  </div>
                </div>
              ))}

              {userCars.length > 4 && (
                <div className="flex flex-col justify-center items-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-6 hover:bg-gray-100 transition-colors group cursor-pointer h-full min-h-[300px]" onClick={() => router.push('/dashboard/cars')}>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <span className="font-bold text-gray-500 group-hover:text-gray-800">Zobacz wszystkie</span>
                  <span className="text-sm font-medium text-gray-400">{userCars.length} aut</span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SellerOpportunitiesPage;
