"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

const MAKES = [
  {
    id: 1,
    name: "Toyota",
    logo: "/toyota.png",
    background:
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=2071&auto=format&fit=crop",
    description: "Reliable Japanese engineering with innovative technology",
  },
  {
    id: 2,
    name: "BMW",
    logo: "/BMW.png",
    background:
      "https://images.unsplash.com/photo-1607853554439-0069ec0f29b6?q=80&w=2427&auto=format&fit=crop",
    description: "The ultimate driving machines with luxury and performance",
  },
  {
    id: 3,
    name: "Mercedes",
    logo: "/Mercedes.png",
    background:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
    description: "Luxury vehicles with cutting-edge technology and comfort",
  },
  {
    id: 4,
    name: "Audi",
    logo: "https://www.carlogos.org/car-logos/audi-logo-2016.png",
    background:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop",
    description:
      "Sophisticated design with advanced technology and performance",
  },
  {
    id: 5,
    name: "Porsche",
    logo: "/porsche.png",
    background:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop",
    description: "Precision German sports cars with unmatched performance",
  },
  {
    id: 6,
    name: "Tesla",
    logo: "/tesla.png",
    background:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
    description:
      "Revolutionary electric vehicles redefining the automotive industry",
  },
  {
    id: 7,
    name: "Ford",
    logo: "/ford.png",
    background:
      "https://images.unsplash.com/photo-1551830820-330a71b99659?q=80&w=2070&auto=format&fit=crop",
    description:
      "American-made vehicles with a legacy of innovation and performance",
  },
  {
    id: 8,
    name: "Honda",
    logo: "/honda.png",
    background:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop",
    description: "Reliable and efficient vehicles with excellent resale value",
  },
];

export function BrowseByMake() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    // Skip effect during SSR
    if (typeof window === "undefined") return;

    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    // Calculate the scroll distance needed for the full horizontal scroll
    const calculateScrollDistance = () => {
      if (!container) return 0;
      return container.scrollWidth - window.innerWidth;
    };

    // Set up the scroll height to accommodate the horizontal scroll
    const setScrollHeight = () => {
      if (!section) return;
      // Add an extra viewport height to ensure we can trigger the first make
      section.style.height = `${window.innerHeight * (MAKES.length + 0.5)}px`;
    };

    let currentIndex = 0;
    let isScrolling = false;
    let lastScrollTime = 0;

    // Handle scroll event with snapping
    const handleScroll = () => {
      if (!section || !container || isScrolling) return;

      const now = Date.now();
      if (now - lastScrollTime < 200) return; // Debounce rapid scroll events

      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const viewportHeight = window.innerHeight;

      // Start showing content when the section is at the bottom of the viewport
      if (sectionTop <= viewportHeight) {
        setIsPinned(true);

        // If we're just entering the section, show the first make
        if (sectionTop > 0 && currentIndex === 0) {
          container.style.transform = `translateX(0px)`;
          setScrollProgress(0);
          return;
        }

        // Calculate which make should be shown based on scroll position
        // Adjust the calculation to account for the section entering the viewport
        const scrolledIntoSection = viewportHeight - sectionTop;
        const makeIndex = Math.min(
          Math.max(0, Math.floor(scrolledIntoSection / viewportHeight)),
          MAKES.length - 1
        );

        if (makeIndex !== currentIndex) {
          isScrolling = true;
          currentIndex = makeIndex;

          // Update progress for progress bar
          const progress = currentIndex / (MAKES.length - 1);
          setScrollProgress(progress);

          // Apply horizontal scroll to show the current make
          const scrollDistance = calculateScrollDistance();
          const targetX = (scrollDistance / (MAKES.length - 1)) * currentIndex;

          container.style.transform = `translateX(-${targetX}px)`;

          // Prevent additional scrolling for a short period
          setTimeout(() => {
            isScrolling = false;
            lastScrollTime = Date.now();
          }, 500);
        }
      } else {
        setIsPinned(false);
        currentIndex = 0;
      }
    };

    // Initialize
    setScrollHeight();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", setScrollHeight);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", setScrollHeight);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      <div
        className={`sticky top-0 max-w-screen h-screen overflow-hidden ${
          isPinned ? "z-10" : ""
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-20">
          <div
            className="h-full bg-blue-600 transition-all duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Title overlay */}
        <div className="absolute top-8 left-8 z-20">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            Browse by Make
          </h2>
        </div>

        {/* Horizontal scrollable content */}
        <div
          ref={containerRef}
          className="flex transition-transform duration-300 will-change-transform h-screen"
          style={{
            width: `${MAKES.length * 100}vw`,
            scrollSnapType: "x mandatory",
          }}
        >
          {MAKES.map((make) => (
            <div
              key={make.id}
              className="w-screen h-screen flex-shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="relative h-full w-full">
                {/* Full-screen background image */}
                <Image
                  src={make.background || "/placeholder.svg"}
                  alt={`${make.name} cars`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/40" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-white p-4">
                  <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl max-w-xl w-full text-center">
                    <div className="w-32 h-32 mx-auto bg-white rounded-full p-4 mb-6 shadow-lg">
                      <div className="relative w-full h-full">
                        <Image
                          src={make.logo || "/placeholder.svg"}
                          alt={make.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold mb-4">{make.name}</h3>
                    <p className="text-xl mb-8">{make.description}</p>
                    <Link
                      href={`/make/${make.name.toLowerCase()}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors text-lg"
                    >
                      View {make.name} Vehicles
                    </Link>
                  </div>
                </div>

                {/* Brand indicator */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                  {MAKES.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === MAKES.indexOf(make) ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
