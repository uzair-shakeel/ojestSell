"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Navbar from "../components/website/Navbar.jsx";
import { FilterSearch } from "../components/website/filter-search";
import { Footer } from "../components/website/Footer.jsx";
import { useLanguage } from "../lib/i18n/LanguageContext";

const CarsNearMe = dynamic(
  () => import("../components/website/cars-near-me.jsx").then((m) => m.CarsNearMe),
  { ssr: false }
);
const BrowseCategories = dynamic(
  () => import("../components/website/browse-categories").then((m) => m.BrowseCategories),
  { ssr: false }
);
const BrowseLocations = dynamic(
  () => import("../components/website/browse-locations").then((m) => m.BrowseLocations),
  { ssr: false }
);
const DiscoveryPromo = dynamic(
  () => import("../components/website/DiscoveryPromo.jsx").then((m) => m.DiscoveryPromo),
  { ssr: false }
);
const CarsGridSection = dynamic(
  () => import("../components/website/CarsGridSection.jsx").then((m) => m.CarsGridSection),
  { ssr: false }
);
const BlogSection = dynamic(
  () => import("../components/website/blog-section.jsx").then((m) => m.BlogSection),
  { ssr: false }
);

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const clerkJwt = searchParams.get("__clerk_db_jwt");
    if (clerkJwt) {
      router.replace("/dashboard/profile");
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-main transition-colors duration-300">
      <Navbar />

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
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
        </div>

        <div className="relative w-full z-10 h-full flex justify-center  items-end text-center text-white pb-24 px-6">
          <div className="w-full  max-w-5xl">
            <FilterSearch />
          </div>
        </div>

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
