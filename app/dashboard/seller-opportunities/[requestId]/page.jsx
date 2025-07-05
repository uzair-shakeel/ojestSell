"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { getBuyerRequestById } from "../../../../services/buyerRequestService";
import { createOffer } from "../../../../services/sellerOfferService";
import { getCarsByUserId } from "../../../../services/carService";
import { toast } from "react-hot-toast";
import {
  FiArrowLeft,
  FiUpload,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiInfo,
  FiCheck,
} from "react-icons/fi";
import { TbCar } from "react-icons/tb";

const MakeOfferPage = ({ params }) => {
  const { requestId } = params;
  const router = useRouter();
  const { userId, getToken, isLoaded } = useAuth();

  const [request, setRequest] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [offerType, setOfferType] = useState("existing"); // 'existing' or 'custom'
  const [selectedCarId, setSelectedCarId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && userId) {
      fetchRequest();
      fetchUserCars();
    }
  }, [isLoaded, userId, requestId]);

  const fetchRequest = async () => {
    try {
      const data = await getBuyerRequestById(requestId);
      setRequest(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching request:", error);
      toast.error("Failed to load buyer request");
      router.push("/dashboard/seller-opportunities");
    }
  };

  const fetchUserCars = async () => {
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
    }
  };

  const handleCarSelect = (carId) => {
    const selectedCar = userCars.find((car) => car._id === carId);
    setSelectedCarId(carId);

    if (selectedCar) {
      setTitle(
        `${selectedCar.make} ${selectedCar.model} ${selectedCar.year || ""}`
      );
      setDescription(selectedCar.description);
      setPrice(selectedCar.financialInfo.priceNetto.toString());
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImageFiles(files);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(previews);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviewUrls];

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviewUrls(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (offerType === "existing" && !selectedCarId) {
      toast.error("Please select a car");
      return;
    }

    if (offerType === "custom" && imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setSubmitting(true);

    try {
      const offerData = {
        title,
        description,
        price: parseFloat(price),
        isCustomOffer: offerType === "custom",
      };

      if (offerType === "existing") {
        offerData.carId = selectedCarId;
      }

      // Create a proper getToken function
      const getTokenFn = async () => {
        try {
          const token = await getToken();
          console.log("Token available for offer submission:", !!token);
          return token;
        } catch (error) {
          console.error("Error getting token for offer submission:", error);
          return null;
        }
      };

      await createOffer(
        requestId,
        offerData,
        getTokenFn,
        offerType === "custom" ? imageFiles : undefined
      );

      toast.success("Offer submitted successfully!");
      router.push("/dashboard/seller-opportunities");
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast.error(error.response?.data?.message || "Failed to submit offer");
    } finally {
      setSubmitting(false);
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

  if (!isLoaded || loading) {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-medium border border-green-200">
                Active Request
              </span>
              <span className="text-sm text-gray-500">
                Posted {formatDate(request.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-4 text-gray-800">
              {request.title}
            </h1>
            <p className="text-gray-700 mb-6">{request.description}</p>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-800">Request Details</h3>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
                <div className="flex items-center text-blue-800 mb-2">
                  <FiInfo className="mr-2" />
                  <span className="font-medium">Buyer's Requirements</span>
                </div>
                <div className="space-y-3">
                  {request.make && request.model && (
                    <div className="flex items-start">
                      <TbCar className="mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-700">Car</p>
                        <p className="text-gray-800">
                          {request.make} {request.model}
                        </p>
                      </div>
                    </div>
                  )}

                  {(request.yearFrom || request.yearTo) && (
                    <div className="flex items-start">
                      <FiCalendar className="mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-700">
                          Year Range
                        </p>
                        <p className="text-gray-800">
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
                    <FiDollarSign className="mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm text-gray-700">
                        Budget
                      </p>
                      <p className="text-gray-800 font-medium">
                        {request.budgetMin
                          ? `$${request.budgetMin.toLocaleString()} - $${request.budgetMax.toLocaleString()}`
                          : `Up to $${request.budgetMax.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  {request.preferredCondition !== "Any" && (
                    <div className="flex items-start">
                      <FiClock className="mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-700">
                          Preferred Condition
                        </p>
                        <p className="text-gray-800">
                          {request.preferredCondition}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {request.preferredFeatures &&
                request.preferredFeatures.length > 0 && (
                  <div>
                    <p className="font-medium text-sm text-gray-700 mb-2">
                      Preferred Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {request.preferredFeatures.map((feature, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                <FiCalendar className="text-red-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Request expires on</p>
                  <p className="font-medium">
                    {formatDate(request.expiryDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Offer Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Make an Offer
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Offer Type Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Offer Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      offerType === "existing"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setOfferType("existing")}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                          offerType === "existing"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {offerType === "existing" && (
                          <FiCheck className="text-white text-xs" />
                        )}
                      </div>
                      <h3 className="font-medium">Use an existing car</h3>
                    </div>
                    <p className="text-sm text-gray-500 ml-8">
                      Select from your inventory of listed vehicles
                    </p>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      offerType === "custom"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setOfferType("custom")}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                          offerType === "custom"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {offerType === "custom" && (
                          <FiCheck className="text-white text-xs" />
                        )}
                      </div>
                      <h3 className="font-medium">Create custom offer</h3>
                    </div>
                    <p className="text-sm text-gray-500 ml-8">
                      Create a new offer with custom details and images
                    </p>
                  </div>
                </div>
              </div>

              {/* Car Selection (for existing car offer) */}
              {offerType === "existing" && (
                <div className="mb-6">
                  <label
                    htmlFor="carId"
                    className="block text-sm font-medium text-gray-700 mb-3"
                  >
                    Select Your Car <span className="text-red-500">*</span>
                  </label>

                  {userCars.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
                      <TbCar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-600 mb-4">
                        You don't have any cars listed yet
                      </p>
                      <Link
                        href="/dashboard/cars/add"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
                      >
                        Add a car first
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userCars.map((car) => (
                        <div
                          key={car._id}
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                            selectedCarId === car._id
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200"
                          }`}
                          onClick={() => handleCarSelect(car._id)}
                        >
                          <div className="h-32 overflow-hidden">
                            <img
                              src={car.images[0] || "/placeholder.jpg"}
                              alt={car.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-gray-800">
                                {car.make} {car.model}
                              </h3>
                              <span className="text-green-600 font-bold">
                                ${car.financialInfo.priceNetto.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {car.year || ""} • {car.condition}
                            </p>

                            {selectedCarId === car._id && (
                              <div className="mt-2 bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-md inline-flex items-center">
                                <FiCheck className="mr-1" /> Selected
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Offer Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter a title for your offer"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Describe your offer and why it matches what the buyer is looking for"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <FiDollarSign className="text-gray-500" />
                  </div>
                  <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Enter your offer price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {request.budgetMax &&
                  price &&
                  parseFloat(price) > request.budgetMax && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-100 text-yellow-800 px-4 py-3 rounded-md flex items-start">
                      <FiInfo className="mr-2 mt-0.5" />
                      <p className="text-sm">
                        Your price is higher than the buyer's maximum budget ($
                        {request.budgetMax.toLocaleString()})
                      </p>
                    </div>
                  )}
              </div>

              {/* Image Upload (for custom offer) */}
              {offerType === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images <span className="text-red-500">*</span>
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="images"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
                      <span className="text-gray-600 font-medium mb-1">
                        Click to upload images
                      </span>
                      <span className="text-sm text-gray-500">
                        JPG, PNG or WEBP (max 5 images)
                      </span>
                    </label>
                  </div>

                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end mt-8 border-t pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 mr-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting || (offerType === "existing" && !selectedCarId)
                  }
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm"
                >
                  {submitting ? "Submitting..." : "Submit Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeOfferPage;
