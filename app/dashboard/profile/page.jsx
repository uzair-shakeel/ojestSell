"use client";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // Import the styles
import CustomMap from "../../../components/dashboard/GoogleMapComponent";
import { motion, AnimatePresence } from "framer-motion";


const ProfileComponent = () => {
  // State for user profile data
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    description: "",
    companyName: "",
    email: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      tiktok: "",
    },
    image: "",
  });

  // State for phone numbers
  const [phoneNumbers, setPhoneNumbers] = useState([
    { phone: "", countryCode: "pl" }, // Default phone number
  ]);

  // State for location
  const [location, setLocation] = useState({
    searchText: "",
    coordinates: { lat: null, lng: null },
  });

  // State for rental agreement files
  const [rentalAgreementFiles, setRentalAgreementFiles] = useState([]);

  // Handle input changes for user profile
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in user.socialMedia) {
      setUser({
        ...user,
        socialMedia: {
          ...user.socialMedia,
          [name]: value,
        },
      });
    } else {
      setUser({
        ...user,
        [name]: value,
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle phone number changes
  const handlePhoneNumberChange = (index, value, country) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = { phone: value, countryCode: country.countryCode };
    setPhoneNumbers(newPhoneNumbers);
  };

  // Add a new phone number
  const addPhoneNumber = () => {
    if (phoneNumbers.length < 4) {
      setPhoneNumbers([...phoneNumbers, { phone: "", countryCode: "pl" }]);
    }
  };

  // Remove a phone number
  const removePhoneNumber = (index) => {
    if (phoneNumbers.length > 1) {
      const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(newPhoneNumbers);
    }
  };

  // Handle location search
  const handleLocationSearch = (e) => {
    setLocation({ ...location, searchText: e.target.value });
  };

  // Handle rental agreement file upload
  const handleRentalAgreementUpload = (e) => {
    const files = Array.from(e.target.files);
    setRentalAgreementFiles([...rentalAgreementFiles, ...files]);
  };

  // Remove a rental agreement file
  const removeRentalAgreementFile = (index) => {
    const newFiles = rentalAgreementFiles.filter((_, i) => i !== index);
    setRentalAgreementFiles(newFiles);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User Profile:", user);
    console.log("Phone Numbers:", phoneNumbers);
    console.log("Location:", location);
    console.log("Rental Agreement Files:", rentalAgreementFiles);
    alert("Profile updated successfully!");
  };
    // Animation variants
    const inputVariants = {
      hidden: { opacity: 0, y: -10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };
  
    const fileInputVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 0.1 } },
    };
  
    const buttonVariants = {
      hover: { scale: 1.05, transition: { duration: 0.2 } },
      tap: { scale: 0.95 },
    };
  
    const phoneNumberVariants = {
      hidden: { opacity: 0, x: -10 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
    };

    const agreementFileVariants = {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
      exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
    };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <form onSubmit={handleSubmit} className=" grid grid-cols-2 gap-4 ">
        {/* left part */}
        <motion.div initial={{ x: -50, }} animate={{ x: 0, }} transition={{ duration: 0.4 }} className="col-span-2 xl:col-span-1">
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
              Profile Picture
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-center space-x-4">
             <motion.img
              src={user.image || "https://via.placeholder.com/300"}
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
                value={user.firstName}
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
                value={user.lastName}
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
              value={user.description}
              onChange={handleInputChange}
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
              rows="4"
            />
          </div>
          {/* Rental Agreement */}
          <div className="mb-6">
            <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
              Rental Agreement
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleRentalAgreementUpload}
              className="block text-base text-gray-500 file:mr-4 file:py-2 file:px-7 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 file:duration-300 border border-gray-300 p-1 w-auto rounded-md"
              multiple
            />
            <div className="mt-4">
              {rentalAgreementFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border border-gray-300 rounded-lg mb-2"
                >
                  <div className="flex items-center space-x-2">
                    {file.type === "application/pdf" ? (
                      <img src="/pdf-icon.png" alt="PDF" className="w-6 h-6" />
                    ) : file.type === "application/msword" ||
                      file.type ===
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                      <img
                        src="/word-icon.png"
                        alt="Word"
                        className="w-6 h-6"
                      />
                    ) : (
                      <img
                        src="/file-icon.png"
                        alt="File"
                        className="w-6 h-6"
                      />
                    )}
                    <span>{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRentalAgreementFile(index)}
                    className="p-1 bg-gray-900 text-white rounded-lg "
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ duration:0.4 }} className="col-span-2 xl:col-span-1 bg-gray-100 p-5 sm:p-5">
          {/* Company Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={user.companyName}
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
                value={user.email}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
                required
              />
            </div>
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
                value={user.socialMedia.instagram}
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
                value={user.socialMedia.facebook}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
                TikTok Link
              </label>
              <input
                type="url"
                name="tiktok"
                value={user.socialMedia.tiktok}
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
            {phoneNumbers.map((phone, index) => (
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
                {phoneNumbers.length > 1 && (
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
            {phoneNumbers.length < 4 && (
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
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration:0.4 }} className="mb-6 col-span-2">
          <label className="block text-sm uppercase font-medium text-gray-800 mb-1">
            Location
          </label>
          <CustomMap location={location} setLocation={setLocation} />
        </motion.div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-32 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save Profile
        </button>
      </form>
    </motion.div>
  );
};

export default ProfileComponent;
