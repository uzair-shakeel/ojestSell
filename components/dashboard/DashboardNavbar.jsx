"use client";
import { useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { FiMenu, FiX } from "react-icons/fi";

export default function DashboardNavbar({ isOpen, toggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full p-4 bg-white shadow-md flex justify-between items-center z-30 sticky top-0">
      {/* Logo */}
      <div>
        <img src="/whitelogo.png" alt="Ojest Logo" className="h-10" />
      </div>

      <div className="flex items-center space-x-5 sm:mx-4">
        {/* Add Listing Button */}
        <button className="hidden md:block bg-white border border-gray-300 px-4 py-2 rounded-full shadow hover:bg-gray-100">
          Add Listing
        </button>

        {/* Clerk UserButton for profile dropdown */}
        <div className="block">
          <UserButton />
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
