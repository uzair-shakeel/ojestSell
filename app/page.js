"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] w-[98%] mx-auto my-[10px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/Hero2-QKTSHICM.webp"
            alt="Car sales hero image"
            fill
            className="object-cover hidden md:block brightness-75"
            priority
          />
          <Image
            src="/Hero2-QKTSHICM - Copy.webp"
            alt="Car sales hero image"
            fill
            className="object-cover md:hidden brightness-75"
            priority
          />
        </div>
        <div className="relative  w-full z-10 h-full flex flex-col justify-between py-[90px] md:py-[120px] items-center text-center text-white">
          <div>
            <h1 className="text-xl md:text-5xl font-bold mb-4">
            Znajdź lub Sprzedaj Swoje Auto
            </h1>
          </div>
          <div className="absolute md:bottom-10 bottom-5 left-5 right-5">
            <FilterSearch />
          </div>
        </div>
      </section>

      {/* Video Section */}
      <VideoSection />

      <main className="flex-grow text-gray-900">
        <CarsNearMe />
        <FeaturedCategories />
        <BrowseCategories />
        <BrowseLocations />
        <BrowseByMake />
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
          Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
