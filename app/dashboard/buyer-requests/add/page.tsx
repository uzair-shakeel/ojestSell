"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import {
  BuyerRequestInput,
  createBuyerRequest,
} from "../../../../services/buyerRequestService";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

const AddBuyerRequestPage = () => {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BuyerRequestInput>({
    defaultValues: {
      preferredCondition: "Any",
      preferredFeatures: [],
    },
  });

  const onSubmit = async (data: BuyerRequestInput) => {
    if (!userId) {
      toast.error("You must be logged in to create a request");
      return;
    }

    setIsSubmitting(true);

    try {
      const getTokenFn = async () => {
        try {
          const token = await getToken();
          console.log("Token available for create:", !!token);
          return token;
        } catch (error) {
          console.error("Error getting token for create:", error);
          return null;
        }
      };

      await createBuyerRequest(data, getTokenFn);
      toast.success("Request created successfully!");
      router.push("/dashboard/buyer-requests");
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error(error.response?.data?.message || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const carFeatures = [
    "Air Conditioning",
    "Leather Seats",
    "Navigation System",
    "Backup Camera",
    "Bluetooth",
    "Sunroof",
    "Heated Seats",
    "Parking Sensors",
    "Cruise Control",
    "Keyless Entry",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create Car Request</h1>
        <p className="text-gray-600 mb-6">
          Tell sellers what you're looking for and receive offers directly from
          them.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Request Title *
            </label>
            <input
              id="title"
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., Looking for a family SUV in good condition"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Detailed Description *
            </label>
            <textarea
              id="description"
              rows={5}
              {...register("description", {
                required: "Description is required",
              })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what you're looking for in detail. Include any specific requirements or preferences."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Car Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Make */}
            <div>
              <label
                htmlFor="make"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Make (Optional)
              </label>
              <input
                id="make"
                type="text"
                {...register("make")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Toyota, Honda, BMW"
              />
            </div>

            {/* Model */}
            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Model (Optional)
              </label>
              <input
                id="model"
                type="text"
                {...register("model")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Camry, Civic, X5"
              />
            </div>

            {/* Year Range */}
            <div>
              <label
                htmlFor="yearFrom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Year From (Optional)
              </label>
              <input
                id="yearFrom"
                type="number"
                {...register("yearFrom", {
                  min: { value: 1900, message: "Year must be 1900 or later" },
                  max: {
                    value: new Date().getFullYear(),
                    message: "Year cannot be in the future",
                  },
                })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum year"
              />
              {errors.yearFrom && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.yearFrom.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="yearTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Year To (Optional)
              </label>
              <input
                id="yearTo"
                type="number"
                {...register("yearTo", {
                  min: { value: 1900, message: "Year must be 1900 or later" },
                  max: {
                    value: new Date().getFullYear(),
                    message: "Year cannot be in the future",
                  },
                })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maximum year"
              />
              {errors.yearTo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.yearTo.message}
                </p>
              )}
            </div>

            {/* Budget Range */}
            <div>
              <label
                htmlFor="budgetMin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Budget Min (Optional)
              </label>
              <input
                id="budgetMin"
                type="number"
                {...register("budgetMin", {
                  min: { value: 0, message: "Budget must be positive" },
                })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum budget"
              />
              {errors.budgetMin && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.budgetMin.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="budgetMax"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Budget Max *
              </label>
              <input
                id="budgetMax"
                type="number"
                {...register("budgetMax", {
                  required: "Maximum budget is required",
                  min: { value: 0, message: "Budget must be positive" },
                })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maximum budget"
              />
              {errors.budgetMax && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.budgetMax.message}
                </p>
              )}
            </div>

            {/* Preferred Condition */}
            <div>
              <label
                htmlFor="preferredCondition"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preferred Condition (Optional)
              </label>
              <select
                id="preferredCondition"
                {...register("preferredCondition")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Any">Any</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            {/* Preferred Features */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Features (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {carFeatures.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`feature-${feature}`}
                      value={feature}
                      {...register("preferredFeatures")}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`feature-${feature}`}
                      className="text-sm text-gray-700"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Create Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBuyerRequestPage;
