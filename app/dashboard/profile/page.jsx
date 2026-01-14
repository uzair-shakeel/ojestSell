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
  // console.log("userId", userId);
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
              flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all duration-300
              ${selectedBrands.includes(brand.name)
                ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/40"
                : "bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
              }
            `}
            onClick={() => onBrandChange(brand.name)}
          >
            <img
              src={brand.logo}
              alt={brand.name}
              width={60}
              height={60}
              loading="lazy"
              className="mb-3 object-contain h-12 w-12"
            />
            <span className={`text-xs font-bold ${selectedBrands.includes(brand.name) ? "text-blue-700 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>{brand.name}</span>
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
      toast.success("Nowe hasła nie pasują");
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
        toast.success("Hasło Zmienione Poprawnie");
      } else {
        toast.error(res?.error || "Nie Udało się Zmienić Hasła");
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
        alert(`Nie Udało się załadować Użytkownika: ${err.message || "Unknown error"}`);

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
          "Nieprawidłowy typ pliku. Prześlij obrazy JPG, PNG, WebP lub GIF."
        );
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.success("Plik obrazu jest za duży. Maksymalny rozmiar to 5 MB.");
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
        toast.success("Proszę wybrać co najmniej jedną markę dla sprzedawców firmowych");
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

      toast.success("Profil zaktualizowany pomyślnie!");
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

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800">
      <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400 dark:text-gray-500 font-medium">Ładowanie profilu...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">Twój Profil</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium transition-colors">Zarządzaj swoimi danymi osobowymi i ustawieniami konta.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCpOpen(true)}
          className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold border-2 border-gray-100 dark:border-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all shadow-sm"
        >
          Zmień Hasło
        </button>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Personal Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="xl:col-span-2 space-y-8"
        >
          {/* Section: Profile Photo */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Zdjęcie Profilowe</h2>
            <div className="flex items-center gap-8">
              <div className="relative">
                <Avatar
                  src={formatImageUrl(user?.image || user?.profilePicture)}
                  alt="Profil"
                  size={100}
                  imgClassName="border-4 border-white dark:border-gray-700 shadow-xl rounded-full object-cover"
                />
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 pointer-events-none"></div>
              </div>
              <div>
                <label className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg dark:shadow-blue-900/40 shadow-blue-200 inline-block">
                  Wgraj nowe zdjęcie
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 font-medium">
                  Zalecany format: JPG, PNG lub WebP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Personal Details */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Dane Osobowe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Imię</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 transition-all font-semibold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Nazwisko</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 transition-all font-semibold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">O Sobie</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 transition-all text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 min-h-[120px]"
                placeholder="Napisz kilka słów o sobie..."
              />
            </div>
          </div>

          {/* Section: Location */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Lokalizacja</h2>
            <div className="rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-700">
              <CustomMap
                location={formData.location}
                setLocation={(newLocation) => {
                  setFormData({ ...formData, location: newLocation });
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Right Column: Contact & Business */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="xl:col-span-1 space-y-8"
        >
          {/* Section: Contact Info */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Kontakt i Firma</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-600 font-medium cursor-not-allowed transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Typ Konta</label>
                <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sellerType: 'private' })}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${formData.sellerType === 'private' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    Prywatny
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sellerType: 'company' })}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${formData.sellerType === 'company' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    Firma
                  </button>
                </div>
              </div>

              {formData.sellerType === 'company' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Nazwa Firmy</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 transition-all font-semibold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900"
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Numery Telefonu</label>
                <div className="space-y-3">
                  {formData.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-grow">
                        <PhoneInput
                          country={phone.countryCode?.toLowerCase() || 'pl'}
                          value={phone.phone}
                          onChange={(value, country) => handlePhoneNumberChange(index, value, country)}
                          inputClass="!w-full !h-12 !text-base !bg-gray-50/50 dark:!bg-gray-900/50 !border-2 !border-gray-100 dark:!border-gray-700 !text-gray-900 dark:!text-white !rounded-xl focus:!border-blue-500 dark:focus:!border-blue-400 !transition-all"
                          containerClass="!w-full"
                          buttonClass="!bg-transparent !border-0 !pl-2"
                          dropdownClass="!shadow-xl !rounded-xl !border-gray-100 dark:!border-gray-700 dark:!bg-gray-800"
                        />
                      </div>
                      {formData.phoneNumbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhoneNumber(index)}
                          className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border-2 border-transparent hover:border-red-100 dark:hover:border-red-900/40"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.phoneNumbers.length < 4 && (
                    <button
                      type="button"
                      onClick={addPhoneNumber}
                      className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm"
                    >
                      + Dodaj kolejny numer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Social Media */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Social Media</h2>
            <div className="space-y-4">
              {['instagram', 'facebook', 'website'].map((social) => (
                <div key={social} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 uppercase text-xs font-bold tracking-wider w-24 transition-colors">
                    {social}
                  </div>
                  <input
                    type="url"
                    name={social}
                    value={formData.socialMedia[social]}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 pl-24 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom Section: Brands (if company) & Submit */}
        <div className="col-span-1 xl:col-span-3">
          {formData.sellerType === "company" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-8 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Marki z którymi współpracujesz</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Wybierz marki, w których specjalizuje się Twoja firma.</p>

              <BrandSelector
                brands={carBrands}
                selectedBrands={formData.brands}
                onBrandChange={handleBrandChange}
              />
            </motion.div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold px-12 py-5 rounded-xl hover:bg-blue-700 transition-all shadow-xl dark:shadow-blue-900/40 shadow-blue-200 hover:-translate-y-1 text-lg flex items-center gap-2"
            >
              <span>Zapisz Zmiany</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </form>


      {/* Change Password Modal (outside main form) */}
      {
        isCpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCpOpen(false)} />
            <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Zmień Hasło</h3>
                <button
                  type="button"
                  onClick={() => setIsCpOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Aktualne Hasło</label>
                  <input
                    type="password"
                    value={cpCurrent}
                    onChange={(e) => setCpCurrent(e.target.value)}
                    className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 transition-all font-semibold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Nowe Hasło</label>
                  <input
                    type="password"
                    value={cpNew}
                    onChange={(e) => setCpNew(e.target.value)}
                    minLength={6}
                    className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 transition-all font-semibold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Potwierdź Nowe Hasło</label>
                  <input
                    type="password"
                    value={cpConfirm}
                    onChange={(e) => setCpConfirm(e.target.value)}
                    minLength={6}
                    className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 transition-all font-semibold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCpOpen(false)}
                    className="px-6 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={cpLoading}
                    className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg dark:shadow-blue-900/40 shadow-blue-200 transition-all disabled:opacity-50"
                  >
                    {cpLoading ? "Zmienianie..." : "Aktualizuj Hasło"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default ProfileComponent;
