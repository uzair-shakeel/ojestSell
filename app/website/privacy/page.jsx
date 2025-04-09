"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner Section with Image */}
      <div className="mt-4 mx-4 text-center rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat relative">
        <div
          className="w-full h-[300px] relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/IMG_4467.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="bg-black/20 flex justify-start md:justify-end py-4 md:py-24 px-4 h-full">
            <div className="relative z-10 w-full md:w-1/3 px-6 flex flex-col justify-center">
              <h1 className="text-xl font-extrabold text-white sm:text-4xl">
                Privacy Policy
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            1. Introduction
          </h2>
          <p className="text-gray-700 mb-4">
            At OjestSell, we are committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you visit our website or use our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            2. Information We Collect
          </h2>
          <p className="text-gray-700 mb-4">
            We collect several types of information from and about users of our
            website, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Personal Information:</strong> Name, email address,
              telephone number, postal address, and payment information.
            </li>
            <li>
              <strong>Vehicle Information:</strong> Make, model, year,
              condition, and details of vehicles listed on our platform.
            </li>
            <li>
              <strong>Usage Information:</strong> How you use our website, what
              pages you visit, and your interactions with listings.
            </li>
            <li>
              <strong>Device Information:</strong> IP address, browser type,
              operating system, and other technical information.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            3. How We Collect Information
          </h2>
          <p className="text-gray-700 mb-4">We collect information through:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>
              Direct interactions when you create an account or list a vehicle
            </li>
            <li>
              Automated technologies such as cookies and similar tracking
              technologies
            </li>
            <li>
              Third parties, such as payment processors and identity
              verification services
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            4. How We Use Your Information
          </h2>
          <p className="text-gray-700 mb-4">We use your information to:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>
              Process transactions and send transaction-related communications
            </li>
            <li>Create and maintain your account</li>
            <li>Connect buyers and sellers</li>
            <li>
              Send administrative information and marketing communications
            </li>
            <li>Protect our platform from fraudulent or illegal activity</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            5. Cookies and Tracking Technologies
          </h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to collect
            information about your browsing activities. Cookies are small text
            files stored on your device that help us provide a better user
            experience.
          </p>
          <p className="text-gray-700 mb-4">
            We use different types of cookies:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Essential Cookies:</strong> Required for our website to
              function properly.
            </li>
            <li>
              <strong>Analytical Cookies:</strong> Help us understand how
              visitors interact with our website.
            </li>
            <li>
              <strong>Functional Cookies:</strong> Allow us to remember your
              preferences and settings.
            </li>
            <li>
              <strong>Advertising Cookies:</strong> Used to deliver relevant
              advertisements and track ad campaign performance.
            </li>
          </ul>
          <p className="text-gray-700 mb-4">
            You can control cookie settings through your browser preferences.
            However, disabling certain cookies may limit your ability to use
            some features of our website.
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
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/website/terms"
            className="text-blue-600 hover:text-blue-800 font-medium mr-6"
          >
            View Terms & Conditions
          </Link>
          <Link
            href="/website/contact"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
