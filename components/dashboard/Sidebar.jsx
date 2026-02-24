"use client";

import { FaCar } from "react-icons/fa";
import { BiAddToQueue } from "react-icons/bi";
import { BsChatLeftDots, BsPersonGear } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FiMenu, FiX, FiShoppingBag, FiClipboard, FiLogOut, FiHome, FiSearch, FiHeart, FiPhone, FiChevronDown } from "react-icons/fi";
import { MdPhotoFilter } from "react-icons/md";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "../both/Avatar";
import ThemeToggle from "../ThemeToggle";

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

  const websiteLinks = [
    { label: "Home", href: "/", icon: <FiHome className="w-6 h-6" /> },
    { label: "Discovery", href: "/discovery", icon: <FiSearch className="w-6 h-6" /> },
    { label: "Wishlist", href: "/wishlist", icon: <FiHeart className="w-6 h-6" /> },
    { label: "Kontakt", href: "/website/contact", icon: <FiPhone className="w-6 h-6" /> },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-white dark:bg-dark-panel z-[100] md:hidden overflow-y-auto custom-scrollbar"
          >
            {/* Top Bar for Mobile Menu */}
            <div className="h-16 px-4 border-b border-gray-100 dark:border-dark-divider flex justify-between items-center sticky top-0 bg-white/80 dark:bg-dark-panel/80 backdrop-blur-md z-10">
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-raised rounded-xl transition-all"
              >
                <FiX size={24} />
              </button>

              <div className="flex items-center gap-2">
                <ThemeToggle size={20} />
                <Link href="/dashboard/messages" onClick={toggleSidebar} className="p-2 text-gray-700 dark:text-gray-300">
                  <BsChatLeftDots size={20} />
                </Link>
                <Avatar src={profileImage} alt="User" size={32} />
              </div>
            </div>

            <div className="p-5 space-y-8 pb-10">
              {/* Profile Overview (Mobile) */}
              {userData && (
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-dark-card p-5 rounded-[2rem] border border-gray-100 dark:border-dark-divider">
                  <Avatar src={profileImage} alt="User" size={50} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                      {userData?.firstName || "Użytkownik"}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                      {sellerType === 'company' ? 'Konto Firmowe' : 'Konto Prywatne'}
                    </p>
                  </div>
                </div>
              )}

              {/* TILE GRID (Primary Actions) */}
              <div className="grid grid-cols-2 gap-3">
                <MobileTile
                  item={menuItems.find(i => i.label === "Panel")}
                  onClick={toggleSidebar}
                  active={isActive("/dashboard/home")}
                />
                <MobileTile
                  item={menuItems.find(i => i.label === "Wystaw Auto")}
                  onClick={toggleSidebar}
                  active={isActive("/dashboard/cars/add")}
                />
                <MobileTile
                  item={menuItems.find(i => i.label === "Moje Auta")}
                  onClick={toggleSidebar}
                  active={isActive("/dashboard/cars")}
                />
                <MobileTile
                  item={menuItems.find(i => i.label === "Wiadomości")}
                  onClick={toggleSidebar}
                  active={isActive("/dashboard/messages")}
                  badge={chatCount}
                />
              </div>

              {/* DASHBOARD LINKS LIST */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-4 px-2">Nawigacja Panelu</p>
                {menuItems.map((item) => (
                  // Skip the items already in tiles and logout
                  !["Panel", "Wystaw Auto", "Moje Auta", "Wiadomości", "Wyloguj"].includes(item.label) && (
                    <MobileListLink
                      key={item.label}
                      item={item}
                      onClick={toggleSidebar}
                      active={isActive(item.href)}
                    />
                  )
                ))}
              </div>

              {/* WEBSITE LINKS LIST */}
              <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-dark-divider">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-4 px-2">Strona Główna</p>
                {websiteLinks.map((link) => (
                  <MobileListLink
                    key={link.label}
                    item={link}
                    onClick={toggleSidebar}
                    active={isActive(link.href)}
                  />
                ))}
              </div>

              {/* Logout button */}
              <div className="pt-6">
                <button
                  onClick={async () => {
                    const logoutItem = menuItems.find(i => i.label === "Wyloguj");
                    if (logoutItem?.action) await logoutItem.action();
                    toggleSidebar();
                  }}
                  className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-sm font-black text-red-500 uppercase tracking-widest"
                >
                  <div className="flex items-center gap-4">
                    <FiLogOut className="w-5 h-5" />
                    <span>Wyloguj Się</span>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="pt-10 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Ojest.pl &copy; {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR RAIL */}
      <motion.div
        className={`fixed inset-y-0 left-0 bg-dark-panel dark:bg-dark-panel border-r border-dark-divider shadow-2xl z-40 w-64 hidden md:flex flex-col transition-all duration-300 ease-in-out translate-x-0`}
      >
        {/* Header / Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-dark-divider flex-shrink-0">
          <Link href="/" className="block">
            <img src="/whitelogo.png" alt="Ojest" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="p-4 flex-shrink-0">
          {userData && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-none relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <Avatar src={profileImage} alt="User" size={40} />
              <div className="min-w-0 flex-1 relative z-10">
                <h3 className="text-sm font-bold text-white truncate">{userData?.firstName || "Użytkownik"}</h3>
                <p className="text-xs text-gray-400 truncate font-medium">{sellerType === 'company' ? 'Konto Firmowe' : 'Konto Prywatne'}</p>
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
                    className={`relative flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all group
                      ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-gray-400 hover:bg-white/5 hover:text-white"}
                    `}
                  >
                    <span className={`transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}>{item.icon}</span>
                    <span className="flex-grow">{item.label}</span>
                    {item.label === "Wiadomości" && chatCount > 0 && (
                      <span className={`flex h-5 w-auto min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}`}>
                        {chatCount}
                      </span>
                    )}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 text-center">
          <p className="text-[10px] text-[#4A4A4A] font-bold uppercase tracking-widest">
            Ojest.pl &copy; {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </>
  );
}

// --- Helper Components for Mobile Menu ---

function MobileTile({ item, onClick, active, badge }) {
  if (!item) return null;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex flex-col items-center justify-center h-28 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all text-center px-4 gap-3 relative
        ${active
          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
          : "bg-gray-50 dark:bg-dark-card text-gray-900 dark:text-white border border-gray-100 dark:border-dark-divider"
        }
      `}
    >
      <span className={`${active ? "" : "text-blue-500"} transition-transform group-hover:scale-110`}>
        {item.icon}
      </span>
      <span>{item.label}</span>

      {badge > 0 && (
        <span className={`absolute top-4 right-4 h-5 w-auto min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px] font-black ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

function MobileListLink({ item, onClick, active }) {
  if (!item) return null;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all
        ${active ? "bg-blue-600 text-white" : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white border border-transparent hover:border-blue-500/20"}
      `}
    >
      <div className="flex items-center gap-4">
        <span className={`${active ? "text-white" : "text-blue-500"}`}>{item.icon}</span>
        <span>{item.label}</span>
      </div>
      <FiChevronDown className="w-4 h-4 -rotate-90 opacity-30" />
    </Link>
  );
}

const ArrowRight = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
