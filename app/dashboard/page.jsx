import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardStats from "../../components/dashboard/DashboardStats";

export default function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
      <DashboardStats />
    </div>
  );
}
