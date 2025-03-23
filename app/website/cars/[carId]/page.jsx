"use client";
import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ConditionTab from "../../../../components/website/ConditionTab";
import DetailTab from "../../../../components/website/DetailTab";
import LocationTab from "../../../../components/website/LocationTab";
import FinancialTab from "../../../../components/website/FinancialTab";
import SimilarVehicles from "../../../../components/website/SimilarVehicles";

const page = () => {
  const [activeTab, setActiveTab] = useState("description");

  const renderContent = () => {
    const animationVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

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
            <DetailTab description="The car has been kept in pristine condition with no modifications or restorations." />
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
            <ConditionTab />
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
            <LocationTab />
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
            <FinancialTab />
          </motion.div>
        );
      default:
        return null;
    }
  };
  const [mainImage, setMainImage] = useState("/images/hamer1.png");
  // const [showMore, setShowMore] = useState(false);

  const images = ["/images/hamer1.png"];
  const description =
    "Fiat Croma turbo second series 155 hp, all completely original, preserved, never restored. Double original keys.Fiat Croma turbo second series 155 hp, all completely original, preserved, never restored. Double original keys.Fiat Croma turbo second series 155 hp, all completely original, preserved, never restored. Double original keys";

  return (
    <div className="md:mx-10 p-2 sm:p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* left side */}
        <div className="col-span-1 md:col-span-2">
          {/* Car Title */}
          <h1 className="text-3xl font-bold mt-6">FORD BRONKO 2024</h1>
          <p className="text-gray-500 text-lg">
            The Polish złoty alternative spelling: zloty
          </p>

          {/* Image Gallery */}
          <div className="grid grid-cols-2 mt-6">
            {/* Main Image */}
            <div className="col-span-2">
              <img
                src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Fiat Croma Turbo"
                width={900}
                height={500}
                className="w-full h-[450px] object-cover rounded"
              />
            </div>

            {/* Thumbnails - Horizontal Scroll */}
            <div className="col-span-2 relative mt-4">
              {/* Scroll Left Button */}
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full  z-10"
                onClick={() => {
                  document
                    .getElementById("thumbnailScroll")
                    .scrollBy({ left: -100, behavior: "smooth" });
                }}
              >
                <IoIosArrowBack className="w-6 h-6" />
              </button>

              {/* Scrollable Thumbnails */}
              <div
                id="thumbnailScroll"
                className="flex overflow-x-auto space-x-2 p-1 scrollbar-custom"
                style={{ scrollBehavior: "smooth" }}
              >
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className="flex-shrink-0 focus:outline-none"
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      width={120}
                      height={80}
                      className={`w-[120px] h-[80px] object-cover rounded-md border ${
                        mainImage === img
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Scroll Right Button */}
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full shadow-md z-10"
                onClick={() => {
                  document
                    .getElementById("thumbnailScroll")
                    .scrollBy({ left: 100, behavior: "smooth" });
                }}
              >
                <IoIosArrowForward className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="col-span-2 bg-white p-1 sm:p-6 rounded-md mt-5">
            {/* Tab Buttons */}
            <div className="gap-2 mb-4 grid grid-cols-2 md:grid-cols-4">
              <button
                className={`px-4 py-2 border border-gray-200 ${
                  activeTab === "description"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700"
                } rounded-md`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                className={`px-4 py-2 border border-gray-200 ${
                  activeTab === "conditions"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700"
                } rounded-md`}
                onClick={() => setActiveTab("conditions")}
              >
                Conditions
              </button>
              <button
                className={`px-4 py-2 border border-gray-200 ${
                  activeTab === "location"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700"
                } rounded-md`}
                onClick={() => setActiveTab("location")}
              >
                Location
              </button>
              <button
                className={`px-4 py-2 border border-gray-200 ${
                  activeTab === "financial"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700"
                } rounded-md`}
                onClick={() => setActiveTab("financial")}
              >
                Financial
              </button>
            </div>

            {/* Content based on active tab */}
            {renderContent()}
          </div>
        </div>
        {/* right side */}
        <div className="col-span-1 mt-28">
          <div className="w-full  p-4 bg-white rounded-sm border sticky top-4 shadow">
            {/* Expert Estimatee */}
            <div className="flex items-center space-x-3 my-4">
              <div className="w-24 h-20  overflow-hidden rounded-full">
                <Image
                  src="/website/seller.jpg"
                  alt="Expert"
                  width={70}
                  height={70}
                  className=" w-full object-center"
                />
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <p className="text-black text-xl">
                    <strong>Yousri Ben Ali</strong>
                  </p>
                  <div className="flex justify-center space-x-2 items-center border border-gray-200 bg-gray-50 rounded-xl p-1">
                    <img src="/website/verify.svg" alt="" className="w-5 h-5" />
                    <p className="text-base text-[#7ED321]">Verified host</p>
                  </div>
                </div>
                <p className="text-base text-gray-500">Private Saller</p>
                <div className="flex justify-start items-center space-x-2">
                  <img src="/website/map.svg" alt="" className="w-5 h-5" />
                  <p className="text-base text-gray-500">Kaskantyú, Hungary</p>
                </div>
              </div>
            </div>

            <hr className="my-4" />
            {/* Place Bid & Set Max Bid Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <h2 className="text-base font-medium mb-2 col-span-2">
                Contact Seller
              </h2>
              <button className="w-full bg-white-500 text-blue-600 py-3 border border-blue-600 rounded-md font-semibold flex items-center justify-center space-x-2">
                <img src="/website/whats.svg" alt="" className="w-5 h-5" />
                <span className=""> Message</span>
              </button>
              <button className="w-full border py-3 rounded-md font-semibold bg-blue-500 flex items-center justify-center space-x-2">
                <img src="/website/call.svg" alt="" className="w-5 h-5" />
                <span className="text-white"> Call</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-b"></div>
              <p className="px-2 text-gray-500 text-sm">OR</p>
              <div className="flex-grow border-b"></div>
            </div>
            {/* Current Bid Section */}

            {/* Buttons */}
            <div className="gap-2 flex flex-col">
              <button className="w-full border border-gray-500 py-3 rounded-md  font-semibold">
                See more Financial Details
              </button>
            </div>
            <div className="py-5 flex flex-col items-start ">
              <h3 className="text-base font-medium mb-2">PRICE</h3>
              <p className="text-4xl font-bold text-gray-900">13,000 zł</p>
            </div>
          </div>
        </div>
      </div>
      <SimilarVehicles />
    </div>
  );
};

export default page;
