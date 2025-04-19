import { auth , useUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardStats from "../../components/dashboard/DashboardStats";
export default function DashboardPage() {
  const { userId } = auth();
  const { user } = useUser();


  return (
    <div>
      <p>Your account has been created successfully.</p>
      <DashboardStats user={user} />
    </div>
  );
}