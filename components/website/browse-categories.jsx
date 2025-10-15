"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function BrowseCategories() {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  // Get brands from translations and ensure it's an array
  const brands =
    t("homepage.browseCategories.brands", { returnObjects: true }) || [];
  // Make sure brands is an array before slicing
  const displayedBrands = Array.isArray(brands)
    ? showAll
      ? brands
      : brands.slice(0, 12)
    : [];

  return (
    <section className="py-12 bg-white dark:bg-black transition-colors duration-300">
      <div className=" mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white transition-colors duration-300">
        Szukaj po Marce 
        </h2>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[900px] mx-auto">
          {displayedBrands.map((brand) => (
            <Link
              key={brand.id}
              href={{
                pathname: "/website/cars",
                query: { make: brand.name },
              }}
              className="relative min-h-[120px] bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 flex flex-col pl-6 md:flex-row items-center gap-2 hover:shadow-md dark:hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800"
            >
              <div className="relative w-20 h-10">
                <Image
                  src={brand.logo || "/placeholder.svg"}
                  alt={brand.name}
                  fill
                  className="object-contain h-full w-auto"
                />
              </div>
              <span className="text-md font-medium text-gray-900 dark:text-white transition-colors duration-300">{brand.name}</span>
              {brand.discount && (
                <span className="absolute rotate-45 top-6 right-0 text-sm text-green-600 dark:text-green-400 font-semibold transition-colors duration-300">
                  save {brand.discount}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* See More Button */}
        {Array.isArray(brands) && brands.length > 12 && (
          <div className="flex justify-center mt-8">
            <button
              className="rounded-full px-8 py-2 border border-gray-300 dark:border-white inline-flex items-center hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-white transition-colors duration-300"
              onClick={() => setShowAll(!showAll)}
            >
              {t("homepage.browseCategories.seeMore")}
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
