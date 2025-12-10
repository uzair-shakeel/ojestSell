"use client";
import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";


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
  if (!raw) return "exterior";
  const lower = raw.toLowerCase().trim();
  if (lower.includes("front") || lower.includes("back") || lower.includes("side") || lower.includes("exterior")) return "exterior";
  if (lower.includes("seat") || lower.includes("steering") || lower.includes("interior")) return "interior";
  if (lower.includes("dashboard") || lower.includes("console") || lower.includes("odometer") || lower.includes("instrument")) return "dashboard";
  if (lower.includes("wheel") || lower.includes("tire") || lower.includes("rim")) return "wheel";
  if (lower.includes("engine") || lower.includes("hood") || lower.includes("under")) return "engine";
  if (lower.includes("key")) return "keys";
  if (lower.includes("document") || lower.includes("paper") || lower.includes("vin")) return "documents";
  return "exterior"; // Default
};

const capitalizeWord = (word) => {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
};


export default function ImageCategorizationModal({
  isOpen,
  onClose,
  images = [],
  carId,
  clickedImageUrl = null, // Optional: URL of the image that was clicked
  categorizedImages = [], // Categorized images from database
}) {
  const [organizedImages, setOrganizedImages] = useState({
    all: [],
    interior: [],
    exterior: [],
    dashboard: [],
    wheel: [],
    engine: [],
    documents: [],
    keys: [],
  });
  const [currentCategory, setCurrentCategory] = useState("all");
  const [showSlider, setShowSlider] = useState(false);
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({});

  // Swiper Ref
  const swiperRef = useRef(null);

  // Process images using existing categorizedImages data from database
  const processImagesFromDatabase = (categorizedImagesData) => {
    if (!categorizedImagesData || categorizedImagesData.length === 0) {
      // If no categorized data exists, create default structure with all images as exterior
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

      images.forEach((img, index) => {
        const imageData = {
          url: img,
          category: "exterior",
          detected_label: "Unknown",
          confidence: 0,
          index: index,
        };
        results.all.push(imageData);
        results.exterior.push(imageData);
      });

      return results;
    }

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

    // Process categorized images from database
    categorizedImagesData.forEach((imgData) => {
      const category = normalizeCategory(imgData.category || "exterior");

      const imageData = {
        url: imgData.url,
        category: category,
        detected_label: imgData.detected_label || "Unknown",
        confidence: imgData.confidence || 0,
        index: imgData.index !== undefined ? imgData.index : 0,
      };

      // Add to all
      results.all.push(imageData);

      // Add to specific category
      if (results[category]) {
        results[category].push(imageData);
      }
    });

    // Sort images by category order
    Object.keys(results).forEach((key) => {
      results[key] = results[key].sort((a, b) => {
        const orderA = categoryOrder[normalizeCategory(a.category)] ?? 999;
        const orderB = categoryOrder[normalizeCategory(b.category)] ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return b.index - a.index;
      });
    });

    console.log("Loaded categorized images from database:", {
      totalImages: results.all.length,
      byCategory: Object.keys(results).reduce((acc, key) => {
        acc[key] = results[key].length;
        return acc;
      }, {}),
    });

    return results;
  };

  // Handle clicked image after organizedImages is updated
  useEffect(() => {
    if (clickedImageUrl && organizedImages.all.length > 0 && !isProcessing) {
      const clickedImage = organizedImages.all.find(img => img.url === clickedImageUrl);
      if (clickedImage && !showSlider) {
        const category = clickedImage.category || "all";
        const categoryImages = organizedImages[category] || [];
        const index = categoryImages.findIndex(img => img.url === clickedImageUrl);

        if (index >= 0 && categoryImages.length > 0) {
          setCurrentCategory(category);
          setSliderImages(categoryImages);
          setSliderIndex(index);
          setShowSlider(true);
        } else {
          // If not found in category, show in "all"
          const allIndex = organizedImages.all.findIndex(img => img.url === clickedImageUrl);
          if (allIndex >= 0) {
            setCurrentCategory("all");
            setSliderImages(organizedImages.all);
            setSliderIndex(allIndex);
            setShowSlider(true);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizedImages.all.length, clickedImageUrl, isProcessing]);

  // Initialize using categorizedImages from database
  useEffect(() => {
    if (isOpen && images.length > 0) {
      setCurrentCategory("all");
      setSliderImages([]);
      setSliderIndex(0);
      setShowSlider(false);
      setZoomLevel(1);
      setIsProcessing(false);

      // Process images from database categorizedImages
      const results = processImagesFromDatabase(categorizedImages);
      setOrganizedImages(results);

      // If a specific image was clicked, find its category and show it in slider
      if (clickedImageUrl) {
        const clickedImage = results.all.find(img => img.url === clickedImageUrl);
        if (clickedImage) {
          const category = clickedImage.category || "all";
          const categoryImages = results[category] || [];
          const index = categoryImages.findIndex(img => img.url === clickedImageUrl);

          if (index >= 0 && categoryImages.length > 0) {
            setCurrentCategory(category);
            setSliderImages(categoryImages);
            setSliderIndex(index);
            setShowSlider(true);
          } else {
            // If not found in category, show in "all"
            const allIndex = results.all.findIndex(img => img.url === clickedImageUrl);
            if (allIndex >= 0) {
              setCurrentCategory("all");
              setSliderImages(results.all);
              setSliderIndex(allIndex);
              setShowSlider(true);
            } else {
              setCurrentCategory(category);
            }
          }
        }
      }
    } else if (!isOpen) {
      // Reset processing state when modal closes
      setIsProcessing(false);
      setProcessingStatus({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, images.length, clickedImageUrl, categorizedImages]);

  // FIX: Lock body scroll when modal is open to prevent background scrolling/shifting
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // To prevent content from jumping when scrollbar is removed, 
      // you might also need to set document.body.style.paddingRight 
      // equal to the scrollbar width, but for simplicity, we'll rely on overflow: hidden.
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup function to ensure scroll is restored if the component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Sync Swiper slide when sliderIndex changes (e.g. from category jump)
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      // If the difference is significant (like a category jump), swipe to it
      if (swiperRef.current.swiper.activeIndex !== sliderIndex) {
        swiperRef.current.swiper.slideTo(sliderIndex, 0);
      }
    }
  }, [sliderIndex]);

  const handleCategoryClick = (category) => {
    const categoryImages = organizedImages[category] || [];
    setCurrentCategory(category);

    if (category === "all") {
      // For "all" category, show gallery view
      setShowSlider(false);
    } else if (categoryImages.length > 0) {
      // For other categories, open first image in slider view
      setSliderImages(categoryImages);
      setSliderIndex(0);
      setShowSlider(true);
    } else {
      // If no images, just show the category (empty gallery)
      setShowSlider(false);
    }
  };

  const handleImageClick = (image, category) => {
    // If clicking from "all" category, find which category the image actually belongs to
    let targetCategory = category;
    let categoryImages = organizedImages[category] || [];

    if (category === "all") {
      // Find the actual category of this image
      const imageCategory = image.category || "exterior";
      targetCategory = imageCategory;
      categoryImages = organizedImages[imageCategory] || [];
    }

    const index = categoryImages.findIndex((img) => img.url === image.url);
    setCurrentCategory(targetCategory);
    setSliderImages(categoryImages);
    setSliderIndex(index >= 0 ? index : 0);
    setShowSlider(true);
  };

  const navigateSlider = (step) => {
    if (!sliderImages.length) return;

    const newIndex = sliderIndex + step;

    // Special handling for "all" category - just loop within the list
    if (currentCategory === "all") {
      if (newIndex < 0) {
        setSliderIndex(sliderImages.length - 1);
      } else if (newIndex >= sliderImages.length) {
        setSliderIndex(0);
      } else {
        setSliderIndex(newIndex);
      }
      return;
    }

    if (newIndex < 0) {
      // Go to previous category
      const currentIdx = categorySequence.indexOf(currentCategory);
      if (currentIdx > 0) {
        const prevCategory = categorySequence[currentIdx - 1];
        const prevImages = organizedImages[prevCategory] || [];
        if (prevImages.length > 0) {
          setCurrentCategory(prevCategory);
          setSliderImages(prevImages);
          setSliderIndex(prevImages.length - 1);
          setZoomLevel(1); // Reset zoom when changing category
          return;
        }
      }
      setSliderIndex(sliderImages.length - 1);
    } else if (newIndex >= sliderImages.length) {
      // Go to next category
      const currentIdx = categorySequence.indexOf(currentCategory);
      if (currentIdx < categorySequence.length - 1) {
        const nextCategory = categorySequence[currentIdx + 1];
        const nextImages = organizedImages[nextCategory] || [];
        if (nextImages.length > 0) {
          setCurrentCategory(nextCategory);
          setSliderImages(nextImages);
          setSliderIndex(0);
          setZoomLevel(1); // Reset zoom when changing category
          return;
        }
      }
      setSliderIndex(0);
    } else {
      setSliderIndex(newIndex);
    }
  };

  // Handlers for Swiper navigation buttons to support Category jumping
  const handleSwiperNext = () => {
    if (!swiperRef.current || !swiperRef.current.swiper) return;
    if (swiperRef.current.swiper.isEnd) {
      navigateSlider(1);
    } else {
      swiperRef.current.swiper.slideNext();
    }
  };

  const handleSwiperPrev = () => {
    if (!swiperRef.current || !swiperRef.current.swiper) return;
    if (swiperRef.current.swiper.isBeginning) {
      navigateSlider(-1);
    } else {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleZoom = () => {
    if (!showSlider) return;
    if (swiperRef.current && swiperRef.current.swiper) {
      const swiper = swiperRef.current.swiper;
      const currentScale = swiper.zoom.scale;


      if (currentScale < 1.5) {
        swiper.zoom.in(2);
      }
      else if (currentScale < 2.5) {
        swiper.zoom.in(3);
      }
      else {
        swiper.zoom.out();
      }
    }
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
          handleSwiperPrev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleSwiperNext();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, showSlider, sliderIndex, currentCategory, sliderImages]);

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
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto overflow-x-hidden h-screen w-screen">
      <style dangerouslySetInnerHTML={{
        __html: `
        /* FIX 2: CSS for category scrollbar hiding */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* FIX 4: Custom Swiper Styles */
        .modal-swiper {
            width: 100%;
            height: 100%;
        }
        .modal-swiper .swiper-slide {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100% !important; /* Added !important */
        }
        .swiper-zoom-container > img {
            max-height: 85vh !important; /* Adjusted from 80vh */
            width: auto !important; /* Changed from max-width: 100% */
            object-fit: contain;
        }
      `}} />

      {/* Navigation Bar */}
      <div className="w-full sticky top-0 left-0 z-[110] bg-black shadow-lg">
        <div className="max-w-[1600px] mx-auto px-0 md:px-20 py-3.5 flex justify-between items-center gap-0 md:gap-6">
          {/* Navigation - Inline scrollable on both mobile and desktop */}
          {/* FIX 2: Replaced category scroll class names */}
          <div
            className="flex gap-4 overflow-x-auto whitespace-nowrap flex-1 scrollbar-hide px-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`text-base md:text-sm font-medium pb-1.5 relative transition-colors whitespace-nowrap flex-shrink-0 ${currentCategory === cat
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
                  }`}
                style={{ paddingTop: '1px' }}
              >
                {capitalizeWord(cat)}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 md:gap-4 items-center ml-auto flex-shrink-0 pr-4 md:pr-0">
            {showSlider && (
              <div className="hidden md:flex gap-4">
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
              </div>
            )}
            <button
              onClick={handleClose}
              className="text-white flex items-center justify-center hover:opacity-70 transition-opacity text-2xl p-2"
              style={{ marginTop: '-8px' }}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-0 md:px-20 py-5">
        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-5 text-center text-white">
            <div className="inline-block w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin mb-2"></div>
            <p className="text-sm">
              Processing image {processingStatus.current} of {processingStatus.total}...
            </p>
          </div>
        )}

        {/* Gallery Grid View */}
        {!showSlider && (
          <>
            <div className="flex justify-end mb-4 px-2">
              <span className="text-gray-400 text-sm bg-gray-900/50 px-3 py-1 rounded-full">
                {currentCategory === "all"
                  ? `Total: ${currentImages.length}`
                  : `${capitalizeWord(currentCategory)}: ${currentImages.length}`}
              </span>
            </div>

            {currentImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 p-3">
                {currentImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(image, currentCategory)}
                    className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg aspect-[3/2] relative group"
                  >
                    <img
                      src={image.url}
                      alt={image.detected_label || "Car image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-16 text-center border border-gray-800 m-3 my-auto">
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
            {/* FIX 3: Replaced container with correct height and overflow properties */}
            <div className="flex items-center justify-center my-1 relative h-[85vh] w-full overflow-hidden">
              <div className="flex items-center justify-center relative w-full h-full">
                {/* Swiper Implementation */}
                <Swiper
                  ref={swiperRef}
                  modules={[Zoom, Navigation]}
                  zoom={{ maxRatio: 3, toggle: true }} // Double tap to zoom
                  spaceBetween={10}
                  slidesPerView={1}
                  grabCursor={true}
                  initialSlide={sliderIndex}
                  onSlideChange={(swiper) => setSliderIndex(swiper.activeIndex)}
                  className="modal-swiper !h-full !w-full"
                  loop={true}
                >
                  {sliderImages.map((img, index) => (
                    <SwiperSlide key={`${img.url}-${index}`}>
                      <div className="swiper-zoom-container">
                        <img
                          src={img.url}
                          alt={img.detected_label || "Gallery image"}
                          className="rounded-none md:rounded-2xl shadow-2xl bg-gray-900"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="fixed bottom-4 right-4 text-white text-lg md:text-base font-medium z-[110] bg-black bg-opacity-70 px-3 py-2 rounded">
                  {sliderIndex + 1} of {sliderImages.length}
                </div>
              </div>

              {sliderImages.length > 1 && (
                <>
                  <button
                    onClick={handleSwiperPrev}
                    className="flex text-white text-3xl md:text-4xl items-center justify-center hover:opacity-70 transition-opacity fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[105] disabled:opacity-30 disabled:cursor-not-allowed p-4"
                    disabled={
                      currentCategory !== "all" &&
                      sliderIndex === 0 &&
                      categorySequence.indexOf(currentCategory) === 0
                    }
                  >
                    ‹
                  </button>

                  <button
                    onClick={handleSwiperNext}
                    className="flex text-white text-3xl md:text-4xl items-center justify-center hover:opacity-70 transition-opacity fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[105] disabled:opacity-30 disabled:cursor-not-allowed p-4"
                    disabled={
                      currentCategory !== "all" &&
                      sliderIndex === sliderImages.length - 1 &&
                      categorySequence.indexOf(currentCategory) ===
                      categorySequence.length - 1
                    }
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}