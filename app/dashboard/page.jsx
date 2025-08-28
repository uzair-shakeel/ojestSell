"use client";
import { useAuth } from "../../lib/auth/AuthContext";
import DashboardStats from "../../components/dashboard/DashboardStats";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <DashboardStats user={user} />
    </div>
  );
}
