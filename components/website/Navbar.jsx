"use client";
import React, { useState, useEffect, useRef } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { BsChatLeftDots } from "react-icons/bs";
import { BsBell } from "react-icons/bs";
import { FiBell } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeToggle from "../ThemeToggle";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import { useNotifications } from "../../lib/notifications/NotificationsContext";
import Avatar from "../both/Avatar";

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
    { name: t("navbar.links.home"), href: "/website" },
    { name: t("navbar.links.blog"), href: "/website/blog" },
    { name: t("navbar.links.faq"), href: "/website/faq" },
    { name: t("navbar.links.contact"), href: "/website/contact" },
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
    <header className="w-full h-16 px-4 bg-white dark:bg-black/90 shadow-md flex justify-between items-center text-black dark:text-white transition-colors duration-300">
      {/* Logo */}
      <div className="">
        <Link href="/website">
          <img src="/whitelogo.png" alt="Ojest Logo" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="flex items-center space-x-3 sm:mx-4">
        {/* Theme Toggle */}
        <ThemeToggle size={24} />

        {/* Notification Bell - Only for signed-in users */}
        {isSignedIn && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-300"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-black/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Powiadomienia</div>
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
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</div>
                              {n.body && <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{n.body}</div>}
                              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!n.read && markRead && (
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead(n.id); }}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  Przeczytaj
                                </button>
                              )}
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
        )}

        {/* <div className="">
          <LanguageSwitcher />
        </div> */}
        {/* CTA Button: Become a seller (signed out) or Dashboard (signed in) */}
        {isSignedIn ? (
          <>
            <button
              onClick={() => router.push("/dashboard/home")}
              className="hidden md:block bg-white dark:bg-black/80800800800800800800800800800 border border-gray-300 dark:border-white px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white transition-colors duration-300"
            >
              Panel
            </button>

          </>
        ) : (
          <Link
            href="/sign-up"
            className="hidden md:block bg-white dark:bg-black/80800800800800800800 border border-gray-300 dark:border-white px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white transition-colors duration-300"
          >
            {t("navbar.becomeSeller")}
          </Link>
        )}

        {/* Profile/Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
        >
          {user ? (
            <Avatar
              src={user.image || user.profilePicture}
              alt={user.firstName || user.email || "User"}
              size={28}
            />
          ) : (
            <IoPersonCircleOutline size={30} />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        ref={dropdownRef}
        style={{ maxHeight: dropdownMax }}
        className={`absolute z-50 right-4 top-16 w-48 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isMenuOpen ? "opacity-100 py-2" : "opacity-0 py-0 pointer-events-none"
          }`}
      >
        {/* Navigation Links for Mobile */}
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 duration-300 text-black dark:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="border-t border-gray-200 dark:border-gray-800 my-1"></div>
        {isSignedIn ? (
          <>
            <button
              onClick={() => {
                router.push("/dashboard/home");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 duration-300 text-black dark:text-white"
            >
              Panel
            </button>
            <button
              onClick={() => router.push("/dashboard/messages")}
              className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 duration-300 text-black dark:text-white"
            >
              Wiadomości
            </button>
            <button
              onClick={handleSignOut}
              className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 duration-300 text-black dark:text-white"
            >
              Wyloguj
            </button>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 duration-300 text-black dark:text-white"
          >
            Zaloguj się
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
