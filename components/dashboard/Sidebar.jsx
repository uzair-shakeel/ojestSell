"use client";

import { FaCar } from "react-icons/fa";
import { BiAddToQueue } from "react-icons/bi";
import { BsChatLeftDots, BsPersonGear } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FiMenu, FiX } from "react-icons/fi";
import { MdPhotoFilter } from "react-icons/md";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [chatCount, setChatCount] = useState(0);
  const { user, isLoaded } = useUser();
  const [profileImage, setProfileImage] = useState(
    "/images/default-seller.png"
  );

  // Fetch chat count when component mounts
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/chat/my-chats",
          {
            headers: {
              "x-clerk-user-id": user.id,
            },
          }
        );
        if (!response.ok) {
          console.error("Failed to fetch chats");
          return;
        }
        const data = await response.json();
        // Set the chat count to the number of chats
        setChatCount(data.chats?.length || 0);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();

    // Set profile image from user data
    if (user.imageUrl) {
      setProfileImage(user.imageUrl);
    }
  }, [user]);

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard/home",
      icon: <RiDashboardHorizontalLine className="w-6 h-6" />,
    },
    {
      label: "Create Car",
      href: "/dashboard/cars/add",
      icon: <BiAddToQueue className="w-6 h-6" />,
    },
    {
      label: "My Cars",
      href: "/dashboard/cars",
      icon: <FaCar className="w-6 h-6" />,
    },
    {
      label: "Photo Enhancer",
      href: "/dashboard/photo-enhancer",
      icon: <MdPhotoFilter className="w-6 h-6" />,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: <BsChatLeftDots className="w-6 h-6" />,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: <BsPersonGear className="w-6 h-6" />,
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-y-0 left-0 h-screen bg-[#181818] text-white shadow-lg z-40 w-64
          ${isOpen ? "block" : "hidden"} md:block w-64 md:transition-none`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/">
                  <img src="/blacklogo.png" alt="Logo" className="w-28" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          <div className="flex items-center justify-center py-4 px-3 border-y border-gray-700">
            <motion.img
              src={profileImage}
              alt="User Avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-lg"
            />
            {isOpen && isLoaded && user && (
              <motion.div
                className="ml-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-sm font-semibold text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-xs text-gray-400">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </motion.div>
            )}
          </div>
        </AnimatePresence>

        <nav className="mt-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className="flex flex-row items-center p-3 rounded-md hover:bg-blue-500 transition-all m-2 justify-normal"
                onClick={() => {
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
              >
                {item.icon}
                {isOpen && (
                  <span className="ml-3 text-white text-sm">{item.label}</span>
                )}
                {item.label === "Messages" && chatCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-5 w-5 h-5 flex items-center justify-center bg-red-500 text-xs text-white rounded-full"
                  >
                    {chatCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.div>
    </>
  );
}
