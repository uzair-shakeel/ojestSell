"use client";
import React, { useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth} from "@clerk/nextjs"; // Import Clerk hooks
import { SignOutButton } from '@clerk/nextjs'
import { SignInButton } from '@clerk/nextjs'



const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth(); // Check if the user is signed in

  const navLinks = [
    { name: "Home", href: "/website" },
    { name: "Blog", href: "/website/blog" },
    { name: "FAQ", href: "/website/faq" },
    { name: "Contact", href: "/website/contact" },
  ];


  return (
    <header className="w-full p-4 bg-white shadow-md flex justify-between items-center text-black">
      {/* Logo */}
      <div className="">
        <Link href="/website">
          <img src="/whitelogo.png" alt="Ojest Logo" className="h-10" />
        </Link>
      </div>

      <div className="flex items-center space-x-5 sm:mx-4">
        {/* Add Listing Button */}
        <button className="hidden md:block bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100">
          Become a seller
        </button>

        {/* Profile/Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-700"
        >
          <IoPersonCircleOutline size={30} />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute z-50 right-4 top-16 bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-48 flex flex-col space-y-2">
          {/* Navigation Links for Mobile */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="w-full text-left hover:bg-gray-100 p-2 duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-200 my-1"></div>
          {isSignedIn && (
            <button
              onClick={() => router.push("/dashboard/home")}
              className="w-full text-left hover:bg-gray-100 p-2 duration-300"
            >
              Dashboard
            </button>
          )}
          {/* Conditionally render Login or Logout based on auth status */}
          {isSignedIn ? (
            <div className="w-full text-left hover:bg-gray-100 p-2 duration-300">
              <SignOutButton />
            </div>
          ) : (
            <div className="w-full text-left hover:bg-gray-100 p-2 duration-300">
              <SignInButton />
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;