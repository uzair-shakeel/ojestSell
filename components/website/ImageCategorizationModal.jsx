"use client";
import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

// Use Next.js API route to proxy requests and handle CORS
const API_BASE_URL = "/api/detect-image";

const categorySequence = ["exterior", "interior", "engine", "dashboard", "wheel", "keys", "documents"];
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

// Helper function to create a hash from images array
const createImagesHash = (images) => {
  if (!images || images.length === 0) return "";
  return images.join("|");
};

// Helper function to get cache key
const getCacheKey = (carId) => {
  return `car_categorization_${carId}`;
};

// Helper function to load cached data
const loadCachedData = (carId, imagesHash) => {
  if (typeof window === "undefined") return null;

  try {
    const cacheKey = getCacheKey(carId);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    // Check if images hash matches (images haven't changed)
    if (parsed.imagesHash === imagesHash && parsed.results) {
      return parsed.results;
    }
    // Images have changed, clear old cache
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error("Error loading cached data:", error);
    return null;
  }
};

// Helper function to save cached data
const saveCachedData = (carId, imagesHash, results) => {
  if (typeof window === "undefined") return;

  try {
    const cacheKey = getCacheKey(carId);
    const data = {
      imagesHash,
      results,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving cached data:", error);
    // If storage is full, try to clear old entries
    try {
      const keys = Object.keys(localStorage);
      const oldCaches = keys.filter((k) => k.startsWith("car_categorization_"));
      if (oldCaches.length > 50) {
        // Remove oldest 10 entries
        const sorted = oldCaches
          .map((k) => ({
            key: k,
            timestamp: JSON.parse(localStorage.getItem(k) || '{"timestamp":0}').timestamp || 0,
          }))
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, 10);
        sorted.forEach(({ key }) => localStorage.removeItem(key));
        // Try saving again
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (e) {
      console.error("Error clearing old cache:", e);
    }
  }
};

export default function ImageCategorizationModal({ isOpen, onClose, images = [], carId }) {
  const [currentCategory, setCurrentCategory] = useState("all");
  const [categorizedImages, setCategorizedImages] = useState({});
  const [processingQueue, setProcessingQueue] = useState([]);
  const [processingStatus, setProcessingStatus] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [showSlider, setShowSlider] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sliderImageRef = useRef(null);

  const ZOOM_STEPS = [1, 1.25, 1.5, 1.75, 2, 2.25];

  // Initialize categories and check cache
  useEffect(() => {
    if (isOpen && images.length > 0 && carId) {
      const initialCategories = {
        all: [],
        interior: [],
        exterior: [],
        dashboard: [],
        wheel: [],
        engine: [],
        documents: [],
        keys: [],
      };

      setCurrentCategory("all");
      setSliderImages([]);
      setSliderIndex(0);
      setShowSlider(false);
      setZoomLevel(1);

      // Create hash of current images
      const imagesHash = createImagesHash(images);

      // Check for cached data
      const cachedResults = loadCachedData(carId, imagesHash);

      if (cachedResults) {
        // Use cached results
        setCategorizedImages(cachedResults);
        setIsProcessing(false);
      } else {
        // No cache found, need to process
        setCategorizedImages(initialCategories);
        processImagesQueue(imagesHash);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, carId]);

  // Process images through detection API in queue
  const processImagesQueue = async (imagesHash) => {
    if (images.length === 0 || !carId) return;

    setIsProcessing(true);
    const queue = images.map((img, index) => ({ url: img, index }));
    setProcessingQueue(queue);

    const results = {
      all: [],
      interior: [],
      exterior: [],
      dashboard: [],
      wheel: [],
      engine: [],
      documents: [],
      keys: [],
    };

    // Process images one by one
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      setProcessingStatus({ current: i + 1, total: queue.length, imageIndex: i });

      try {
        // Create FormData with image URL
        // Our Next.js API route will handle fetching and converting to blob
        const formData = new FormData();
        formData.append("image_url", item.url);

        // Call our Next.js API route which proxies to the detection API
        const detectResponse = await fetch(API_BASE_URL, {
          method: "POST",
          body: formData,
        });

        if (!detectResponse.ok) {
          const errorText = await detectResponse.text();
          console.error(`API Error for image ${i}:`, {
            status: detectResponse.status,
            statusText: detectResponse.statusText,
            error: errorText,
            url: item.url,
          });
          throw new Error(`HTTP error! status: ${detectResponse.status} - ${errorText}`);
        }

        let detectData;
        try {
          detectData = await detectResponse.json();
        } catch (jsonError) {
          const textResponse = await detectResponse.text();
          console.error(`Failed to parse JSON response for image ${i + 1}:`, {
            error: jsonError,
            responseText: textResponse,
          });
          throw new Error(`Invalid JSON response: ${textResponse.substring(0, 100)}`);
        }
        
        // Log the response for debugging
        console.log(`Image ${i + 1} detection response:`, {
          success: detectData.success,
          category: detectData.category,
          detected_label: detectData.detected_label,
          confidence: detectData.confidence,
          fullResponse: detectData,
        });

        // Check if response is successful (handle different response formats)
        const isSuccess = detectData.success !== false && (detectData.success || detectData.category || detectData.detected_label);
        
        if (isSuccess) {
          const category = normalizeCategory(detectData.category || detectData.detected_label);
          console.log(`Image ${i + 1} normalized category:`, category);
          
          const imageData = {
            url: item.url,
            category: category,
            detected_label: detectData.detected_label,
            confidence: detectData.confidence,
            index: item.index,
          };

          // Add to all
          results.all.push(imageData);
          console.log(`Added image ${i + 1} to 'all' category`);

          // Add to specific category
          if (results[category]) {
            results[category].push(imageData);
            console.log(`Added image ${i + 1} to '${category}' category`);
          } else {
            // If category doesn't exist, add to 'all' only
            console.warn(`Unknown category: ${category} for image ${i + 1}. Available categories:`, Object.keys(results));
          }
        } else {
          console.warn(`Detection failed for image ${i + 1}:`, detectData);
          // Add to 'all' even if detection fails
          results.all.push({
            url: item.url,
            category: "unknown",
            detected_label: detectData.detected_label || "Unknown",
            confidence: detectData.confidence || 0,
            index: item.index,
          });
        }
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, {
          error: error.message,
          stack: error.stack,
          url: item.url,
        });
        // Add to 'all' even if detection fails
        results.all.push({
          url: item.url,
          category: "unknown",
          detected_label: "Unknown",
          confidence: 0,
          index: item.index,
        });
      }
    }

    // Sort images by category order
    Object.keys(results).forEach((key) => {
      results[key] = results[key].sort((a, b) => {
        const orderA = categoryOrder[normalizeCategory(a.category)] ?? 999;
        const orderB = categoryOrder[normalizeCategory(b.category)] ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return b.index - a.index;
      });
    });

    // Log final results for debugging
    console.log("Final categorized results:", {
      totalImages: results.all.length,
      byCategory: Object.keys(results).reduce((acc, key) => {
        acc[key] = results[key].length;
        return acc;
      }, {}),
      results: results,
    });

    setCategorizedImages(results);
    setProcessingQueue([]);
    setProcessingStatus({});
    setIsProcessing(false);

    // Save results to cache
    if (imagesHash && carId) {
      saveCachedData(carId, imagesHash, results);
    }
  };

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
    const currentIndex = ZOOM_STEPS.findIndex((step) => Math.abs(step - zoomLevel) < 0.05);
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

  const currentImages = categorizedImages[currentCategory] || [];
  const categories = ["all", "interior", "exterior", "dashboard", "wheel", "engine", "documents", "keys"];

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
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentCategory === cat
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
        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-5 text-center text-white">
            <div className="inline-block w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin mb-2"></div>
            <p className="text-sm">
              Processing image {processingStatus.current} of {processingStatus.total}...
            </p>
          </div>
        )}

        {/* Gallery View */}
        {!showSlider && (
          <>
            <div className="mb-5 text-right text-gray-400 text-sm">
              {currentCategory === "all"
                ? `Total photos: ${currentImages.length}`
                : `${capitalizeWord(currentCategory)}: ${currentImages.length} photo${currentImages.length === 1 ? "" : "s"}`}
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
                disabled={sliderIndex === 0 && categorySequence.indexOf(currentCategory) === 0}
              >
                ‹
              </button>

              <div className="flex items-center justify-center max-w-full relative">
                <img
                  ref={sliderImageRef}
                  src={sliderImages[sliderIndex]?.url}
                  alt={sliderImages[sliderIndex]?.detected_label || "Gallery image"}
                  className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-gray-900"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                />
                {/* Mobile navigation buttons centered on image */}
                <button
                  onClick={() => navigateSlider(-1)}
                  className="md:hidden absolute left-1/2 top-1/2 -translate-x-16 -translate-y-1/2 text-white text-3xl flex items-center justify-center bg-black rounded-full w-12 h-12 z-[106] disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={sliderIndex === 0 && categorySequence.indexOf(currentCategory) === 0}
                >
                  ‹
                </button>
                <button
                  onClick={() => navigateSlider(1)}
                  className="md:hidden absolute left-1/2 top-1/2 translate-x-16 -translate-y-1/2 text-white text-3xl flex items-center justify-center bg-black rounded-full w-12 h-12 z-[106] disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={
                    sliderIndex === sliderImages.length - 1 &&
                    categorySequence.indexOf(currentCategory) === categorySequence.length - 1
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
                  categorySequence.indexOf(currentCategory) === categorySequence.length - 1
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

