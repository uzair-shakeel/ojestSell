"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

// Define the cn utility function directly in this file
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <button
        className="w-full flex justify-between items-center py-6 px-6 text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
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
                className="text-base text-gray-600 dark:text-gray-300 transition-colors duration-300"
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
  const { t } = useLanguage();
  const faqs = t("faq.questions", { returnObjects: true });
  const firstFaq = faqs[0];
  const remainingFaqs = faqs.slice(1);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-black transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-[600px] w-[98%] mx-auto py-[10px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/IMG_4469.jpg"
            alt="Car sales hero image"
            fill
            className="object-cover block brightness-75"
            priority
          />
        </div>

        <div className="relative z-10 container h-full flex flex-col justify-between py-[50px] md:py-[20px] items-center text-center text-white">
          <div>
            <h1 className="text-xl md:text-5xl font-bold mb-4">
              {t("faq.hero.title")}
            </h1>
          </div>
          <div className="absolute md:bottom-20 bottom-10 left-5 right-5 bg-white/70 dark:bg-black/80/70 backdrop-blur-sm p-2 rounded-xl shadow-lg max-w-3xl mx-auto transition-colors duration-300">
            <FAQItem question={firstFaq.question} answer={firstFaq.answer} />
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 transition-colors duration-300">
            {t("faq.hero.title")}
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            {t("faq.hero.subtitle")}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12 rounded-xl overflow-hidden"
        >
          <dl className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            {remainingFaqs.map((faq, index) => (
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
            backgroundImage: "url('/IMG_4467.jpg')",
          }}
        >
          <div className="bg-black/40 flex justify-start  md:justify-end py-4 md:py-24 px-4">
            <div className="flex flex-col items-center  w-full  md:w-1/3 justify-end">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 transition-colors duration-300">
                {t("faq.moreQuestions.title")}
              </h3>
              <p className="mt-4 text-lg text-white hidden md:block">
                {t("faq.moreQuestions.description")}
              </p>
              <a
                href="/website/contact"
                className="md:mt-6 mt-40 w-full md:w-fit inline-flex justify-center text-sm items-center px-6 py-3 border border-transparent md:text-base font-medium rounded-lg shadow-md text-white bg-blue-600/90 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                {t("faq.moreQuestions.contactButton")}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;
