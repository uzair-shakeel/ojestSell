"use client";
import { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger initial mount to avoid SSR mismatch
    setMounted(true);
    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute w-full h-auto min-h-screen top-0">
      <div className="flex justify-center items-center min-h-screen h-auto bg-white transition-all duration-300">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? "ml-20 md:ml-64" : "ml-20"
          }`}
        >
          <DashboardNavbar />
          <div className="p-4 min-h-screen">{children}</div>
        </main>
      </div>
    </div>
  );
}
