"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function BrowseCategories() {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  // Get brands from translations
  const brands = t("homepage.browseCategories.brands");
  const displayedBrands = showAll ? brands : brands.slice(0, 12);

  return (
    <section className="py-12">
      <div className=" mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t("homepage.browseCategories.title")}
        </h2>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedBrands.map((brand) => (
            <Link
              key={brand.id}
              href={{
                pathname: "/website/cars",
                query: { make: brand.name },
              }}
              className="relative bg-white border border-gray-400 rounded-lg shadow-sm p-6 flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="relative w-24 h-12">
                <Image
                  src={brand.logo || "/placeholder.svg"}
                  alt={brand.name}
                  fill
                  className="object-contain h-full w-auto"
                />
              </div>
              <span className="text-lg font-medium">{brand.name}</span>
              {brand.discount && (
                <span className="absolute top-2 right-2 text-sm text-green-600 font-semibold">
                  -{brand.discount}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* See More Button */}
        <div className="flex justify-center mt-8">
          <button
            className="rounded-full px-8 py-2 border border-gray-300 inline-flex items-center hover:bg-gray-100 transition-colors"
            onClick={() => setShowAll(!showAll)}
          >
            {t("homepage.browseCategories.seeMore")}
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
