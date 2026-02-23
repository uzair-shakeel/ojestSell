"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { CarsNearMe } from "../components/website/cars-near-me.jsx";
import { BrowseCategories } from "../components/website/browse-categories";
import { BrowseLocations } from "../components/website/browse-locations";
import { BrowseByMake } from "../components/website/browse-by-make";
import Navbar from "../components/website/Navbar.jsx";
import { FeaturedCategories } from "../components/website/featured-categories";
import { FilterSearch } from "../components/website/filter-search";
import { BlogSection } from "../components/website/blog-section.jsx";
import { Footer } from "../components/website/Footer.jsx";
import VideoSection from "../components/website/VideoSection";
import { FeaturedCars } from "../components/website/FeaturedCars.jsx";
import { DiscoveryPromo } from "../components/website/DiscoveryPromo.jsx";
import { CarsGridSection } from "../components/website/CarsGridSection.jsx";
import { useLanguage } from "../lib/i18n/LanguageContext";

// Component that uses useSearchParams
function HomeContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if __clerk_db_jwt parameter exists
    const clerkJwt = searchParams.get("__clerk_db_jwt");
    if (clerkJwt) {
      // Redirect directly to dashboard profile
      router.replace("/dashboard/profile");
      return;
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-main transition-colors duration-300">
      <Navbar />

      {/* Hero Section - Restored and Styled Premiumly */}
      <section className="relative h-[650px] w-[98%] mx-auto my-4 rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-900">
        <div className="absolute inset-0">
          <Image
            src="/Hero2-QKTSHICM.webp"
            alt="Car sales hero image"
            fill
            className="object-cover hidden md:block brightness-[0.7] scale-105"
            priority
          />
          <Image
            src="/Hero2-QKTSHICM - Copy.webp"
            alt="Car sales hero image"
            fill
            className="object-cover md:hidden brightness-[0.7] scale-105"
            priority
          />
          {/* Subtle Color Overlay */}
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
        </div>

        <div className="relative w-full z-10 h-full flex justify-center  items-end text-center text-white pb-24 px-6">


          <div className="w-full  max-w-5xl">
            <FilterSearch />
          </div>
        </div>

        {/* Ambient Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </section>

      <main className="flex-grow text-gray-900 dark:text-gray-200">
        <CarsNearMe />
        <BrowseCategories />
        <BrowseLocations />
        <DiscoveryPromo />
        <CarsGridSection />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
