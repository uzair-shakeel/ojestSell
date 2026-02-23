"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeToggle from "../ThemeToggle";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import { useNotifications } from "../../lib/notifications/NotificationsContext";
import Avatar from "../both/Avatar";
import UserAccountDropdown from "../both/UserAccountDropdown";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiMenu, FiX } from "react-icons/fi";
import { BsChatLeftDots } from "react-icons/bs";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const router = useRouter();
  const { t } = useLanguage();
  const { isSignedIn, logout, user } = useAuth();
  const notifRef = useRef(null);

  // Get notifications (hook must be called unconditionally)
  let notificationsContext = null;
  let notificationsList = [];
  let unreadCount = 0;
  let notificationsError = false;
  let markRead = null;
  let markAll = null;

  try {
    notificationsContext = useNotifications();
    notificationsList = notificationsContext?.notifications || [];
    unreadCount = notificationsContext?.unreadCount || 0;
    markRead = notificationsContext?.markRead;
    markAll = notificationsContext?.markAll;
  } catch (e) {
    // NotificationsProvider not available (user not signed in or error)
    notificationsError = true;
    if (isSignedIn) {
      console.warn('[Navbar] Notifications not available for signed-in user:', e);
    }
  }

  const getNotifTarget = (n) => {
    try {
      const type = n?.type;
      const meta = n?.meta || {};
      if (type === "message") {
        if (meta.chatId) return `/dashboard/messages?chatId=${encodeURIComponent(meta.chatId)}`;
        return "/dashboard/messages";
      }
      if (type === "car" || type === "status") {
        return "/dashboard/cars";
      }
      return "/dashboard/notifications";
    } catch {
      return "/dashboard/notifications";
    }
  };

  const handleNotifClick = async (n) => {
    try {
      if (!n.read && markRead) await markRead(n.id);
    } catch { }
    setOpenNotif(false);
    router.push(getNotifTarget(n));
  };

  const handleSignIn = () => {
    setIsMenuOpen(false);
    router.push("/sign-in");
  };

  const handleSignOut = () => {
    setIsMenuOpen(false);
    logout();
    router.push("/");
  };

  const navLinks = [
    { name: "Discover", href: "/discovery" },
    { name: "Marketplace", href: "/website" },
    { name: "Wishlist", href: "/wishlist" },
    { name: "Journal", href: "/website/blog" },
    { name: "Support", href: "/website/faq" },
    { name: "Contact", href: "/website/contact" },
  ];

  // Close notification popup when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };
    if (openNotif) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [openNotif]);

  // Smooth dropdown: animate max-height from 0 to content height
  const dropdownRef = useRef(null);
  const [dropdownMax, setDropdownMax] = useState(0);
  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;
    if (isMenuOpen) {
      // Measure full content height
      const full = el.scrollHeight || 0;
      setDropdownMax(full);
    } else {
      setDropdownMax(0);
    }
  }, [isMenuOpen, isSignedIn, t, user]);

  return (
    <header className="w-full h-16 px-4 bg-white dark:bg-dark-panel shadow-md flex justify-between items-center text-black dark:text-dark-text-primary transition-colors duration-300 relative">
      {/* Mobile Navigation Toggle - FAR LEFT on mobile */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-raised rounded-xl transition-all"
        aria-label="Toggle Navigation"
      >
        {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Logo - Hidden on mobile */}
      <div className="hidden lg:block">
        <Link href="/">
          <img src="/whitelogo.png" alt="Ojest Logo" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="flex-1 lg:hidden" /> {/* Spacer for mobile */}

      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Theme Toggle */}
        <ThemeToggle size={22} />

        {/* Status Icons: Messages & Notifications */}
        {isSignedIn && (
          <div className="flex items-center gap-1 md:gap-2">
            {/* Messages Icon */}
            <Link
              href="/dashboard/messages"
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              title="Messages"
            >
              <BsChatLeftDots className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </Link>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setOpenNotif((v) => !v)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              >
                <FiBell className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {openNotif && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 dark:text-white">Powiadomienia</div>
                    {markAll && (
                      <button onClick={markAll} className="text-xs text-blue-600 hover:underline">
                        Oznacz wszystkie jako przeczytane
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {notificationsList.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Brak powiadomień</div>
                    ) : (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notificationsList.slice(0, 8).map((n) => (
                          <li key={n.id} className="px-0">
                            <Link
                              href={getNotifTarget(n)}
                              className={`px-3 py-2 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${n.read ? "opacity-60" : ""}`}
                              onClick={async () => {
                                try { if (!n.read && markRead) await markRead(n.id); } catch { }
                                setOpenNotif(false);
                              }}
                            >
                              <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? "bg-gray-300 dark:bg-gray-600" : "bg-blue-500"}`} />
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-200 dark:text-white truncate">{n.title}</div>
                                {n.body && <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{n.body}</div>}
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 text-right">
                    <Link href="/dashboard/notifications" onClick={() => setOpenNotif(false)} className="text-sm text-blue-600 hover:underline">
                      Zobacz wszystkie powiadomienia
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Account Section */}
        {isSignedIn ? (
          <UserAccountDropdown />
        ) : (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-16 left-0 right-0 bg-white dark:bg-dark-panel border-b border-gray-200 dark:border-dark-divider shadow-2xl z-40 lg:hidden overflow-hidden"
          >
            <div className="p-5 space-y-6">
              {/* Primary Mobile Links */}
              <div className="grid grid-cols-2 gap-3">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="group flex flex-col items-center justify-center h-20 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-divider hover:bg-blue-600 hover:text-white transition-all text-center px-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {!isSignedIn ? (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleSignIn}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  Join the Community
                </motion.button>
              ) : (
                <div className="pt-2 border-t border-gray-100 dark:border-dark-divider">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 text-center">Quick Access</p>
                  <div className="flex justify-center gap-4">
                    {/* Theme toggle mobile focus if needed or other quick actions */}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
