"use client";

import { FaCar } from "react-icons/fa";
import { BiAddToQueue } from "react-icons/bi";
import { BsChatLeftDots, BsPersonGear } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const unseenMessagesCount = 3;

  const menuItems = [
    { label: "Dashboard", href: "/dashboard/home", icon: <RiDashboardHorizontalLine className="w-6 h-6" /> },
    { label: "Create Car", href: "/dashboard/cars/add", icon: <BiAddToQueue className="w-6 h-6" /> },
    { label: "My Cars", href: "/dashboard/cars", icon: <FaCar className="w-6 h-6" /> },
    { label: "Messages", href: "/dashboard/messages", icon: <BsChatLeftDots className="w-6 h-6" /> },
    { label: "Profile", href: "/dashboard/profile", icon: <BsPersonGear className="w-6 h-6" /> },
  ];

  return (
    <motion.div
      initial={{ width: 80 }}
      animate={{ width: isOpen ? 256 : 80 }}
      exit={{ width: 80 }}
      transition={{ duration: 0.3 }}
      className="z-50 fixed inset-y-0 left-0 h-screen bg-[#181818] text-white shadow-lg"
    >
      <div className="flex items-center justify-between px-4 py-5">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/">
                <img src="/blacklogo.png" alt="Logo" className="w-28" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={toggleSidebar}
          className="p-2 rounded-sm text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </motion.button>
      </div>

      <AnimatePresence>
       
          <div
            className="flex items-center justify-center py-4 px-3 border-y border-gray-700"
          >
            <motion.img
              alt="User Avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-lg"
            />
              {isOpen && (
              <motion.div 
                className="ml-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-sm font-semibold text-white">John Doe</h2>
                <p className="text-xs text-gray-400">johndoe@example.com</p>
              </motion.div>
            )}
          </div>
        
      </AnimatePresence>

      <nav className="mt-6">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              href={item.href}
              className="flex flex-row items-center p-3 rounded-md hover:bg-blue-500 transition-all m-2 justify-normal"
            >
              {item.icon}
              {isOpen && <span className="ml-3 text-white text-sm ">{item.label}</span>}
              {item.label === "Messages" && unseenMessagesCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-5 w-5 h-5 flex items-center justify-center bg-red-500 text-xs text-white rounded-full"
                >
                  {unseenMessagesCount}
                </motion.span>
              )}
            </Link>
          </motion.div>
        ))}
      </nav>
    </motion.div>
  );
}
