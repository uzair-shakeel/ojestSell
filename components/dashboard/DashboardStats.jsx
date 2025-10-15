"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { getCarsByUserId } from "../../services/carService";
import KPICard from "./KPICard";
import { BsChatLeftDots } from "react-icons/bs";
import { FaCar } from "react-icons/fa";
import { HiOutlineUser } from "react-icons/hi";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function DashboardStats({ user: userProp }) {
  const { user: contextUser, userId, getToken } = useAuth();
  const user = contextUser || userProp;

  const [carsCount, setCarsCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);

        const tasks = [];

        if (userId && typeof getToken === "function") {
          tasks.push(
            getCarsByUserId(userId, getToken)
              .then((cars) => {
                if (!isMounted) return;
                setCarsCount(Array.isArray(cars) ? cars.length : 0);
              })
              .catch(() => {
                if (!isMounted) return;
                setCarsCount(0);
              })
          );
        }

        const token = await getToken();
        if (token) {
          tasks.push(
            fetch(`${API_BASE}/api/chat/my-chats`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch chats");
                const data = await res.json();
                const chats = Array.isArray(data) ? data : data?.chats || [];
                if (!isMounted) return;
                setChatsCount(Array.isArray(chats) ? chats.length : 0);
              })
              .catch(() => {
                if (!isMounted) return;
                setChatsCount(0);
              })
          );
        }

        await Promise.all(tasks);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [userId, getToken]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KPICard
        title="Total Cars"
        value={loading ? "-" : carsCount}
        icon={<FaCar className="w-6 h-6" />}
        gradient="from-sky-500 to-blue-600"
      />
      <KPICard
        title="Chats"
        value={loading ? "-" : chatsCount}
        icon={<BsChatLeftDots className="w-6 h-6" />}
        gradient="from-emerald-500 to-teal-600"
      />
      <KPICard
        title="Welcome"
        value={user?.firstName || "User"}
        icon={<HiOutlineUser className="w-6 h-6" />}
        gradient="from-fuchsia-500 to-pink-600"
      />
    </div>
  );
}
