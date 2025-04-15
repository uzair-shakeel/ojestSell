"use client";
import { useState, useEffect } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CustomMap from "../../../components/dashboard/GoogleMapComponent";
import { motion, AnimatePresence } from "framer-motion";
import { fetchUser , updateUser , deleteUserAccount, getUserById } from "../../../services/userService";

const ProfileComponent = () => {
  const { getToken, userId, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();

  const [user, setUser] = useState(null);
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
    image: "",
    sellerType: "private",
    phoneNumbers: [{ phone: "", countryCode: "pl" }],
    location: { searchText: "", coordinates: { lat: null, lng: null } },
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const loadUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await getUserById(userId, getToken);
        setUser(userData);
        setFormData({
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
            searchText: "",
            coordinates: {
              lat: userData.location?.[1] || null,
              lng: userData.location?.[0] || null,
            },
          },
        });
      } catch (err) {
        setError("Failed to load profile. Please try again.");
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadUser();
  }, [userId, isSignedIn, getToken, router]);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
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
        phoneNumbers: [...formData.phoneNumbers, { phone: "", countryCode: "pl" }],
      });
    }
  };

  const removePhoneNumber = (index) => {
    if (formData.phoneNumbers.length > 1) {
      const newPhoneNumbers = formData.phoneNumbers.filter((_, i) => i !== index);
      setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
    }
  };

  const handleLocationSearch = (e) => {
    setFormData({
      ...formData,
      location: { ...formData.location, searchText: e.target.value },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        description: formData.description,
        companyName: formData.companyName,
        sellerType: formData.sellerType,
        socialMedia: formData.socialMedia,
        phoneNumbers: formData.phoneNumbers.map((p) => p.phone),
        location: [
          formData.location.coordinates.lng,
          formData.location.coordinates.lat,
        ],
        image: imageFile,
      };
      const updatedUser = await updateUser(updateData, getToken);
      setUser(updatedUser);
      setImageFile(null);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteUserAccount(getToken);
      await signOut(); // Sign out the user after deletion
      alert("Account deleted successfully.");
      router.push("/"); // Redirect to homepage
    } catch (err) {
      setError("Failed to delete account. Please try again.");
      console.error("Error deleting account:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
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
              <motion.img
                src={formData.image || "https://via.placeholder.com/300"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border border-gray-300"
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

        {/* Location */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 col-span-2"
        >
          <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
            Location
          </label>
          <CustomMap
            location={formData.location}
            setLocation={(newLocation) =>
              setFormData({ ...formData, location: newLocation })
            }
          />
        </motion.div>

        {/* Submit and Delete Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="w-32 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-32 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProfileComponent;