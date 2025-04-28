"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Upload, Plus } from "lucide-react";
import { getUserById,  updateUserCustom } from "../../../services/userService";

const SellerDetailsPage = () => {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [sellerType, setSellerType] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    phoneNumbers: [{ phone: "" }],
    description: "",
    socialMedia: { instagram: "", facebook: "", twitter: "", website: "", linkedin: "" },
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data on page load
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!userId) throw new Error("User not authenticated");
        const userData = await getUserById(userId);
        console.log("Fetched user data:", userData);
        setSellerType(userData.sellerType || null);
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "", // Assuming email is available in userData
          companyName: userData.companyName || "",
          phoneNumbers: userData.phoneNumbers || [{ phone: "" }],
          description: userData.description || "",
          socialMedia: userData.socialMedia || {
            instagram: "",
            facebook: "",
            twitter: "",
            website: "",
            linkedin: "",
          },
          image: null,
        });
        if (userData.image) {
          setPreviewUrl(userData.image);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
      }
    };

    if (userId) loadUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialMedia.")) {
      const socialKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [socialKey]: value },
      }));
    } else if (name.startsWith("phoneNumbers.")) {
      const index = parseInt(name.split(".")[1], 10);
      setFormData((prev) => {
        const updatedPhoneNumbers = [...prev.phoneNumbers];
        updatedPhoneNumbers[index] = { phone: value };
        return { ...prev, phoneNumbers: updatedPhoneNumbers };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addPhoneNumber = () => {
    setFormData((prev) => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, { phone: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        sellerType,
        phoneNumbers: formData.phoneNumbers.filter((p) => p.phone),
      };

      const updatedUser = await updateUserCustom(dataToSend, getToken);
      console.log("User updated:", updatedUser);

      router.push("/dashboard");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!sellerType) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading seller type...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-300 shadow-md">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6 p-5">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 uppercase">
                    Profile Picture
                  </label>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">Profile</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="bg-gray-800 text-white px-3 py-1.5 rounded-md cursor-pointer text-sm">
                        Choose file
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-sm text-gray-500">
                        {formData.image ? formData.image.name : "No file chosen"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 uppercase"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 uppercase"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 uppercase"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 bg-gray-100 p-5">
                {/* Company Name */}
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700 uppercase"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 uppercase"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Seller Type */}
                <div>
                  <label
                    htmlFor="sellerType"
                    className="block text-sm font-medium text-gray-700 uppercase"
                  >
                    Seller Type
                  </label>
                  <select
                    name="sellerType"
                    id="sellerType"
                    value={sellerType}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 cursor-not-allowed"
                  >
                    <option value="company">Company</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {/* Social Media Links */}
                {["instagram", "facebook", "twitter", "website", "linkedin"].map((platform) => (
                  <div key={platform}>
                    <label
                      htmlFor={`socialMedia.${platform}`}
                      className="block text-sm font-medium text-gray-700 uppercase"
                    >
                      {platform} Link
                    </label>
                    <input
                      type="text"
                      name={`socialMedia.${platform}`}
                      id={`socialMedia.${platform}`}
                      value={formData.socialMedia[platform]}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}

                {/* Phone Numbers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 uppercase">
                    Phone Numbers
                  </label>
                  {formData.phoneNumbers.map((phone, index) => (
                    <div key={index} className="mt-1 flex items-center space-x-2">
                      <div className="flex items-center border border-gray-300 rounded-md py-2 px-3">
                        <span className="mr-2">🇺🇸 +1</span>
                        <input
                          type="tel"
                          name={`phoneNumbers.${index}`}
                          value={phone.phone}
                          onChange={handleChange}
                          className="flex-1 border-none focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPhoneNumber}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Phone Number
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Updating..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerDetailsPage;