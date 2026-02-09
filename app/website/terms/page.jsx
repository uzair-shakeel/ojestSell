"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const TermsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner Section with Image */}
      <div className="mt-4 mx-4 text-center rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat relative">
        <div
          className="w-full h-[300px] md:h-[500px] relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1)), url('/IMG_4466.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="bg-black/20 flex justify-start md:justify-end py-4 md:py-24 px-4 h-full">
            <div className="relative z-10 md:w-1/3 px-6 flex flex-col justify-center">
              <h1 className="text-xl font-extrabold pt-24 md:pt-0 text-white sm:text-4xl">
                {t("terms.hero.title")}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6">
            {t("terms.sections.introduction.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.introduction.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.definitions.title")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>{t("terms.sections.definitions.items.ojestsell")}</li>
            <li>{t("terms.sections.definitions.items.user")}</li>
            <li>{t("terms.sections.definitions.items.listing")}</li>
            <li>{t("terms.sections.definitions.items.content")}</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.accountRegistration.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.accountRegistration.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.listingRules.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.listingRules.intro")}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {t("terms.sections.listingRules.items", {
              returnObjects: true,
            }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.prohibitedActivities.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.prohibitedActivities.intro")}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {t("terms.sections.prohibitedActivities.items", {
              returnObjects: true,
            }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.feesAndPayments.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.feesAndPayments.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.intellectualProperty.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.intellectualProperty.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.privacy.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.privacy.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.limitationOfLiability.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.limitationOfLiability.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.disputeResolution.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.disputeResolution.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.termination.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.termination.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.changes.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.changes.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 mt-8">
            {t("terms.sections.contact.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("terms.sections.contact.intro")}
          </p>
          <p className="text-gray-700 mb-8">
            {t("terms.sections.contact.email")}
            <br />
            {t("terms.sections.contact.address")}
          </p>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600 text-sm">
              {t("terms.lastUpdated")}: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/website/contact"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t("terms.haveQuestions")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
