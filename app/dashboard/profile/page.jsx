"use client";
import { useState, useEffect } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CustomMap from "../../../components/dashboard/GoogleMapComponent";
import { motion } from "framer-motion";
import { getUserById, updateUser } from "../../../services/userService";
import Image from "next/image";

const ProfileComponent = () => {
  const { getToken, userId } = useAuth();
  const [user, setUser] = useState(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(userId);
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
          image: userData.image || "",
          sellerType: userData.sellerType || "private",
          phoneNumbers: userData.phoneNumbers?.length
            ? userData.phoneNumbers.map((phone) => ({
                phone,
                countryCode: phone.startsWith("+48") ? "pl" : "us",
              }))
            : [{ phone: "", countryCode: "pl" }],
          location: {
            type: "Point",
            coordinates: userData.location?.coordinates || [51.5074, -0.1278], // default to London if no location
          },
        };

        // Log the userData and the new formData
        console.log("User Data:", userData);
        console.log("Form Data:", newFormData);

        setFormData(newFormData);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    if (userId) loadUser();
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
      setImageFile(file);
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
    if (!imagePath) return "/images/default-seller.png";
    return `${BASE_URL}${imagePath.replace("\\", "/")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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

      console.log("Submitting data:", data);

      // Call the updateUser function from userServices
      const updatedUser = await updateUser(data, getToken);
      console.log("Updated user:", updatedUser);

      setUser(updatedUser); // Set the updated user data to the state
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
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
              <Image
                src={formatImageUrl(user?.image)}
                alt="Profile"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-center border border-gray-300"
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
        <motion.div className="mb-6 col-span-2">
          <CustomMap
            location={formData.location}
            setLocation={(newLocation) => {
              setFormData({ ...formData, location: newLocation });
            }}
          />
        </motion.div>

        {/* Submit and Delete Buttons */}
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
  );
};

export default ProfileComponent;
