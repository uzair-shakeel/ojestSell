"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "../../lib/auth/AuthContext";
import GoogleSignIn from "./GoogleSignIn";
import Image from "next/image";

export default function AuthTabs() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpRefs, setOtpRefs] = useState([]);
  const [tempUserId, setTempUserId] = useState(null);
  const [step, setStep] = useState("input");
  const [activeTab, setActiveTab] = useState("email");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const { signUp, verifyOTP, resendOTP, loading } = useAuth();

  // Create refs for OTP inputs
  useEffect(() => {
    setOtpRefs(
      Array(6)
        .fill(0)
        .map(() => React.createRef())
    );
  }, []);

  const handleOtpChange = (index, value) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto-focus next input with slight delay for better UX
    if (numericValue && index < 5) {
      setTimeout(() => {
        otpRefs[index + 1]?.current?.focus();
      }, 10);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current box is empty, go to previous
        setTimeout(() => {
          otpRefs[index - 1]?.current?.focus();
        }, 10);
      } else if (otp[index]) {
        // If current box has value, clear it first
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs[index - 1]?.current?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = pastedData
        .split("")
        .concat(Array(6 - pastedData.length).fill(""));
      setOtp(newOtp);
      // Focus the next empty input or the last one
      const nextEmptyIndex = Math.min(pastedData.length, 5);
      setTimeout(() => {
        otpRefs[nextEmptyIndex]?.current?.focus();
      }, 10);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStep("input");
    setFormData({
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });
    setOtp(["", "", "", "", "", ""]);
    setTempUserId(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password match for signup
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
      };

      // Add email or phone based on active tab
      if (activeTab === "email") {
        payload.email = formData.email;
      } else {
        payload.phoneNumber = formData.phoneNumber;
      }

      const result = await signUp(payload);

      if (result.success) {
        if (result.requiresOTP) {
          // Show OTP in alert for testing
          setTempUserId(result.userId);
          setStep("otp");
          toast.success("Please verify your OTP");
        } else {
          toast.success("Sign up successful!");
          router.push("/onboarding/seller-details");
        }
      } else {
        toast.error(result.error || "Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Sign up failed");
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await verifyOTP(tempUserId, otp.join(""));

      if (result.success) {
        toast.success("Verification successful!");
        router.push("/onboarding/seller-details");
      } else {
        toast.error(result.error || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("OTP verification failed");
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await resendOTP(tempUserId);

      if (result.success) {
        toast.success("OTP resent successfully");
      } else {
        toast.error(result.error || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP");
    }
  };

  const handleGoogleSuccess = (data) => {
    router.push("/onboarding/seller-details");
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Verify Your Account
              </h1>
              <p className="text-lg text-gray-600">
                Enter the OTP sent to your{" "}
                {activeTab === "email" ? "email" : "phone"}
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  OTP Code
                </label>
                <div className="flex justify-center space-x-3 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      value={otp[index] || ""}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      ref={otpRefs[index]}
                      className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${
                        otp[index]
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder=""
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 disabled:opacity-50 font-medium"
              >
                Resend OTP
              </button>
              <div>
                <button
                  onClick={() => setStep("input")}
                  className="text-gray-600 hover:text-gray-700"
                >
                  ← Back to form
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Visual Section */}
        <div className="hidden lg:flex m-2 rounded-3xl lg:w-1/2 relative overflow-hidden">
          {/* Abstract Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600">
            <Image
              src="/Hero2-QKTSHICM.webp"
              alt="OjestSell Logo"
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full w-full">
            <div className="text-left w-full">
              {/* Top Quote Label */}
              <div className="mb-12 absolute top-5 left-5">
                {/* Logo */}
                <div className="mb-8">
                  <div className="flex items-center">
                    <img
                      src="/logo-white.png"
                      alt="OjestSell Logo"
                      className="h-10 mr-3"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-5 left-5 right-5 w-full max-w-lg">
                {/* Main Quote */}
                <h2 className="text-6xl font-bold mb-8 leading-tight">
                  Enter Your
                  <br />
                  Verification Code
                </h2>

                {/* Sub Text */}
                <p className="text-xl font-light opacity-95 leading-relaxed">
                  Please enter the one-time code you received to continue.
                  Didn’t get it? Check again or request a new code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Join OjestSell
            </h1>
            <p className="text-lg text-gray-600">
              Create your account and start your journey with premium vehicles
            </p>
          </div>

          {/* Tab Navigation */}
          {/* <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleTabChange("email")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "email"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => handleTabChange("phone")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "phone"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Phone Number
            </button>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  placeholder="First name"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={activeTab === "email" ? "email" : "phoneNumber"}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {activeTab === "email" ? "Email" : "Phone Number"}
              </label>
              <input
                type={activeTab === "email" ? "email" : "tel"}
                id={activeTab === "email" ? "email" : "phoneNumber"}
                name={activeTab === "email" ? "email" : "phoneNumber"}
                value={
                  activeTab === "email" ? formData.email : formData.phoneNumber
                }
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                placeholder={
                  activeTab === "email"
                    ? "Enter your email"
                    : "Enter your phone number"
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                placeholder="Enter your password"
                minLength="6"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                placeholder="Confirm your password"
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleSignIn onSuccess={handleGoogleSuccess} />
            </div>
          </div> */}

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual Section */}
      <div className="hidden lg:flex m-2 rounded-3xl lg:w-1/2 relative overflow-hidden">
        {/* Abstract Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600">
          <Image
            src="/Hero2-QKTSHICM.webp"
            alt="OjestSell Logo"
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full w-full">
          <div className="text-left w-full">
            {/* Top Quote Label */}
            <div className="mb-12 absolute top-5 left-5">
              {/* Logo */}
              <div className="mb-8">
                <div className="flex items-center">
                  <img
                    src="/logo-white.png"
                    alt="OjestSell Logo"
                    className="h-10 mr-3"
                  />
                </div>
              </div>
            </div>
            <div className="absolute bottom-5 left-5 right-5 w-full max-w-lg">
              {/* Main Quote */}
              <h2 className="text-6xl font-bold mb-8 leading-tight">
                Ready to Find Your Perfect Car?
              </h2>

              {/* Sub Text */}
              <p className="text-xl font-light opacity-95 leading-relaxed">
                Sign up now and unlock exclusive access to premium vehicles.
                Fast, simple, and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
