"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosCookie } from "react-icons/io";
import {
  BsEmojiLaughing,
  BsEmojiSunglasses,
  BsEmojiFrown,
} from "react-icons/bs";
import { FaCookieBite } from "react-icons/fa";

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [cookieEaten, setCookieEaten] = useState(false);
  const [cookieMessage, setCookieMessage] = useState("");
  const [cookieFace, setCookieFace] = useState(null);

  useEffect(() => {
    // Check if user has already made a choice
    const consentGiven = localStorage.getItem("cookieConsent");

    if (consentGiven === null) {
      // Wait a moment before showing the cookie banner
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setCookieEaten(true);
    setCookieMessage("Yum! You accepted our cookies. They were delicious!");
    setCookieFace(<BsEmojiSunglasses className="text-3xl text-yellow-500" />);

    setTimeout(() => {
      setShowConsent(false);
    }, 4000);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setCookieEaten(true);
    setCookieMessage(
      "You declined our cookies... the cookie monster is sad now 😢"
    );
    setCookieFace(<BsEmojiFrown className="text-3xl text-blue-500" />);

    setTimeout(() => {
      setShowConsent(false);
    }, 4000);
  };

  const funCookieMessages = [
    "Our cookies don't have calories!",
    "Cookie Monster says: Share cookies with website!",
    "These cookies won't make you gain weight, promise!",
    "Cookies that track, not the ones that snack!",
    "Accept our digital cookies (taste better than they sound)",
    "These cookies are GDPR-licious!",
    "No milk required for these cookies!",
  ];

  // Get a random message
  const randomMessage =
    funCookieMessages[Math.floor(Math.random() * funCookieMessages.length)];

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            {cookieEaten ? (
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4 flex justify-center"
                >
                  {cookieFace}
                </motion.div>
                <p className="text-gray-800 font-medium">{cookieMessage}</p>
              </div>
            ) : (
              <>
                <div className="relative p-6 pb-0">
                  <div className="absolute -top-10 -right-10 text-blue-100 text-[120px] opacity-10 transform rotate-12">
                    <FaCookieBite />
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="mr-3 text-3xl text-amber-500">
                      <IoIosCookie />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Cookie Time!
                    </h3>
                  </div>

                  <p className="text-gray-700 mb-2">{randomMessage}</p>

                  <p className="text-gray-600 text-sm mb-4">
                    We use cookies to enhance your browsing experience, analyze
                    site traffic, and serve personalized content. By clicking
                    "Accept All", you consent to our use of cookies.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row p-4 gap-2 bg-gray-50">
                  <button
                    onClick={acceptCookies}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <BsEmojiLaughing /> Accept All
                  </button>

                  <button
                    onClick={declineCookies}
                    className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Decline <BsEmojiFrown />
                  </button>
                </div>

                <div className="px-4 pb-4">
                  <button
                    onClick={() => window.open("/website/terms", "_blank")}
                    className="text-blue-600 text-sm font-medium hover:underline mr-4"
                  >
                    Terms & Conditions
                  </button>
                  <button
                    onClick={() => window.open("/website/privacy", "_blank")}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Privacy Policy
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
