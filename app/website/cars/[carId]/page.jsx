"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ConditionTab from "../../../../components/website/ConditionTab";
import DetailTab from "../../../../components/website/DetailTab";
import LocationTab from "../../../../components/website/LocationTab";
import FinancialTab from "../../../../components/website/FinancialTab";
import SimilarVehicles from "../../../../components/website/SimilarVehicles";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { getCarById } from "../../../../services/carService";
import { getUserById } from "../../../../services/userService";
import { useUser } from "@clerk/nextjs";
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
});

const Page = () => {
  const [activeTab, setActiveTab] = useState("description");
  const { carId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [car, setCar] = useState(null);
  const [seller, setSeller] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/images/default-seller.png";
    return `${process.env.NEXT_PUBLIC_API_URL}/${imagePath.replace("\\", "/")}`;
  };

  const getCityFromCoordinates = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      );
      const data = await response.json();
      return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        "Unknown Location"
      );
    } catch (err) {
      console.error("Error geocoding coordinates:", err);
      return "Unknown Location";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carData = await getCarById(carId);
        setCar(carData);
        const firstImage = carData?.images?.[0] || "/images/hamer1.png";
        setMainImage(formatImageUrl(firstImage));

        const sellerData = await getUserById(carData.createdBy);
        setSeller(sellerData);

        if (sellerData?.location?.coordinates) {
          const cityName = await getCityFromCoordinates(
            sellerData.location.coordinates[1],
            sellerData.location.coordinates[0]
          );
          setCity(cityName);
        } else {
          setCity(carData.location?.city || "Unknown Location");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load car or seller details.");
      }
    };

    if (carId) fetchData();
  }, [carId]);

  useEffect(() => {
    if (user) {
      socket.auth = { userId: user.id };
      socket.connect();
      return () => socket.disconnect();
    }
  }, [user]);

  const startChat = async () => {
    if (!user) {
      alert("Please log in to start a chat.");
      return;
    }
    if (!seller) {
      alert("Seller information not available.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/chat/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user.id,
        },
        body: JSON.stringify({
          carId,
          ownerId: car.createdBy,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const chat = await response.json();
      router.push(`/dashboard/messages`);
    } catch (err) {
      console.error("Error creating chat:", err);
      alert("Failed to start chat. Please try again.");
    }
  };

  const renderContent = () => {
    const animationVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    if (!car) return <p>Loading...</p>;

    switch (activeTab) {
      case "description":
        return (
          <motion.div
            key="description"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <DetailTab cardetails={car} />
          </motion.div>
        );
      case "conditions":
        return (
          <motion.div
            key="conditions"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <ConditionTab carCondition={car.carCondition} />
          </motion.div>
        );
      case "location":
        return (
          <motion.div
            key="location"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <LocationTab location={car.location} />
          </motion.div>
        );
      case "financial":
        return (
          <motion.div
            key="financial"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
          >
            <FinancialTab financialInfo={car.financialInfo} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading car details...</p>
      </div>
    );
  }

  const sellerName = seller
    ? `${seller.firstName || ""} ${seller.lastName || ""}`.trim() ||
      seller.companyName ||
      "Seller"
    : "Seller";

  const locationDisplay = city || "Unknown Location";

  const socialMediaLinks = [
    {
      platform: "instagram",
      icon: <FaInstagram />,
      url: seller?.socialMedia?.instagram,
    },
    {
      platform: "facebook",
      icon: <FaFacebook />,
      url: seller?.socialMedia?.facebook,
    },
    {
      platform: "twitter",
      icon: <FaTwitter />,
      url: seller?.socialMedia?.twitter,
    },
  ].filter((link) => link.url && link.url.trim() !== "");

  return (
    <div className="lg:mx-20 p-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <h1 className="text-3xl font-bold mt-6">{`${car.make} ${car.model} ${car.year}`}</h1>
          <div className="grid grid-cols-2 mt-6">
            <div className="col-span-2 overflow-hidden relative group">
              <img
                src={mainImage}
                alt={`${car.make} ${car.model}`}
                className="w-full h-[450px] object-cover rounded group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="col-span-2 relative mt-4">
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full z-10"
                onClick={() =>
                  document
                    .getElementById("thumbnailScroll")
                    .scrollBy({ left: -100, behavior: "smooth" })
                }
              >
                <IoIosArrowBack className="w-6 h-6" />
              </button>
              <div
                id="thumbnailScroll"
                className="flex overflow-x-auto space-x-2 p-1 scrollbar-custom"
                style={{ scrollBehavior: "smooth" }}
              >
                {(car.images || ["/images/hamer1.png"]).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(formatImageUrl(img))}
                    className="flex-shrink-0 focus:outline-none"
                  >
                    <img
                      src={formatImageUrl(img)}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-[120px] h-[80px] object-cover rounded-md border ${
                        mainImage === formatImageUrl(img)
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full shadow-md z-10"
                onClick={() =>
                  document
                    .getElementById("thumbnailScroll")
                    .scrollBy({ left: 100, behavior: "smooth" })
                }
              >
                <IoIosArrowForward className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="col-span-2 bg-white rounded-md mt-5">
            <div className="gap-2 mb-4 grid grid-cols-2 md:grid-cols-4">
              {["description", "conditions", "location", "financial"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 border border-gray-200 ${
                      activeTab === tab
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700"
                    } rounded-md`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                )
              )}
            </div>
            {renderContent()}
          </div>
        </div>
        <div className="col-span-1 sm:mt-20">
          <div className="w-full p-4 bg-white rounded-sm border sticky top-4 shadow">
            <div className="py-3 flex flex-row">
              <div className="flex flex-col items-start">
                <h3 className="text-base font-medium mb-2">PRICE</h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {car.financialInfo?.priceNetto
                    ? `${car.financialInfo.priceNetto} zł `
                    : "N/A"}{" "}
                  <span className="text-xl text-gray-600">(NETTO)</span>
                </p>
                <p className="text-xl font-medium text-gray-600 underline">
                  {car.financialInfo?.priceWithVat
                    ? `${car.financialInfo.priceWithVat} zł`
                    : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center my-4">
              <div className="flex-grow border-b"></div>
              <p className="px-2 text-gray-500 text-sm">OR</p>
              <div className="flex-grow border-b"></div>
            </div>
            <div className="gap-2 flex flex-col">
              <button
                className="w-full border border-gray-500 py-3 rounded-md font-semibold"
                onClick={() => setActiveTab("financial")}
              >
                See more Financial Details
              </button>
            </div>
            <div className="flex items-center space-x-3 my-5">
              <div className="w-24 h-20 overflow-hidden rounded-full">
                <Image
                  src={formatImageUrl(seller?.image)}
                  alt={sellerName}
                  width={80}
                  height={80}
                  className="object-center w-20 h-20"
                />
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <p className="text-black text-lg lg:text-xl">
                    <strong>{sellerName}</strong>
                  </p>
                </div>
                <p className="text-base text-gray-500">
                  {seller?.sellerType || "Unknown Seller Type"}
                </p>
                <div className="flex justify-start items-center space-x-2">
                  <img
                    src="/website/map.svg"
                    alt="Map Icon"
                    className="w-5 h-5"
                  />
                  <p className="text-base text-gray-500">{locationDisplay}</p>
                </div>
              </div>
            </div>
            <hr className="my-4" />
            <div className="grid grid-cols-2 gap-2 mt-4">
              <h2 className="text-base font-medium mb-2 col-span-2">
                Contact Seller
              </h2>
              <button
                onClick={startChat}
                className="w-full bg-white-500 text-blue-600 py-3 border border-blue-600 rounded-md font-semibold flex items-center justify-center space-x-2"
              >
                <img
                  src="/website/whats.svg"
                  alt="Message"
                  className="w-5 h-5"
                />
                <span>Message</span>
              </button>
              <button
                className="w-full border py-3 rounded-md font-semibold bg-blue-500 flex items-center justify-center space-x-2"
                disabled={!seller?.phoneNumbers?.[0]}
                onClick={() =>
                  seller?.phoneNumbers?.[0] &&
                  window.open(`tel:${seller.phoneNumbers[0]}`)
                }
              >
                <img src="/website/call.svg" alt="Call" className="w-5 h-5" />
                <span className="text-white">
                  {seller?.phoneNumbers?.[0] ? "Call" : "No Phone"}
                </span>
              </button>
            </div>
            {socialMediaLinks.length > 0 && (
              <div className="flex items-center justify-center space-x-4 my-7">
                {socialMediaLinks.map(({ platform, icon, url }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-3xl transition-all duration-300 hover:opacity-75 text-blue-600"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <SimilarVehicles />
    </div>
  );
};

export default Page;
