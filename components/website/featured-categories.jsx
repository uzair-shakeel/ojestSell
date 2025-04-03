"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const CATEGORIES = [
  {
    id: 1,
    title: "LUXURY CARS",
    image:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop",
    description: "Experience ultimate comfort and style",
  },
  {
    id: 2,
    title: "SPORTS CARS",
    image:
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=2564&auto=format&fit=crop",
    description: "Feel the thrill of performance",
  },
  {
    id: 3,
    title: "CLASSIC CARS",
    image:
      "https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?q=80&w=2942&auto=format&fit=crop",
    description: "Timeless elegance on wheels",
  },
];

const LOGOS = [
  { src: "/BMW.png", alt: "BMW" },
  { src: "/Mercedes.png", alt: "Mercedes" },
  { src: "/porsche.webp", alt: "Porsche" },
  { src: "/tesla.png", alt: "Tesla" },
  { src: "/ford.png", alt: "Ford" },
  { src: "/honda.png", alt: "Honda" },
  { src: "/toyota.png", alt: "Toyota" },
  { src: "/lexus.png", alt: "Lexus" },
  { src: "/acura.png", alt: "Acura" },
  { src: "/chevrolet.png", alt: "Chevrolet" },
];

export function FeaturedCategories() {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const textElement = textRef.current?.querySelector(".scroll-text");
    if (textElement) {
      gsap.to(textElement, {
        x: "-50%",
        duration: 30,
        ease: "none",
        repeat: -1,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section className="py-16 bg-black" ref={containerRef}>
      {/* Scrolling Logo Banner */}
      <div className="relative overflow-hidden mb-16" ref={textRef}>
        {/* Commented out logos since they may not exist in the new project
        <div className="scroll-text flex items-center gap-16 min-w-max">
          {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, index) => (
            <div
              key={index}
              className="inline-block w-[120px] h-[60px] relative opacity-100"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="120px"
                priority={index < 5}
                className="object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
          ))}
        </div>
        */}
      </div>

      {/* Featured Categories Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.title.toLowerCase()}`}
              className="group relative aspect-[4/3] overflow-hidden"
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 transition-opacity duration-700 group-hover:opacity-60" />

              {/* Border Frame */}
              <div className="absolute inset-4 border-2 border-white/50 transition-all duration-700 group-hover:inset-6" />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                <div className="transform translate-y-8 transition-transform duration-700 group-hover:translate-y-0">
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-white/80 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                    {category.description}
                  </p>
                </div>

                <div className="transform translate-y-8 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="inline-block border-b-2 border-white pb-1">
                    Explore More
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
