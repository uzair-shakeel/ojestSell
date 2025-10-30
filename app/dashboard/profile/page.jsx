"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CustomMap from "../../../components/dashboard/GoogleMapComponent";
import { motion } from "framer-motion";
import { getUserById, updateUser } from "../../../services/userService";
import Avatar from "../../../components/both/Avatar";
import axios from "axios"; // Added axios import
import { toast } from "react-hot-toast";

const ProfileComponent = () => {
  const { userId, updateUserState, changePassword } = useAuth();
  console.log("userId", userId);
  const [user, setUser] = useState(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  // Get token directly from localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    description: "",
    companyName: "",
    email: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: "",
      website: "",
      linkedin: "",
    },
    sellerType: "private",
    phoneNumbers: [{ phone: "", countryCode: "pl" }],
    location: {
      type: "Point",
      coordinates: [51.5074, -0.1278], // Default to London
    },
    brands: [], // Add brands to initial state
  });

  // List of car brands with logos
  const carBrands = [
    { name: "Acura", logo: "/acura.png" },
    { name: "BMW", logo: "/BMW.png" },
    { name: "Chevrolet", logo: "/chevrolet.png" },
    { name: "Dodge", logo: "/dodge.png" },
    { name: "Ford", logo: "/ford.png" },
    { name: "Honda", logo: "/honda.png" },
    { name: "Hyundai", logo: "/hyundai.png" },
    { name: "Kia", logo: "/kia.png" },
    { name: "Lexus", logo: "/lexus.png" },
    { name: "Mercedes", logo: "/Mercedes.png" },
    { name: "Nissan", logo: "/nissan.png" },
    { name: "Porsche", logo: "/porsche.png" },
    { name: "Tesla", logo: "/tesla.png" },
    { name: "Toyota", logo: "/toyota.png" },
    // Add more brands with their logos
  ];

  // Brands selector component
  const BrandSelector = ({ brands, onBrandChange, selectedBrands }) => {
    return (
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className={`
              flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all duration-300
              ${
                selectedBrands.includes(brand.name)
                  ? "bg-blue-100 border-2 border-blue-500 dark:bg-gray-900"
                  : "bg-gray-100 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
            onClick={() => onBrandChange(brand.name)}
          >
            <img
              src={brand.logo}
              alt={brand.name}
              width={50}
              height={50}
              loading="lazy"
              className="mb-2 object-contain"
            />
            <span className="text-xs font-medium">{brand.name}</span>
          </div>
        ))}
      </div>
    );
  };

  const [imageFile, setImageFile] = useState(null);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [isCpOpen, setIsCpOpen] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!cpCurrent || !cpNew || !cpConfirm) return;
    if (cpNew !== cpConfirm) {
      alert("New passwords do not match");
      return;
    }
    setCpLoading(true);
    try {
      const res = await changePassword(cpCurrent, cpNew);
      if (res?.success) {
        setCpCurrent("");
        setCpNew("");
        setCpConfirm("");
        setIsCpOpen(false);
        toast.success("Password changed successfully");
      } else {
        toast.error(res?.error || "Failed to change password");
      }
    } finally {
      setCpLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        console.log("No userId available, skipping user load");
        return;
      }

      try {
        console.log("Loading user data for ID:", userId);
        const userData = await getUserById(userId, getToken);
        console.log("User data loaded:", userData);
        console.log("Image fields:", {
          image: userData.image,
          profilePicture: userData.profilePicture,
          formattedImage: formatImageUrl(
            userData.image || userData.profilePicture
          ),
          hasImage: !!userData.image,
          hasProfilePicture: !!userData.profilePicture,
        });

        setUser(userData);

        const newFormData = {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          description: userData.description || "",
          companyName: userData.companyName || "",
          email: userData.email || "",
          socialMedia: {
            instagram: userData.socialMedia?.instagram || "",
            facebook: userData.socialMedia?.facebook || "",
            twitter: userData.socialMedia?.twitter || "",
            website: userData.socialMedia?.website || "",
            linkedin: userData.socialMedia?.linkedin || "",
          },
          image: userData.image || userData.profilePicture || "",
          sellerType: userData.sellerType || "private",
          phoneNumbers: userData.phoneNumbers?.length
            ? userData.phoneNumbers.map((phone) => ({
                phone,
                countryCode: phone.startsWith("+48") ? "pl" : "us",
              }))
            : [{ phone: "", countryCode: "pl" }],
          location: {
            type: "Point",
            coordinates: userData.location?.coordinates || [51.5074, -0.1278],
          },
          brands: userData.brands || [],
        };

        console.log("Form data set:", newFormData);
        setFormData(newFormData);
      } catch (err) {
        console.error("Error fetching user:", err);

        // Show error to user
        alert(`Failed to load profile: ${err.message || "Unknown error"}`);

        // Set default state
        setUser({
          firstName: "",
          lastName: "",
          image: "/placeholder-user.jpg",
          sellerType: "private",
        });
        setFormData({
          firstName: "",
          lastName: "",
          description: "",
          companyName: "",
          email: "",
          socialMedia: {
            instagram: "",
            facebook: "",
            twitter: "",
            website: "",
            linkedin: "",
          },
          image: "/placeholder-user.jpg",
          sellerType: "private",
          phoneNumbers: [{ phone: "", countryCode: "pl" }],
          location: {
            type: "Point",
            coordinates: [51.5074, -0.1278],
          },
          brands: [],
        });
      }
    };

    loadUser();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.socialMedia) {
      setFormData({
        ...formData,
        socialMedia: {
          ...formData.socialMedia,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          "Invalid file type. Please upload JPEG, PNG, WebP, or GIF images."
        );
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("Image file is too large. Maximum size is 5MB.");
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Update state
      setImageFile(file);

      // Optional: Update user's preview image immediately
      setUser((prevUser) => ({
        ...prevUser,
        image: previewUrl,
      }));
    }
  };

  const handlePhoneNumberChange = (index, value, country) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index] = { phone: value, countryCode: country.countryCode };
    setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
  };

  const addPhoneNumber = () => {
    if (formData.phoneNumbers.length < 4) {
      setFormData({
        ...formData,
        phoneNumbers: [
          ...formData.phoneNumbers,
          { phone: "", countryCode: "pl" },
        ],
      });
    }
  };

  const removePhoneNumber = (index) => {
    if (formData.phoneNumbers.length > 1) {
      const newPhoneNumbers = formData.phoneNumbers.filter(
        (_, i) => i !== index
      );
      setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
    }
  };
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (/^(https?:\/\/|blob:|cloudinary\.com)/.test(imagePath)) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    const cleanPath = imagePath.replace(/^[/\\]/, "");
    const preferredBase = (API_BASE || "").replace(/\/$/, "");
    if (preferredBase) return `${preferredBase}/${cleanPath}`;
    return `/${cleanPath}`; // same-origin public root as last resort
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate seller type and brands
      if (
        formData.sellerType === "company" &&
        (!formData.brands || formData.brands.length === 0)
      ) {
        alert("Please select at least one brand for company sellers");
        return;
      }

      // Create a deep copy of the form data
      const data = {
        ...formData,
        // Extract just the phone numbers from the phoneNumbers array of objects
        phoneNumbers: formData.phoneNumbers
          .map((item) => item.phone)
          .filter((phone) => phone.trim() !== ""),
      };

      // Add the image file if it exists
      if (imageFile) {
        data.image = imageFile;
      }

      console.log("Submitting data:", JSON.stringify(data, null, 2));

      // Call the updateUser function from userServices
      const result = await updateUser(data, getToken);
      console.log("Updated user result:", JSON.stringify(result, null, 2));

      // Update the user state with the new data
      if (result.user) {
        setUser(result.user);
        // Update AuthContext to sync changes across the app
        updateUserState(result.user);
        console.log(
          "Profile updated successfully, new user data:",
          result.user
        );
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);

      // More detailed error handling
      let errorMessage = "Failed to update profile";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);

        // Try to extract a meaningful error message
        if (Array.isArray(error.response.data.details)) {
          // If details is an array of error messages
          errorMessage = error.response.data.details.join(", ");
        } else if (error.response.data.error) {
          // If there's a specific error message
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          // Fallback to generic message
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        // Fallback to the error message
        errorMessage = error.message;
      }

      // Show the error message to the user
      alert(errorMessage);
    }
  };

  // Add method to handle brand selection
  const handleBrandChange = (brand) => {
    setFormData((prevData) => {
      const currentBrands = prevData.brands || [];
      const updatedBrands = currentBrands.includes(brand)
        ? currentBrands.filter((b) => b !== brand)
        : [...currentBrands, brand];

      return {
        ...prevData,
        brands: updatedBrands,
      };
    });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <>
    
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Profile</h1>
        <button
          type="button"
          onClick={() => setIsCpOpen(true)}
          className="bg-gray-800 text-white rounded-md px-4 py-2 hover:bg-gray-700"
        >
          Change Password
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {/* Left part */}
        <motion.div
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.4 }}
          className="col-span-2 xl:col-span-1"
        >
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
              Profile Picture
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-center space-x-4">
              <Avatar
                src={formatImageUrl(user?.image || user?.profilePicture)}
                alt="Profile"
                size={80}
                imgClassName="border border-gray-300"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block text-base text-gray-500 file:mr-4 file:py-2 file:px-7 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 file:duration-300 border border-gray-300 p-1 w-auto rounded-md"
              />
            </div>
          </div>

          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                required
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
              rows="4"
            />
          </div>
        </motion.div>

        {/* Right part */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4 }}
          className="col-span-2 xl:col-span-1 bg-gray-100 p-5 sm:p-5"
        >
          {/* Company Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                required
                disabled
              />
            </div>
          </div>

          {/* Seller Type */}
          <div className="mb-6">
            <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
              Seller Type
            </label>
            <select
              name="sellerType"
              value={formData.sellerType}
              onChange={handleInputChange}
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
            >
              <option value="private">Private</option>
              <option value="company">Company</option>
            </select>
          </div>

          {/* Social Media Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                Instagram Link
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.socialMedia.instagram}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                Facebook Link
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.socialMedia.facebook}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                Twitter Link
              </label>
              <input
                type="url"
                name="twitter"
                value={formData.socialMedia.twitter}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                Website Link
              </label>
              <input
                type="url"
                name="website"
                value={formData.socialMedia.website}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                LinkedIn Link
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.socialMedia.linkedin}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="mb-6">
            <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
              Phone Numbers
            </label>
            {formData.phoneNumbers.map((phone, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <PhoneInput
                  country={phone.countryCode.toLowerCase()}
                  value={phone.phone}
                  onChange={(value, country) =>
                    handlePhoneNumberChange(index, value, country)
                  }
                  inputClass="w-full py-5 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                  dropdownClass="z-50"
                />
                {formData.phoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoneNumber(index)}
                    className="p-2 bg-gray-800 text-white rounded-md px-5"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {formData.phoneNumbers.length < 4 && (
              <button
                type="button"
                onClick={addPhoneNumber}
                className="mt-2 p-2 bg-blue-500 text-white rounded-md px-5 hover:bg-blue-600"
              >
                Add Phone Number
              </button>
            )}
          </div>
        </motion.div>

        {/* Brands Selection for Company Sellers */}
        {formData.sellerType === "company" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="col-span-2 bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Brands You Deal With
            </h3>

            <BrandSelector
              brands={carBrands}
              selectedBrands={formData.brands}
              onBrandChange={(brand) => {
                setFormData((prevData) => {
                  const currentBrands = prevData.brands || [];
                  const updatedBrands = currentBrands.includes(brand)
                    ? currentBrands.filter((b) => b !== brand)
                    : [...currentBrands, brand];

                  return {
                    ...prevData,
                    brands: updatedBrands,
                  };
                });
              }}
            />

            {formData.sellerType === "company" &&
              (!formData.brands || formData.brands.length === 0) && (
                <p className="text-red-500 text-sm mt-4">
                  Please select at least one brand you deal with
                </p>
              )}
          </motion.div>
        )}

        <motion.div className="mb-6 col-span-2">
          <CustomMap
            location={formData.location}
            setLocation={(newLocation) => {
              setFormData({ ...formData, location: newLocation });
            }}
          />
        </motion.div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md px-5 py-2 hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </motion.div>

    {/* Change Password Modal (outside main form) */}
    {isCpOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsCpOpen(false)} />
        <div className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
            <button
              type="button"
              onClick={() => setIsCpOpen(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">Current Password</label>
              <input
                type="password"
                value={cpCurrent}
                onChange={(e) => setCpCurrent(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                required
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">New Password</label>
              <input
                type="password"
                value={cpNew}
                onChange={(e) => setCpNew(e.target.value)}
                minLength={6}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                required
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={cpConfirm}
                onChange={(e) => setCpConfirm(e.target.value)}
                minLength={6}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCpOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={cpLoading}
                className="px-5 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
              >
                {cpLoading ? "Changing..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default ProfileComponent;
