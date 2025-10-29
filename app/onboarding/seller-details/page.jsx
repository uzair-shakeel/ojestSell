"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth/AuthContext";
import { getUserById, updateUserCustom } from "../../../services/userService";

const SellerDetailsPage = () => {
  const router = useRouter();
  const { userId, getToken, updateUserState } = useAuth();

  const [sellerType, setSellerType] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    phoneNumbers: [{ phone: "" }],
    description: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: "",
      website: "",
      linkedin: "",
    },
    image: null,
    brands: [],
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Fetch user data on page load
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!userId) throw new Error("User not authenticated");
        const userData = await getUserById(userId);
        setSellerType(userData.sellerType || null);
        setFormData((prev) => ({
          ...prev,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          companyName: userData.companyName || "",
          phoneNumbers: userData.phoneNumbers?.length
            ? userData.phoneNumbers.map((p) => ({ phone: p }))
            : [{ phone: "" }],
          description: userData.description || "",
          socialMedia: userData.socialMedia || prev.socialMedia,
          image: null,
        }));
        if (userData.image || userData.profilePicture) {
          setPreviewUrl(userData.image || userData.profilePicture);
        }
      } catch (err) {
        setError("Failed to load user data");
      }
    };

    if (userId) loadUser();
  }, [userId]);

  // Steps definition including seller type first
  const steps = useMemo(() => {
    const base = [
      {
        key: "sellerType",
        title: "Are you a private seller or a company?",
        required: true,
      },
      { key: "image", title: "Upload a profile picture", optional: true },
      { key: "firstName", title: "What's your first name?", required: true },
      { key: "lastName", title: "And your last name?", required: true },
      sellerType === "company"
        ? { key: "companyName", title: "Company name", required: true }
        : null,
      sellerType === "company"
        ? { key: "brands", title: "Select brands you deal in", optional: true }
        : null,
      { key: "phone", title: "Your phone number", optional: true },
      { key: "description", title: "Write a short bio", optional: true },
      { key: "social", title: "Add your social links", optional: true },
    ].filter(Boolean);
    return base;
  }, [sellerType]);

  const current = steps[stepIndex];
  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100);

  const setValue = (path, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      if (path.startsWith("socialMedia.")) {
        const k = path.split(".")[1];
        next.socialMedia = { ...prev.socialMedia, [k]: value };
      } else if (path.startsWith("phoneNumbers.")) {
        const idx = parseInt(path.split(".")[1], 10);
        const list = [...prev.phoneNumbers];
        list[idx] = { phone: value };
        next.phoneNumbers = list;
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const canProceed = () => {
    if (!current) return false;
    if (current.key === "sellerType" && !sellerType) return false;
    if (current.key === "firstName" && !formData.firstName.trim()) return false;
    if (current.key === "lastName" && !formData.lastName.trim()) return false;
    if (current.key === "companyName" && !formData.companyName.trim())
      return false;
    return true;
  };

  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));
  const skip = () => next();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        sellerType,
        phoneNumbers: formData.phoneNumbers
          .map((p) => (typeof p === "string" ? p : p.phone))
          .filter(Boolean),
      };

      const updatedUser = await updateUserCustom(dataToSend, getToken);
      if (updatedUser) {
        // Update the AuthContext with the new user data
        updateUserState(updatedUser.user);
        router.push("/dashboard/home");
      }
    } catch (err) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  // Always render; sellerType will be selected on step 1

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage: "url('/Hero2-QKTSHICM.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-2xl ">
        <div className="bg-white/80 backdrop-blur-sm  rounded-2xl shadow ring-1 ring-black/5 p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-800 mb-2 transition-colors duration-300">
              <span>
                Step {stepIndex + 1} of {steps.length}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-semibold text-gray-900  mb-4 text-center transition-colors duration-300">
            {current?.title}
          </h2>
          {current?.key === "sellerType" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSellerType("private")}
                className={`p-4 rounded-xl border text-left transition ${
                  sellerType === "private"
                    ? "border-blue-600 ring-1 ring-blue-200 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                }`}
              >
                <div className={`font-medium transition-colors duration-300 ${
                  sellerType === "private" ? "text-gray-900" : "text-gray-900 group-hover:dark:text-white"
                }`}>Private seller</div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  sellerType === "private" ? "text-gray-600" : "text-gray-600 group-hover:dark:text-gray-500"
                }`}>
                  Ideal for individuals listing personal vehicles
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSellerType("company")}
                className={`p-4 rounded-xl border text-left transition ${
                  sellerType === "company"
                    ? "border-blue-600 ring-1 ring-blue-200 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                }`}
              >
                <div className={`font-medium transition-colors duration-300 ${
                  sellerType === "company" ? "text-gray-900" : "text-gray-900 group-hover:dark:text-white"
                }`}>Company</div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  sellerType === "company" ? "text-gray-600" : "text-gray-600 group-hover:dark:text-gray-500"
                }`}>
                  Great for dealerships and automotive businesses
                </div>
              </button>
            </div>
          )}

          {/* Field by step */}
          {current?.key === "image" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 ring-1 ring-black/5 overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No photo
                    </div>
                  )}
                </div>
                <label className="px-3 py-2 rounded-md bg-gray-900 text-white text-sm cursor-pointer">
                  Choose file
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setValue("image", null);
                    }}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500  transition-colors duration-300">
                You can skip this and add a photo later.
              </p>
            </div>
          )}

          {current?.key === "firstName" && (
            <div>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setValue("firstName", e.target.value)}
                placeholder="Your first name"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {current?.key === "lastName" && (
            <div>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setValue("lastName", e.target.value)}
                placeholder="Your last name"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {current?.key === "companyName" && (
            <div>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setValue("companyName", e.target.value)}
                placeholder="Company name"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {current?.key === "brands" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Pick the brands you specialize in
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Audi",
                  "BMW",
                  "Mercedes",
                  "Volkswagen",
                  "Toyota",
                  "Honda",
                  "Ford",
                  "Renault",
                  "Peugeot",
                  "Kia",
                  "Hyundai",
                  "Nissan",
                  "Volvo",
                  "Skoda",
                  "Mazda",
                  "Opel",
                ].map((brand) => {
                  const active = formData.brands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => {
                          const list = new Set(prev.brands || []);
                          if (list.has(brand)) list.delete(brand);
                          else list.add(brand);
                          return { ...prev, brands: Array.from(list) };
                        });
                      }}
                      className={`px-3 py-2 rounded-md text-sm border transition ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300 transition-colors duration-300">
                Optional. You can edit brands later in your profile.
              </p>
            </div>
          )}

          {current?.key === "phone" && (
            <div>
              <input
                type="tel"
                value={formData.phoneNumbers?.[0]?.phone || ""}
                onChange={(e) => setValue("phoneNumbers.0", e.target.value)}
                placeholder="Phone number"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2 transition-colors duration-300">
                Optional. You can add more later in your profile.
              </p>
            </div>
          )}

          {current?.key === "description" && (
            <div>
              <textarea
                value={formData.description}
                onChange={(e) => setValue("description", e.target.value)}
                placeholder="Tell buyers a bit about you"
                rows={4}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {current?.key === "social" && (
            <div className="grid gap-3">
              {["instagram", "facebook", "twitter", "website", "linkedin"].map(
                (platform) => (
                  <input
                    key={platform}
                    type="url"
                    value={formData.socialMedia?.[platform] || ""}
                    onChange={(e) =>
                      setValue(`socialMedia.${platform}`, e.target.value)
                    }
                    placeholder={`${platform} link`}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                )
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={stepIndex === 0}
              className={`px-4 py-2 rounded-md border text-gray-700 transition-colors duration-300 ${
                stepIndex === 0
                  ? "opacity-40 cursor-not-allowed text-gray-900 dark:!text-black"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Back
            </button>

            <div className="flex items-center gap-2">
              {current?.optional && current.key !== "sellerType" && (
                <button
                  type="button"
                  onClick={skip}
                  className="px-4 py-2 rounded-md text-gray-700 dark:text-black hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  Skip
                </button>
              )}

              {stepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={!canProceed()}
                  className={`px-6 py-2 rounded-md ${
                    canProceed()
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loading ? "Saving..." : "Finish"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetailsPage;
