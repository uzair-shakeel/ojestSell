"use client";

import { FaCar } from "react-icons/fa";
import { BiAddToQueue } from "react-icons/bi";
import { BsChatLeftDots, BsPersonGear } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FiMenu, FiX, FiShoppingBag, FiClipboard, FiLogOut } from "react-icons/fi";
import { MdPhotoFilter } from "react-icons/md";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import Avatar from "../both/Avatar";

// Prefer same-origin proxy (/api) unless a full external base is explicitly provided
const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_BASE = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [chatCount, setChatCount] = useState(0);
  const { userId, getToken, user, logout } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [sellerType, setSellerType] = useState(null);

  // Consistent image URL formatter (aligns with profile page logic)
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Pass through absolute URLs and blob URLs
    if (/^(https?:\/\/|blob:)/.test(imagePath)) return imagePath;
    // Allow already-rooted paths (e.g., /images/foo.png)
    if (imagePath.startsWith("/")) return imagePath;
    // Fallback to API base URL if provided
    const base = API_BASE || "";
    if (base) {
      const clean = imagePath.replace(/^[/\\]/, "");
      return `${base}/${clean}`;
    }
    return null;
  };

  // Use user data from AuthContext and set profile image
  useEffect(() => {
    console.log("Sidebar user data:", user);
    if (user) {
      setUserData(user);
      setSellerType(user.sellerType);
      console.log("Setting sellerType to:", user.sellerType);
      const raw = user.profilePicture || user.image;
      // Pass raw value to Avatar; it will handle URL normalization and fallback
      setProfileImage(raw || null);
    }
  }, [user]);

  // Fetch chat count when component mounts
  useEffect(() => {
    if (!userId) return;

    const fetchChats = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.error("No token available for chat fetch");
          return;
        }

        console.log("Fetching chats with token");
        // If external base provided, hit it directly, otherwise use Next.js rewrite via /api
        const chatUrl = API_BASE
          ? `${API_BASE}/api/chat/my-chats`
          : `/api/chat/my-chats`;
        const response = await fetch(chatUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch chats, status:", response.status);
          return;
        }

        const data = await response.json();
        const chatsArray = Array.isArray(data) ? data : data.chats || [];
        // Set the chat count to the total unread messages across chats
        const unreadTotal = chatsArray.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setChatCount(unreadTotal);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [userId, getToken]);

  // Debug logging
  console.log("Sidebar sellerType:", sellerType);
  console.log("Sidebar userData:", userData);

  const menuItems = [
    {
      label: "Panel",
      href: "/dashboard/home",
      icon: <RiDashboardHorizontalLine className="w-6 h-6" />,
    },
    {
      label: "Wystaw Auto",
      href: "/dashboard/cars/add",
      icon: <BiAddToQueue className="w-6 h-6" />,
    },
    {
      label: "Moje Auta",
      href: "/dashboard/cars",
      icon: <FaCar className="w-6 h-6" />,
    },
    ...(sellerType === "private"
      ? [
          {
            label: "Zapytania Kupujących",
            href: "/dashboard/buyer-requests",
            icon: <FiShoppingBag className="w-6 h-6" />,
          },
        ]
      : []),
    ...(sellerType === "company"
      ? [
          {
            label: "Możliwości Dla Sprzedawców",
            href: "/dashboard/seller-opportunities",
            icon: <FiClipboard className="w-6 h-6" />,
          },
        ]
      : []),
    {
      label: "Ulepszacz Zdjęć",
      href: "/dashboard/photo-enhancer",
      icon: <MdPhotoFilter className="w-6 h-6" />,
    },
    {
      label: "Wiadomości",
      href: "/dashboard/messages",
      icon: <BsChatLeftDots className="w-6 h-6" />,
    },
    {
      label: "Profil",
      href: "/dashboard/profile",
      icon: <BsPersonGear className="w-6 h-6" />,
    },
    // Admin-only items
    ...(userData?.role === "admin"
      ? [
          {
            label: "Admin • Cars",
            href: "/dashboard/admin/cars",
            icon: <FaCar className="w-6 h-6" />,
          },
        ]
      : []),
    {
      label: "Wyloguj",
      icon: <FiLogOut className="w-6 h-6" />,
      action: async () => {
        try {
          await logout();
        } finally {
          router.push("/");
        }
      },
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-y-0 right-0 md:left-0 md:right-auto h-screen bg-[#181818] text-white shadow-lg z-40 w-64
          ${isOpen ? "block" : "hidden"} md:block w-64 md:transition-none`}
      >
        {/* Mobile Close Button */}
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={toggleSidebar}
          className="md:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FiX className="w-6 h-6" />
        </button>
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
            <Avatar
              src={profileImage}
              alt="User Avatar"
              size={48}
              imgClassName="border-2 border-blue-500 shadow-lg"
            />
            {isOpen && userData && (
              <motion.div
                className="ml-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-sm font-semibold text-white">
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <p className="text-xs text-gray-400">{userData?.email}</p>
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
              {item.action ? (
                <button
                  className="w-full text-left flex flex-row items-center p-3 rounded-md hover:bg-blue-500 transition-all m-2 justify-normal"
                  onClick={async () => {
                    await item.action();
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  {item.icon}
                  {isOpen && (
                    <span className="ml-3 text-white text-sm">{item.label}</span>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="relative flex flex-row items-center p-3 rounded-md hover:bg-blue-500 transition-all m-2 justify-normal"
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
              )}
            </motion.div>
          ))}
        </nav>
      </motion.div>
    </>
  );
}
