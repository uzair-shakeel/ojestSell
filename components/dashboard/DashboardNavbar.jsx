"use client";
import { useState, useEffect, useRef } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useAuth } from "../../lib/auth/AuthContext";
import { FiMenu, FiX, FiBell } from "react-icons/fi";
import { BsChatLeftDots } from "react-icons/bs";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";
import Avatar from "../both/Avatar";
import Link from "next/link";
import { useNotifications } from "../../lib/notifications/NotificationsContext";
import UserAccountDropdown from "../both/UserAccountDropdown";

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
    <header className="w-full h-16 px-4 bg-white dark:bg-dark-panel shadow-md flex justify-between items-center z-30 sticky top-0 transition-colors duration-300">
      {/* Mobile Sidebar Toggle - Left Side */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-700 dark:text-gray-300 md:hidden hover:bg-gray-100 dark:hover:bg-dark-raised rounded-xl transition-all"
          aria-label="Toggle Sidebar"
        >
          {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Theme Toggle */}
        <ThemeToggle size={22} />

        {/* Messages Icon */}
        <Link
          href="/dashboard/messages"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-raised text-gray-700 dark:text-dark-text-secondary transition-colors"
          title="Messages"
        >
          <BsChatLeftDots className="w-5 h-5" />
        </Link>

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

        {/* User Dropdown (Unified) - Hidden on Mobile */}
        <div className="hidden md:block">
          <UserAccountDropdown />
        </div>
      </div>
    </header>
  );
}
