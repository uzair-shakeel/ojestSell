"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Define the cn utility function directly in this file
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 overflow-hidden">
      <button
        className="w-full flex justify-between items-center py-6 px-6 text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="ml-6 flex-shrink-0 bg-blue-50 rounded-full p-2"
        >
          <ChevronDown
            className={cn(
              "h-5 w-5 transition-colors duration-200",
              isOpen ? "text-blue-600" : "text-gray-400"
            )}
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="pb-6 px-6">
              <motion.p
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                className="text-base text-gray-600"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQPage = () => {
  const faqs = [
    {
      question: "How do I list my car for sale?",
      answer:
        "To list your car for sale, first create an account or log in. Then click on the 'Become a seller' button in the navbar, complete your seller profile, and follow the guided process to add your car details, photos, and set your price.",
    },
    {
      question: "Is there a fee for listing a car?",
      answer:
        "Basic listings are free. We also offer premium listing options with additional features like highlighted placement, extended listing duration, and more photos to help your car stand out. You can view our pricing options during the listing process.",
    },
    {
      question: "How long does a listing stay active?",
      answer:
        "Standard listings remain active for 30 days. Premium listings can remain active for up to 60 days. You can always renew or update your listing if your car hasn't sold within that timeframe.",
    },
    {
      question: "How do I contact a seller?",
      answer:
        "When viewing a car listing, you'll see contact options such as sending a direct message through our platform, requesting a call back, or in some cases, viewing the seller's phone number if they've chosen to display it.",
    },
    {
      question: "Are there any buyer protection policies?",
      answer:
        "Yes, we offer buyer protection through our secure messaging and transaction system. We recommend always communicating through our platform and following our safety guidelines for viewing and purchasing vehicles.",
    },
    {
      question: "Can I sell cars commercially on this platform?",
      answer:
        "Yes, we welcome both private sellers and professional dealers. Commercial sellers can create a dealer account with additional features designed for managing multiple listings and showcasing your dealership.",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "Our platform facilitates connections between buyers and sellers. While we recommend secure payment methods, the actual payment arrangement is between buyers and sellers. We suggest using secure methods like bank transfers or escrow services for large transactions.",
    },
    {
      question: "How do I edit or remove my listing?",
      answer:
        "You can manage all aspects of your listing from your dashboard. Simply log in, navigate to 'My Cars', select the listing you wish to modify, and use the edit or delete options available.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about using our car marketplace.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12  rounded-xl overflow-hidden "
        >
          <dl className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <FAQItem question={faq.question} answer={faq.answer} />
              </motion.div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/IMG_4467.jpg')", // Replace with your image path
          }}
        >
          <div className="bg-black/40 flex justify-start  md:justify-end py-4 md:py-24 px-4">
            {" "}
            <div className="flex flex-col items-center  w-full  md:w-1/3 justify-end">
              {/* Optional: adds a subtle overlay */}
              <h3 className="text-xl hidden md:block  font-extrabold text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                More questions?
              </h3>
              <p className="mt-4 text-lg text-white hidden md:block">
                If you cannot find the answer to your question, feel free to
                contact our support team.
              </p>
              <a
                href="/website/contact"
                className="md:mt-6 mt-40 w-full md:w-fit inline-flex justify-center  text-sm  items-center px-6 py-3 border  border-transparent  md:text-base font-medium rounded-lg shadow-md text-white bg-blue-600/90 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                Contact Support
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;
