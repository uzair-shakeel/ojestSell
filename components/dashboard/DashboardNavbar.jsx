"use client";
import { useState, useEffect, useRef } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useAuth } from "../../lib/auth/AuthContext";
import { FiMenu, FiX, FiBell } from "react-icons/fi";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";
import Avatar from "../both/Avatar";
import Link from "next/link";
import { useNotifications } from "../../lib/notifications/NotificationsContext";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const buildApiUrl = (path) => {
  const base = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";
  return `${base}${path}`;
};

export default function DashboardNavbar({ isOpen, toggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, getToken, userId, updateUserState } = useAuth();
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAll, add } = useNotifications();
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef(null);

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
      if (!n.read) await markRead(n.id);
    } catch { }
    setOpenNotif(false);
    router.push(getNotifTarget(n));
  };

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
    <header className="w-full h-16 px-4 bg-white dark:bg-dark-panel shadow-md flex justify-between md:justify-end items-center z-30 sticky top-0 transition-colors duration-300">
      {/* Logo */}
      <Link href="/">
        <img src="/logo.png" alt="Ojest Logo" className="h-10 w-auto md:hidden" />
      </Link>


      <div className="flex items-center space-x-3 sm:mx-4">
        {/* Theme Toggle */}
        <ThemeToggle size={24} />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setOpenNotif((v) => !v)}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-raised text-gray-700 dark:text-dark-text-secondary"
          >
            <FiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-dark-divider">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 dark:text-white">Powiadomienia</div>
                <button onClick={markAll} className="text-xs text-blue-600 hover:underline">Oznacz wszystkie jako przeczytane</button>
              </div>
              <div className="max-h-96 overflow-auto">
                {(notifications || []).length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500">Brak powiadomień</div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-dark-divider">
                    {(notifications || []).slice(0, 8).map((n) => (
                      <li
                        key={n.id}
                        className={`px-3 py-2 flex items-start gap-3 ${n.read ? "opacity-80" : ""} cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-raised`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? "bg-gray-300" : "bg-blue-500"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200 dark:text-dark-text-primary truncate">{n.title}</div>
                          {n.body && <div className="text-xs text-gray-600 dark:text-dark-text-muted truncate">{n.body}</div>}
                          <div className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {n.read ? (
                            <button
                              onClick={() => add({ ...n, id: n.id + "-dup", read: false, createdAt: Date.now() })}
                              className="text-xs text-gray-500 hover:underline"
                            >
                              Nieprzeczytane
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Oznacz jako przeczytane
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="px-3 py-2 border-t border-gray-100 dark:border-dark-divider text-right">
                <Link href="/dashboard/notifications" onClick={() => setOpenNotif(false)} className="text-sm text-blue-600 hover:underline">
                  Zobacz wszystkie
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Add Listing Button */}
        <button
          onClick={() => router.push("/dashboard/cars/add")}
          className="hidden md:block bg-white dark:bg-dark-raised border border-gray-300 dark:border-dark-divider px-4 py-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-dark-elevation-3 text-black dark:text-white transition-colors duration-300"
        >
          Add Listing
        </button>

        {/* Static user chip (no dropdown) */}
        <div className="hidden md:flex items-center space-x-2 p-2 rounded-full">
          {user ? (
            <Avatar
              src={user.image || user.profilePicture}
              alt={user.firstName || user.email || "User"}
              size={24}
            />
          ) : (
            <IoPersonCircleOutline className="w-6 h-6 text-gray-700 dark:text-dark-text-secondary" />
          )}
          <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            {user?.firstName || user?.email || "User"}
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="text-gray-700 dark:text-gray-300 block md:hidden hover:text-gray-900 dark:text-gray-200 dark:hover:text-white transition-colors"
        >
          {isOpen ? (
            <FiX className="w-6 h-6" />
          ) : (
            <>
              <FiMenu className="w-6 h-6 hidden md:block" />
              <Avatar
                src={user.image || user.profilePicture}
                alt={user.firstName || user.email || "User"}
                size={24}
                className="md:hidden"
              />
            </>
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
