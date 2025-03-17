'use client'
import { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Function to handle screen size changes
  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false); // Close sidebar on small screens
    } else {
      setIsSidebarOpen(true); // Open sidebar on larger screens
    }
  };

  // Add event listener for window resize
  useEffect(() => {
    handleResize(); // Set initial state based on screen size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  return (
<div className="absolute w-full h-auto min-h-screen top-0">
<div className="flex justify-center items-center min-h-screen h-auto bg-white transition-all duration-300">
          {/* Sidebar */}
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          {/* Main content adjusts dynamically */}
          <main
            className={`flex-1 flex flex-col transition-all duration-300 ${
              isSidebarOpen ? "ml-20 md:ml-64" : "ml-20"
            }`}
          >
            <DashboardNavbar />
            <div className="p-6 min-h-screen">
              {children}
            </div>
          </main>
      </div>

</div>
  );
}