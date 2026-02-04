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
import { useRouter, usePathname } from "next/navigation";
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

  const pathname = usePathname();

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

  // Helper to check if link is active
  const isActive = (href) => {
    if (!pathname || !href) return false;
    if (pathname === href) return true;

    // Special case for Moje Auta: don't highlight if on Wystaw Auto (/dashboard/cars/add)
    if (href === '/dashboard/cars' && pathname.startsWith('/dashboard/cars/add')) {
      return false;
    }

    // For other links, startsWith is fine but we add a trailing slash check to be safer
    // or we just check if it's a sub-path
    return pathname.startsWith(href + '/');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`fixed inset-y-0 left-0 bg-[#181818] dark:bg-black/60 border-r border-[#2C2C2C] shadow-2xl z-40 w-64 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header / Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#2C2C2C] flex-shrink-0">
          <Link href="/" className="block">
            <img src="/whitelogo.png" alt="Ojest" className="h-8 w-auto object-contain" />
          </Link>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 flex-shrink-0">
          {userData && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-none relative overflow-hidden group hover:bg-white/10 transition-colors">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

              <Avatar
                src={profileImage}
                alt="User"
                size={40}
                imgClassName="ring-2 ring-[#2C2C2C] relative z-10"
              />
              <div className="min-w-0 flex-1 relative z-10">
                <h3 className="text-sm font-bold text-white truncate">
                  {userData?.firstName || "Użytkownik"}
                </h3>
                <p className="text-xs text-gray-400 truncate font-medium">
                  {sellerType === 'company' ? 'Konto Firmowe' : 'Konto Prywatne'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {menuItems.map((item, index) => {
            const active = !item.action && isActive(item.href);
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {item.action ? (
                  <button
                    onClick={async () => {
                      await item.action();
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 rounded-xl hover:bg-white/5 transition-all group mt-6"
                  >
                    <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={`
                                    relative flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all group
                                    ${active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }
                                `}
                  >
                    <span className={`transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-grow">{item.label}</span>

                    {/* Unread Badge for Messages */}
                    {item.label === "Wiadomości" && chatCount > 0 && (
                      <span className={`
                                        flex h-5 w-auto min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px]
                                        ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}
                                    `}>
                        {chatCount}
                      </span>
                    )}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer info (optional) */}
        <div className="p-4 text-center">
          <p className="text-[10px] text-[#4A4A4A] font-bold uppercase tracking-widest">
            Ojest.pl &copy; {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </>
  );
}
