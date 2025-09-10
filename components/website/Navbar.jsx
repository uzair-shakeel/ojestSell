"use client";
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { BsChatLeftDots } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import { useLanguage } from "../../lib/i18n/LanguageContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSignIn = () => {
    setIsMenuOpen(false);
    router.push("/sign-in");
  };

  const navLinks = [
    { name: t("navbar.links.home"), href: "/website" },
    { name: t("navbar.links.blog"), href: "/website/blog" },
    { name: t("navbar.links.faq"), href: "/website/faq" },
    { name: t("navbar.links.contact"), href: "/website/contact" },
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
        {/* <div className="">
          <LanguageSwitcher />
        </div> */}
        {/* Add Listing Button */}
        <button className="hidden md:block bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100">
          {t("navbar.becomeSeller")}
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
          <button
            onClick={handleSignIn}
            className="w-full text-left hover:bg-gray-100 p-2 duration-300"
          >
            Sign In
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
