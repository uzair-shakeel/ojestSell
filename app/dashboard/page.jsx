"use client";
import {  useUser } from "@clerk/nextjs";
import DashboardStats from "../../components/dashboard/DashboardStats";
export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div>
      <p>Your account has been created successfully.</p>
      <DashboardStats user={user} />
    </div>
  );
}
