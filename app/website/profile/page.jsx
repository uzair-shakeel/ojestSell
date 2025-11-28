"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  FaShareSquare,
  FaRegClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaGlobe,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { BsBoxArrowUp } from "react-icons/bs";
import { getPublicUserInfo } from "../../../services/userService";
import { getAllCars } from "../../../services/carService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Helper function defined OUTSIDE the component
const formatImageUrl = (imagePath) => {
  if (!imagePath) return "/website/seller.jpg";
  if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
    return imagePath;
  }
  return `${API_BASE}/${imagePath.replace("\\", "/")}`;
};

// --- MOCK DATA FOR COMMENTS ---
const MOCK_COMMENTS = [
  {
    id: 101,
    carName: "2010 Dodge Viper ACR Roadster",
    carImage: "/images/hamer1.png",
    date: "November 24, 2025 8:25 PM",
    text: "Re: ACRSNK Refer to images 116 and this for passenger side flaws...",
    upvotes: 1,
    currentBid: 97777,
    timeLeft: "5:20:52",
  },
];

const ProfilePage = ({ params }) => {
  // 1. Handle Parameters safely
  // This handles dynamic routes like /profile/[id] OR query strings /profile?id=...
  const unwrappedParams = React.use(params);
  const searchParams = useSearchParams();
  
  // Prioritize dynamic param, fallback to search query 'id'
  const sellerId = unwrappedParams?.profile || unwrappedParams?.id || searchParams.get("id");

  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!sellerId) {
        setError("No seller ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);

        // 1. Fetch User Data
        const userData = await getPublicUserInfo(sellerId);
        setUser(userData);

        // 2. Fetch All Cars and filter for this seller
        const allCarsData = await getAllCars();
        const allCarsArray = Array.isArray(allCarsData) ? allCarsData : allCarsData.cars || [];

        // Filter logic: handles if createdBy is a string or an object
        const sellerCars = allCarsArray.filter((c) => {
          const carCreatorId = typeof c.createdBy === 'object' ? c.createdBy._id : c.createdBy;
          return String(carCreatorId) === String(sellerId);
        });

        setCars(sellerCars);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold text-gray-700">User not found</h2>
        <p className="text-gray-500">{error || "Please check the link and try again."}</p>
      </div>
    );
  }

  // --- Derived Data for UI ---
  const displayName =
    user?.companyName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "User";
  
  const bio = user?.description || "No description provided.";
  
  // Location Logic (MongoDB is [Lng, Lat], Google needs Lat, Lng)
  const hasLocation = user?.location?.coordinates && user.location.coordinates.length === 2;
  const mapCenter = hasLocation
    ? {
        lat: user.location.coordinates[1],
        lng: user.location.coordinates[0],
      }
    : { lat: 52.22977, lng: 21.01178 }; // Default (Warsaw)

  const handleGetDirections = () => {
    if (!mapCenter) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mapCenter.lat},${mapCenter.lng}`;
    window.open(url, "_blank");
  };

  const phones = user?.phoneNumbers || [];
  const socials = user?.socialMedia || {};

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER SECTION */}
      <div className="border-b border-gray-200 max-w-[720px] mx-auto">
        <div className="max-w-[720px] mx-auto py-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar */}
            <div className="relative w-32 h-32 md:w-[156px] md:h-[156px] flex-shrink-0">
              <Image
                src={formatImageUrl(user?.image || user?.profilePicture)}
                alt={displayName}
                fill
                className="rounded-full object-cover shadow-sm bg-gray-100"
              />
            </div>

            {/* Info */}
            <div className="flex-grow w-full">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  {displayName}
                </h1>
              </div>

              {/* Bio */}
              <div className="mt-4 text-base text-gray-800 font-medium">
                {bio}
              </div>

              {/* Tabs */}
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`flex items-center gap-1 text-[15px] transition-colors ${
                    activeTab === "general"
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded shadow-sm"
                      : ""
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setActiveTab("location")}
                  className={`flex items-center gap-1 text-[15px] transition-colors ${
                    activeTab === "location"
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded shadow-sm"
                      : ""
                  }`}
                >
                  Location
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`flex items-center gap-1 text-[15px] transition-colors ${
                    activeTab === "contact"
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded shadow-sm"
                      : ""
                  }`}
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="max-w-[720px] mx-auto py-10">
        
        {/* --- GENERAL TAB --- */}
        {activeTab === "general" && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Cars List */}
            <section>
              <div className="flex items-center justify-between pb-4 mb-6">
                <h2 className="text-[28px] font-bold text-gray-900">
                  Cars Auctioned
                  <span className="text-gray-500 font-normal text-[16px] ml-1">
                    (Listed {cars.length})
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cars.length > 0 ? (
                  cars.map((car) => (
                    <div key={car._id || car.id} className="flex flex-col">
                      <div className="relative h-[146px] w-[223px]">
                        <Image
                          src={formatImageUrl(car.images?.[0] || car.image)}
                          alt={`${car.year} ${car.make} ${car.model}`}
                          fill
                          className="object-cover rounded bg-gray-200"
                        />
                        {car.isFeatured && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-2 py-1 rounded shadow-sm">
                            FEATURED
                          </div>
                        )}
                        <div className="bg-[#363636] backdrop-blur text-white absolute bottom-3 left-3 flex gap-2 rounded">
                          <div className="text-sm font-medium px-3 py-1 flex items-center">
                            <FaRegClock className="mr-1.5 text-gray-300" />
                            Active
                          </div>
                          <div className="text-sm font-medium px-3 py-1">
                            Bid ${car.financialInfo?.priceNetto?.toLocaleString() || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="metadata mt-3 px-1">
                        <div className="mb-1">
                          <a
                            href={`/website/cars/${car._id}`}
                            className="text-[16px] text-[#262626] hover:underline leading-tight block"
                            title={`${car.year} ${car.make} ${car.model}`}
                          >
                            {car.year} {car.make} {car.model}
                          </a>
                        </div>
                        <div className="text-[#666] gap-0.5">
                          <p className="text-[14px] line-clamp-1">
                            {car.description || `${car.make} ${car.model}`}
                          </p>
                          <p className="text-[14px] uppercase">
                            {car.country || "Location N/A"}
                          </p>
                          <p className="text-[14px]">
                            {new Date(car.createdAt).toLocaleDateString("en-US", {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-3 text-center py-4">No cars listed by this seller.</p>
                )}
              </div>
            </section>

            {/* Comments Section */}
            <section>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Auction Comments <span className="text-gray-500 font-normal text-lg">({MOCK_COMMENTS.length} comments)</span>
                </h2>
              </div>
              <ul className="comment-cards flex flex-col gap-6">
                {MOCK_COMMENTS.map((comment) => (
                  <li key={comment.id} className="flex flex-col sm:flex-row gap-4">
                    <div className="is-visible w-full sm:w-[260px] flex-shrink-0">
                      <div className="block w-full relative aspect-[16/10] sm:h-[160px] rounded overflow-hidden">
                        <div className="relative h-[146px] w-[223px]">
                          <Image
                            src={comment.carImage}
                            alt={comment.carName}
                            fill
                            className="object-cover rounded"
                          />
                          <div className="bg-[#363636] backdrop-blur text-white absolute bottom-3 left-3 flex gap-2 rounded">
                            <div className="text-sm font-medium px-3 py-1 flex items-center">
                              <FaRegClock className="mr-1.5 text-gray-300" />
                              {comment.timeLeft}
                            </div>
                            <div className="text-sm font-medium px-3 py-1">
                              Bid ${comment.currentBid.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="metadata flex-grow flex flex-col">
                      <div className="auction-title mb-1">
                        <span className="text-[16px] font-bold text-[#262626]">
                          {comment.carName}
                        </span>
                      </div>
                      <div className="comment-time text-[14px] text-[#666] mb-3">
                        {comment.date}
                      </div>
                      <div className="comment-text mb-3">
                        <p className="text-[14px] text-[#262626] leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* --- LOCATION TAB --- */}
        {activeTab === "location" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-80 w-full relative bg-gray-100">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&hl=en;z=14&output=embed`}
                ></iframe>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Based in</h3>
                <p className="text-lg text-gray-600">
                  {hasLocation ? user.location.address || "Seller's Location" : "Location not specified"}
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleGetDirections}
                    className="text-blue-600 font-semibold text-sm hover:underline flex items-center transition-colors hover:text-blue-800"
                  >
                    Get Directions <FaShareSquare className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CONTACT TAB --- */}
        {activeTab === "contact" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Contact Information
              </h3>
              <div className="space-y-4">
                {phones.length > 0 ? (
                  phones.map((phoneObj, idx) => {
                    const phone = typeof phoneObj === "object" ? phoneObj.number || phoneObj.phone : phoneObj;
                    return (
                      <a key={idx} href={`tel:${phone}`} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <FaPhoneAlt />
                          </div>
                          <span className="font-medium text-gray-900 text-lg">{phone}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-blue-600">Call</span>
                      </a>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500">No phone numbers listed.</p>
                )}

                {user?.email && (
                  <a href={`mailto:${user.email}`} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <MdEmail className="text-xl" />
                      </div>
                      <span className="font-medium text-gray-900 text-lg">{user.email}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-400 group-hover:text-blue-600">Email</span>
                  </a>
                )}

                <div className="border-t my-6 border-gray-100"></div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {socials?.website && (
                    <a href={socials.website.startsWith("http") ? socials.website : `https://${socials.website}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-gray-400 hover:shadow-sm transition-all text-center gap-2">
                      <FaGlobe className="text-2xl text-gray-600" />
                      <span className="text-sm font-medium">Website</span>
                    </a>
                  )}
                  {socials?.instagram && (
                    <a href={socials.instagram.startsWith("http") ? socials.instagram : `https://${socials.instagram}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50 transition-all text-center gap-2">
                      <FaInstagram className="text-2xl" />
                      <span className="text-sm font-medium">Instagram</span>
                    </a>
                  )}
                  {socials?.facebook && (
                    <a href={socials.facebook.startsWith("http") ? socials.facebook : `https://${socials.facebook}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all text-center gap-2">
                      <FaFacebook className="text-2xl" />
                      <span className="text-sm font-medium">Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;