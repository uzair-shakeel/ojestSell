"use client";
import { useState, useEffect, useRef } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useAuth } from "../../lib/auth/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function DashboardNavbar({ isOpen, toggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="w-full p-4 bg-white shadow-md flex justify-between items-center z-30 sticky top-0">
      {/* Logo */}
      <div>
        <img src="/whitelogo.png" alt="Ojest Logo" className="h-10" />
      </div>

      <div className="flex items-center space-x-5 sm:mx-4">
        {/* Add Listing Button */}
        <button
          onClick={() => router.push("/dashboard/cars/add")}
          className="hidden md:block bg-white border border-gray-300 px-4 py-2 rounded-full shadow hover:bg-gray-100"
        >
          Add Listing
        </button>

        {/* Custom User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <IoPersonCircleOutline className="w-6 h-6 text-gray-700" />
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user?.firstName || user?.email || "User"}
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  router.push("/dashboard/profile");
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiUser className="w-4 h-4 mr-2" />
                Profile
              </button>

              <button
                onClick={() => {
                  router.push("/dashboard/settings");
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiSettings className="w-4 h-4 mr-2" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className=" text-gray-700 block md:hidden"
        >
          {isOpen ? (
            <FiX className="w-6 h-6" />
          ) : (
            <FiMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {/* {isMenuOpen && (
        <div className="absolute right-4 top-16 bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-48 flex flex-col space-y-2 md:hidden">
          <button className="w-full text-left hover:bg-gray-100 p-1 duration-300">Profile</button>
          <button className="w-full text-left hover:bg-gray-100 p-1 duration-300">Add Car</button>
          <SignOutButton>
            <button className="w-full text-left hover:bg-gray-100 p-1 duration-300">Logout</button>
          </SignOutButton>
        </div>
      )} */}
    </header>
  );
}
