"use client";
import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

// Use environment variable to construct full API URL
// In production, this will be the deployed backend URL
// In local, it will be http://localhost:5000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const DETECTION_API_URL = `${API_BASE_URL}/api/image-detection/detect`;

const categorySequence = [
  "exterior",
  "interior",
  "engine",
  "dashboard",
  "wheel",
  "keys",
  "documents",
];
const categoryOrder = {
  exterior: 0,
  interior: 1,
  engine: 2,
  dashboard: 3,
  wheel: 4,
  keys: 5,
  documents: 6,
};

const normalizeCategory = (raw) => {
  if (!raw) return "";
  const value = raw.toString().toLowerCase();
  if (value.includes("exterior")) return "exterior";
  if (value.includes("interior")) return "interior";
  if (value.includes("engine")) return "engine";
  if (value.includes("dash")) return "dashboard";
  if (value.includes("wheel")) return "wheel";
  if (value.includes("key")) return "keys";
  if (value.includes("document") || value.includes("doc")) return "documents";
  return value;
};

const capitalizeWord = (word) => {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
};

// Cache logic removed - images will be processed every time

export default function ImageCategorizationModal({
  isOpen,
  onClose,
  categorizedImages = [], // Changed from images - now receives pre-categorized data
  carId,
}) {
  const [currentCategory, setCurrentCategory] = useState("all");
  const [organizedImages, setOrganizedImages] = useState({});
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [showSlider, setShowSlider] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sliderImageRef = useRef(null);

  const ZOOM_STEPS = [1, 1.25, 1.5, 1.75, 2, 2.25];

  // Organize pre-categorized images by category - NO API CALLS!
  useEffect(() => {
    if (isOpen && categorizedImages.length > 0) {
      console.log("Organizing pre-categorized images:", categorizedImages.length);

      const organized = {
        all: categorizedImages,
        interior: categorizedImages.filter((img) => img.category === "interior"),
        exterior: categorizedImages.filter((img) => img.category === "exterior"),
        dashboard: categorizedImages.filter(
          (img) => img.category === "dashboard"
        ),
        wheel: categorizedImages.filter((img) => img.category === "wheel"),
        engine: categorizedImages.filter((img) => img.category === "engine"),
        documents: categorizedImages.filter(
          (img) => img.category === "documents"
        ),
        keys: categorizedImages.filter((img) => img.category === "keys"),
      };

      setOrganizedImages(organized);
      setCurrentCategory("all");
      setSliderImages([]);
      setSliderIndex(0);
      setShowSlider(false);
      setZoomLevel(1);

      console.log("Images organized by category:", {
        all: organized.all.length,
        interior: organized.interior.length,
        exterior: organized.exterior.length,
        dashboard: organized.dashboard.length,
        wheel: organized.wheel.length,
        engine: organized.engine.length,
        documents: organized.documents.length,
        keys: organized.keys.length,
      });
    }
  }, [isOpen, categorizedImages]);

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    setShowSlider(false);
  };

  const handleImageClick = (image, category) => {
    const categoryImages = categorizedImages[category] || [];
    const index = categoryImages.findIndex((img) => img.url === image.url);
    setSliderImages(categoryImages);
    setSliderIndex(index >= 0 ? index : 0);
    setShowSlider(true);
    setCurrentCategory(category);
  };

  const navigateSlider = (step) => {
    if (!sliderImages.length) return;

    const newIndex = sliderIndex + step;
    if (newIndex < 0) {
      // Go to previous category
      const currentIdx = categorySequence.indexOf(currentCategory);
      if (currentIdx > 0) {
        const prevCategory = categorySequence[currentIdx - 1];
        const prevImages = categorizedImages[prevCategory] || [];
        if (prevImages.length > 0) {
          setCurrentCategory(prevCategory);
          setSliderImages(prevImages);
          setSliderIndex(prevImages.length - 1);
          setZoomLevel(1); // Reset zoom when changing category
          return;
        }
      }
      setSliderIndex(0);
    } else if (newIndex >= sliderImages.length) {
      // Go to next category
      const currentIdx = categorySequence.indexOf(currentCategory);
      if (currentIdx < categorySequence.length - 1) {
        const nextCategory = categorySequence[currentIdx + 1];
        const nextImages = categorizedImages[nextCategory] || [];
        if (nextImages.length > 0) {
          setCurrentCategory(nextCategory);
          setSliderImages(nextImages);
          setSliderIndex(0);
          setZoomLevel(1); // Reset zoom when changing category
          return;
        }
      }
      setSliderIndex(sliderImages.length - 1);
    } else {
      setSliderIndex(newIndex);
    }
  };

  const handleZoom = () => {
    if (!showSlider) return;
    const currentIndex = ZOOM_STEPS.findIndex(
      (step) => Math.abs(step - zoomLevel) < 0.05
    );
    const nextIndex = (currentIndex + 1) % ZOOM_STEPS.length;
    setZoomLevel(ZOOM_STEPS[nextIndex]);
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
  };

  const handleClose = () => {
    setShowSlider(false);
    setZoomLevel(1);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (showSlider) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          navigateSlider(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          navigateSlider(1);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, showSlider]);

  if (!isOpen) return null;

  const categories = [
    "all",
    "interior",
    "exterior",
    "dashboard",
    "wheel",
    "engine",
    "documents",
    "keys",
  ];

  // Get images for current category
  const currentImages = organizedImages[currentCategory] || [];

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      {/* Navigation Bar */}
      <div className="w-full sticky top-0 left-0 z-[110] bg-black shadow-lg">
        <div className="max-w-[1600px] mx-auto px-5 md:px-20 py-3.5 flex justify-between items-center gap-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`text-sm font-medium pb-1.5 relative transition-colors ${currentCategory === cat
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                {capitalizeWord(cat)}
                {currentCategory === cat && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white flex items-center justify-center hover:opacity-70 transition-opacity p-2"
            title="Menu"
          >
            {isMobileMenuOpen ? (
              <span className="text-2xl">×</span>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* Action Buttons */}
          <div className="flex gap-4 items-center ml-auto">
            {showSlider && (
              <>
                <button
                  onClick={handleZoom}
                  className="text-white flex items-center justify-center hover:opacity-70 transition-opacity text-xl p-2"
                  title="Zoom"
                >
                  +
                </button>
                <button
                  onClick={handleFullscreen}
                  className="text-white flex items-center justify-center hover:opacity-70 transition-opacity text-xl p-2"
                  title="Full Screen"
                >
                  ⛶
                </button>
              </>
            )}
            <button
              onClick={handleClose}
              className="text-white flex items-center justify-center hover:opacity-70 transition-opacity text-2xl p-2"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-black">
            <div className="px-5 py-4 space-y-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    handleCategoryClick(cat);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentCategory === cat
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                    }`}
                >
                  {capitalizeWord(cat)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-5 md:px-20 py-5">
        {/* Gallery View */}
        {!showSlider && (
          <>
            <div className="mb-5 text-right text-gray-400 text-sm">
              {currentCategory === "all"
                ? `Total photos: ${currentImages.length}`
                : `${capitalizeWord(currentCategory)}: ${currentImages.length
                } photo${currentImages.length === 1 ? "" : "s"}`}
            </div>

            {currentImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {currentImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(image, currentCategory)}
                    className="bg-gray-900 rounded-none overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-lg aspect-[1.2]"
                  >
                    <img
                      src={image.url}
                      alt={image.detected_label || "Car image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-16 text-center border border-gray-700">
                <div className="text-6xl mb-5 opacity-30">📷</div>
                <div className="text-xl text-gray-400">
                  No photos found in this category
                </div>
              </div>
            )}
          </>
        )}

        {/* Slider View */}
        {showSlider && sliderImages.length > 0 && (
          <>
            <div className="flex items-center justify-center gap-10 my-10 relative">
              <button
                onClick={() => navigateSlider(-1)}
                className="text-white text-4xl flex items-center justify-center hover:opacity-70 transition-opacity fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[105] disabled:opacity-30 disabled:cursor-not-allowed md:bg-transparent bg-black rounded-full w-12 h-12 md:w-auto md:h-auto md:p-2"
                disabled={
                  sliderIndex === 0 &&
                  categorySequence.indexOf(currentCategory) === 0
                }
              >
                ‹
              </button>

              <div className="flex items-center justify-center max-w-full relative">
                <img
                  ref={sliderImageRef}
                  src={sliderImages[sliderIndex]?.url}
                  alt={
                    sliderImages[sliderIndex]?.detected_label || "Gallery image"
                  }
                  className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-gray-900"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "center center",
                  }}
                />
                {/* Mobile navigation buttons centered on image */}
                <button
                  onClick={() => navigateSlider(-1)}
                  className="md:hidden absolute left-1/2 top-1/2 -translate-x-16 -translate-y-1/2 text-white text-3xl flex items-center justify-center bg-black rounded-full w-12 h-12 z-[106] disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={
                    sliderIndex === 0 &&
                    categorySequence.indexOf(currentCategory) === 0
                  }
                >
                  ‹
                </button>
                <button
                  onClick={() => navigateSlider(1)}
                  className="md:hidden absolute left-1/2 top-1/2 translate-x-16 -translate-y-1/2 text-white text-3xl flex items-center justify-center bg-black rounded-full w-12 h-12 z-[106] disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={
                    sliderIndex === sliderImages.length - 1 &&
                    categorySequence.indexOf(currentCategory) ===
                    categorySequence.length - 1
                  }
                >
                  ›
                </button>
                <div className="absolute -top-9 right-0 text-gray-400 text-sm">
                  {sliderIndex + 1} of {sliderImages.length}
                </div>
              </div>

              <button
                onClick={() => navigateSlider(1)}
                className="text-white text-4xl flex items-center justify-center hover:opacity-70 transition-opacity fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[105] disabled:opacity-30 disabled:cursor-not-allowed md:bg-transparent bg-black rounded-full w-12 h-12 md:w-auto md:h-auto md:p-2 hidden md:flex"
                disabled={
                  sliderIndex === sliderImages.length - 1 &&
                  categorySequence.indexOf(currentCategory) ===
                  categorySequence.length - 1
                }
              >
                ›
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
