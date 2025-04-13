"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const TermsPage = () => {
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
                Clear Terms. Smooth Rides. Drive with Confidence.
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            1. Introduction
          </h2>
          <p className="text-gray-700 mb-4">
            Welcome to OjestSell. These Terms and Conditions govern your use of
            our website and services. By accessing or using OjestSell, you agree
            to be bound by these Terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            2. Definitions
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>
              <strong>"OjestSell"</strong> refers to our company, website, and
              services.
            </li>
            <li>
              <strong>"User"</strong> refers to individuals who access or use
              our services.
            </li>
            <li>
              <strong>"Listing"</strong> refers to car advertisements created on
              our platform.
            </li>
            <li>
              <strong>"Content"</strong> refers to text, images, and other
              materials uploaded to our platform.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            3. Account Registration
          </h2>
          <p className="text-gray-700 mb-4">
            To use certain features of our service, you may need to register for
            an account. You agree to provide accurate information and to keep
            your account credentials secure. You are responsible for all
            activity on your account.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            4. Listing Rules
          </h2>
          <p className="text-gray-700 mb-4">
            When creating listings on OjestSell, you must:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Provide accurate and truthful information about the vehicle</li>
            <li>Include only images of the actual vehicle being sold</li>
            <li>Set realistic and fair prices</li>
            <li>Respond to inquiries in a timely manner</li>
            <li>Remove listings promptly after a sale is completed</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            5. Prohibited Activities
          </h2>
          <p className="text-gray-700 mb-4">
            The following activities are prohibited on our platform:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Posting fraudulent listings or misrepresenting vehicles</li>
            <li>Harassment or abusive behavior toward other users</li>
            <li>Attempting to circumvent our fee structure</li>
            <li>Creating multiple accounts for the same person</li>
            <li>Using automated systems to scrape or collect data</li>
            <li>Posting illegal or stolen vehicles</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            6. Fees and Payments
          </h2>
          <p className="text-gray-700 mb-4">
            Basic listings are free. Premium listings and additional services
            may incur fees, which will be clearly communicated before purchase.
            All payments are processed securely through our payment partners.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            7. Intellectual Property
          </h2>
          <p className="text-gray-700 mb-4">
            Content uploaded by users remains the property of the respective
            users. By uploading content, you grant OjestSell a non-exclusive
            license to use, display, and distribute that content on our
            platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            8. Privacy
          </h2>
          <p className="text-gray-700 mb-4">
            Our Privacy Policy governs the collection and use of your personal
            information. By using OjestSell, you consent to the practices
            described in our Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            9. Limitation of Liability
          </h2>
          <p className="text-gray-700 mb-4">
            OjestSell is provided "as is" without warranties of any kind. We are
            not responsible for the accuracy of user listings, the condition of
            vehicles, or transactions between users. We do not guarantee that
            our service will be uninterrupted or error-free.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            10. Dispute Resolution
          </h2>
          <p className="text-gray-700 mb-4">
            Any disputes arising from these Terms shall be resolved through
            good-faith negotiations. If negotiations fail, disputes will be
            resolved through arbitration in accordance with applicable laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            11. Termination
          </h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to terminate or suspend accounts that violate
            these Terms or for any other reason at our sole discretion. Users
            may terminate their accounts at any time.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            12. Changes to Terms
          </h2>
          <p className="text-gray-700 mb-4">
            We may modify these Terms at any time. Continued use of OjestSell
            after changes constitutes acceptance of the modified Terms. We will
            make reasonable efforts to notify users of significant changes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
            13. Contact Information
          </h2>
          <p className="text-gray-700 mb-4">
            If you have questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-700 mb-8">
            <strong>Email:</strong> legal@ojestsell.com
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
            href="/website/contact"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Have questions? Contact us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
