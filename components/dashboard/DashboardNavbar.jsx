"use client";
import { useState, useEffect, useRef } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useAuth } from "../../lib/auth/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";
import Avatar from "../both/Avatar";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const buildApiUrl = (path) => {
  const base = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";
  return `${base}${path}`;
};

export default function DashboardNavbar({ isOpen, toggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, getToken, userId, updateUserState } = useAuth();
  const router = useRouter();

  // No dropdown anymore

  // Ensure we have the latest user image (handles stale localStorage)
  useEffect(() => {
    const fetchLatestUser = async () => {
      if (!userId || !user || user.image || user.profilePicture) return;
      try {
        const token = await getToken();
        const res = await fetch(buildApiUrl(`/api/users/${userId}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const fresh = await res.json();
          updateUserState(fresh);
        }
      } catch (e) {
        console.warn("Navbar: failed to refresh user image", e);
      }
    };
    fetchLatestUser();
  }, [user, userId, getToken, updateUserState]);

  // Logout moved to Sidebar

  return (
    <header className="w-full p-4 bg-white dark:bg-gray-800800 shadow-md flex justify-end items-center z-30 sticky top-0 transition-colors duration-300">
      {/* Logo */}
    

      <div className="flex items-center space-x-3 sm:mx-4">
        {/* Theme Toggle */}
        <ThemeToggle size={24} />

        {/* Add Listing Button */}
        <button
          onClick={() => router.push("/dashboard/cars/add")}
          className="hidden md:block bg-white dark:bg-gray-800800800 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white transition-colors duration-300"
        >
          Add Listing
        </button>

        {/* Static user chip (no dropdown) */}
        <div className="flex items-center space-x-2 p-2 rounded-full">
          {user ? (
            <Avatar
              src={user.image || user.profilePicture}
              alt={user.firstName || user.email || "User"}
              size={24}
            />
          ) : (
            <IoPersonCircleOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          )}
          <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.firstName || user?.email || "User"}
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="text-gray-700 dark:text-gray-300 block md:hidden hover:text-gray-900 dark:hover:text-white transition-colors"
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
