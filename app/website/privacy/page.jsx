"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const PrivacyPolicyPage = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner Section with Image */}
      <div className="mt-4 mx-4 text-center rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat relative">
        <div
          className="w-full h-[300px] md:h-[500px] relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1)), url('/IMG_4452.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="bg-black/20 flex justify-start md:justify-end py-4 md:py-24 px-4 h-full">
            <div className="relative z-10 md:w-1/3 px-6 flex flex-col justify-center">
              <h1 className="text-xl font-extrabold pt-24 md:pt-0 text-white sm:text-4xl">
                {t("privacy.hero.title")}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("privacy.sections.introduction.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("privacy.sections.introduction.content")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            {t("privacy.sections.informationWeCollect.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("privacy.sections.informationWeCollect.intro")}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>{t("privacy.sections.informationWeCollect.items.personal")}</li>
            <li>{t("privacy.sections.informationWeCollect.items.vehicle")}</li>
            <li>{t("privacy.sections.informationWeCollect.items.usage")}</li>
            <li>{t("privacy.sections.informationWeCollect.items.device")}</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            {t("privacy.sections.howWeCollect.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("privacy.sections.howWeCollect.intro")}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {t("privacy.sections.howWeCollect.items", {
              returnObjects: true,
            }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            {t("privacy.sections.howWeUse.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("privacy.sections.howWeUse.intro")}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {t("privacy.sections.howWeUse.items", { returnObjects: true }).map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            {t("privacy.sections.cookies.title")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("privacy.sections.cookies.content")}
          </p>
          <p className="text-gray-700 mb-4">
            {t("privacy.sections.cookies.intro")}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>{t("privacy.sections.cookies.types.essential")}</li>
            <li>{t("privacy.sections.cookies.types.analytical")}</li>
            <li>{t("privacy.sections.cookies.types.functional")}</li>
            <li>{t("privacy.sections.cookies.types.advertising")}</li>
          </ul>
          <p className="text-gray-700 mb-4">
            {t("privacy.sections.cookies.control")}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            6. Information Sharing and Disclosure
          </h2>
          <p className="text-gray-700 mb-4">
            We may share your information with:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Other users when necessary to facilitate transactions</li>
            <li>Service providers who help us operate our business</li>
            <li>
              Legal authorities when required by law or to protect our rights
            </li>
            <li>Business partners with your consent</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            7. Data Security
          </h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to
            protect your personal information. However, no method of
            transmission over the Internet or electronic storage is 100% secure,
            and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            8. Your Privacy Rights
          </h2>
          <p className="text-gray-700 mb-4">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of your personal information</li>
            <li>Objection to or restriction of processing</li>
            <li>Data portability</li>
            <li>Withdrawal of consent</li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise these rights, please contact us using the information
            provided below.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            9. Children's Privacy
          </h2>
          <p className="text-gray-700 mb-4">
            Our services are not intended for individuals under the age of 18.
            We do not knowingly collect personal information from children. If
            you become aware that a child has provided us with personal
            information, please contact us.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            10. Changes to This Privacy Policy
          </h2>
          <p className="text-gray-700 mb-4">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last Updated" date.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            11. Contact Information
          </h2>
          <p className="text-gray-700 mb-4">
            If you have questions or concerns about this Privacy Policy, please
            contact us at:
          </p>
          <p className="text-gray-700 mb-8">
            <strong>Email:</strong> privacy@ojestsell.com
            <br />
            <strong>Address:</strong> 123 Car Boulevard, Automotive City, AC
            12345
          </p>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600 text-sm">
              {t("terms.lastUpdated")}: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/website/terms"
            className="text-blue-600 hover:text-blue-800 font-medium mr-6"
          >
            {t("privacy.viewTerms")}
          </Link>
          <Link
            href="/website/contact"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t("privacy.contactUs")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
