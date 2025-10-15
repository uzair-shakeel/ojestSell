"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import GoogleSignIn from "./GoogleSignIn";
import Image from "next/image";

export default function SignInTabs() {
  const [activeTab, setActiveTab] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({
      email: "",
      phoneNumber: "",
      password: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        password: formData.password,
      };

      // Add email or phone based on active tab
      if (activeTab === "email") {
        payload.email = formData.email;
      } else {
        payload.phoneNumber = formData.phoneNumber;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signin`,
        {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Sign in successful!");
        router.push("/dashboard/home");
      } else {
        console.log('error aagaya guys', data);
        toast.error(data.message || "Sign in failed");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoogleSuccess = (data) => {
    router.push("/dashboard/home");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Section (Almost Half Screen) */}
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
            {" "}
            {/* removed max-w-md */}
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
                Find Your
                <br />
                Dream Car
              </h2>

              {/* Sub Text */}
              <p className="text-xl font-light opacity-95 leading-relaxed">
                Join thousands of satisfied customers who found their perfect
                vehicle on OjestSell. Your trusted marketplace for premium cars.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to access your account and continue your car journey
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
                onChange={handleChange}
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
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-medium"
            >
              {isLoading ? "Signing in..." : "Sign In"}
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
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
