"use client";
import React, { useState, useEffect, useRef } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { BsChatLeftDots } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeToggle from "../ThemeToggle";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import Avatar from "../both/Avatar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const router = useRouter();
  const { t } = useLanguage();
  const { isSignedIn, logout, user } = useAuth();

  const handleSignIn = () => {
    setIsMenuOpen(false);
    router.push("/sign-in");
  };

  const handleSignOut = () => {
    setIsMenuOpen(false);
    logout();
    router.push("/");
  };

  const navLinks = [
    { name: t("navbar.links.home"), href: "/website" },
    { name: t("navbar.links.blog"), href: "/website/blog" },
    { name: t("navbar.links.faq"), href: "/website/faq" },
    { name: t("navbar.links.contact"), href: "/website/contact" },
  ];

  // Smooth dropdown: animate max-height from 0 to content height
  const dropdownRef = useRef(null);
  const [dropdownMax, setDropdownMax] = useState(0);
  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;
    if (isMenuOpen) {
      // Measure full content height
      const full = el.scrollHeight || 0;
      setDropdownMax(full);
    } else {
      setDropdownMax(0);
    }
  }, [isMenuOpen, isSignedIn, t, user]);

  return (
    <header className="w-full h-16 px-4 bg-white dark:bg-gray-900 shadow-md flex justify-between items-center text-black dark:text-white transition-colors duration-300">
      {/* Logo */}
      <div className="">
        <Link href="/website">
          <img src="/whitelogo.png" alt="Ojest Logo" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="flex items-center space-x-3 sm:mx-4">
        {/* Theme Toggle */}
        <ThemeToggle size={24} />

        {/* <div className="">
          <LanguageSwitcher />
        </div> */}
        {/* CTA Button: Become a seller (signed out) or Dashboard (signed in) */}
        {isSignedIn ? (
          <button
            onClick={() => router.push("/dashboard/home")}
            className="hidden md:block bg-white dark:bg-gray-800800800800800800800800800800 border border-gray-300 dark:border-white px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white transition-colors duration-300"
          >
            Panel
          </button>
        ) : (
          <Link
            href="/sign-up"
            className="hidden md:block bg-white dark:bg-gray-800800800800800800800 border border-gray-300 dark:border-white px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white transition-colors duration-300"
          >
            {t("navbar.becomeSeller")}
          </Link>
        )}

        {/* Profile/Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
        >
           { user ? (
            <Avatar
              src={user.image || user.profilePicture}
              alt={user.firstName || user.email || "User"}
              size={28}
            />
          ) : (
            <IoPersonCircleOutline size={30} />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        ref={dropdownRef}
        style={{ maxHeight: dropdownMax }}
        className={`absolute z-50 right-4 top-16 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isMenuOpen ? "opacity-100 py-2" : "opacity-0 py-0 pointer-events-none"
        }`}
      >
        {/* Navigation Links for Mobile */}
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 duration-300 text-black dark:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="border-t border-gray-200 dark:border-gray-800 my-1"></div>
        {isSignedIn ? (
          <>
            <button
              onClick={() => {
                router.push("/dashboard/home");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 duration-300 text-black dark:text-white"
            >
              Panel
            </button>
            <button
              onClick={handleSignOut}
              className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 duration-300 text-black dark:text-white"
            >
              Wyloguj się
            </button>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 duration-300 text-black dark:text-white"
          >
            Zalogować się
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
