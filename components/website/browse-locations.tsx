"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const CAR_TYPES = [
  {
    id: 1,
    name: "HATCHBACK",
    image:
      "https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?q=80&w=2942&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "SEDAN",
    image:
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=2564&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "KOMBI",
    image:
      "https://images.unsplash.com/photo-1567514314761-dcc1c0d64b26?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "COUPE",
    image:
      "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=2071&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "SPORTS",
    image:
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "LIMOUSINE",
    image:
      "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "SUV",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "CONVERTIBLE",
    image:
      "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?q=80&w=2072&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "PICKUP",
    image:
      "https://images.unsplash.com/photo-1558383817-6a5d00b668b9?q=80&w=2071&auto=format&fit=crop",
  },
  {
    id: 10,
    name: "OFF-ROAD",
    image:
      "https://images.unsplash.com/photo-1536698986031-36d0cd2f07e8?q=80&w=2071&auto=format&fit=crop",
  },
  {
    id: 11,
    name: "BUS",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 12,
    name: "CLASSIC",
    image:
      "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 13,
    name: "CAMPERS",
    image:
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=2070&auto=format&fit=crop",
  },
];

export function BrowseLocations() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="block py-16">
      <div className="max-w-[1400px] w-[98%] mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Top-rated cars by type
        </h2>

        <div className="relative group">
          {/* Left scroll button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-3 md:gap-6 pb-8 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CAR_TYPES.map((type) => (
              <Link
                key={type.id}
                href={`/cars/${type.name.toLowerCase()}`}
                className="flex-none w-[100px] md:w-[150px] group/item transition-all duration-300 md:hover:w-[270px]"
              >
                <div className=" overflow-hidden bg-white h-full">
                  <div className="relative rounded-xl h-[350px] w-full overflow-hidden">
                    <Image
                      src={type.image || "/placeholder.svg"}
                      alt={type.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover/item:scale-110"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-center py-4 px-2">
                    <h3 className="font-medium text-sm tracking-wide">
                      {type.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right scroll button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-5 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
