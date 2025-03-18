"use client";

import { FaCar } from "react-icons/fa";
import { BiAddToQueue } from "react-icons/bi";
import { BsChatLeftDots, BsPersonGear } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FiMenu, FiX } from "react-icons/fi"; // Import close icon
import Link from "next/link";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const unseenMessagesCount = 3; // Example, replace with real data

  const menuItems = [
    { label: "Dashboard", href: "/dashboard/home", icon: <RiDashboardHorizontalLine className="w-6 h-6" /> },
    { label: "Create Car", href: "/dashboard/cars/add", icon: <BiAddToQueue className="w-6 h-6" /> },
    { label: "My Cars", href: "/dashboard/cars", icon: <FaCar className="w-6 h-6" /> },
    { label: "Messages", href: "/dashboard/messages", icon: <BsChatLeftDots className="w-6 h-6" /> },
    { label: "Profile", href: "/dashboard/profile", icon: <BsPersonGear className="w-6 h-6" /> },
  ];

  return (
    <div
      className={`z-50 fixed inset-y-0 left-0 h-screen bg-[#131313] text-white shadow-lg transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo & Toggle Button */}
      <div className="flex items-center justify-between px-4 py-5">
        {isOpen && (
          <Link href="/">
            <img src="/blacklogo.png" alt="Logo" className="w-28 transition-all duration-300" />
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-sm text-white transition-all duration-300 "
        >
          {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />} {/* Dynamic Icon */}
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex items-center justify-center py-4 px-3 border-y border-gray-700">
        <img
          // src="/profile.jpg"
          alt="User Avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-lg"
        />
        {isOpen && (
          <div className="ml-3">
            <h2 className="text-sm font-semibold text-white">John Doe</h2>
            <p className="text-xs text-gray-400">johndoe@example.com</p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center p-3 rounded-lg hover:bg-blue-500 hover:shadow-lg transition-all duration-300 mx-3"
          >
            {item.icon}
            {isOpen && <span className="ml-3 text-white text-sm font-medium">{item.label}</span>}
            {item.label === "Messages" && unseenMessagesCount > 0 && (
              <span className="ml-auto w-5 h-5 flex items-center justify-center bg-red-500 text-xs text-white rounded-full">
                {unseenMessagesCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
