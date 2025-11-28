"use client";
import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation, Pagination } from "swiper/modules";
import "swiper/css";

// Use Next.js API route to proxy requests and handle CORS
const API_BASE_URL = "/api/detect-image";

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

// Normalize URL for comparison (remove protocol differences, trailing slashes, etc.)
const normalizeUrl = (url) => {
  if (!url) return "";
  // Convert to string and trim
  let normalized = String(url).trim();
  // Remove protocol (http:// or https://)
  normalized = normalized.replace(/^https?:\/\//i, "");
  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, "");
  // Remove query parameters and fragments for comparison
  normalized = normalized.split("?")[0].split("#")[0];
  return normalized.toLowerCase();
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

const ZOOM_STEPS = [1, 1.5, 2, 2.5, 3];

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
  }
};

export default function ImageCategorizationModal({
  isOpen,
  onClose,
  images = [],
  carId,
  clickedImageUrl = null, // Optional: URL of the image that was clicked
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
  const sliderImageRef = useRef(null);
  const swiperRef = useRef(null);
  const isManualCategoryChange = useRef(false);

  // Process images through detection API in queue
  const processImagesQueue = async () => {
    if (images.length === 0 || !carId) return;

    setIsProcessing(true);
    const queue = images.map((img, index) => ({ url: img, index }));
    setProcessingStatus({ current: 0, total: queue.length });

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

      console.log(`Processing image ${i + 1}/${queue.length} (index: ${item.index}):`, item.url.substring(0, 80));

      let imageAdded = false;
      try {
        // Create FormData with image URL
        const formData = new FormData();
        formData.append("image_url", item.url);

        // Call our Next.js API route which proxies to the detection API
        const detectResponse = await fetch(API_BASE_URL, {
          method: "POST",
          body: formData,
        });

        if (!detectResponse.ok) {
          const errorText = await detectResponse.text();
          console.error(`API Error for image ${i + 1} (index ${item.index}):`, {
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
          console.error(`Failed to parse JSON response for image ${i + 1} (index ${item.index}):`, {
            error: jsonError,
            responseText: textResponse,
          });
          throw new Error(`Invalid JSON response: ${textResponse.substring(0, 100)}`);
        }
        
        console.log(`Image ${i + 1} (index ${item.index}) detection response:`, {
          success: detectData.success,
          category: detectData.category,
          detected_label: detectData.detected_label,
          confidence: detectData.confidence,
        });

        // Check if response is successful
        const isSuccess = detectData.success !== false && (detectData.success || detectData.category || detectData.detected_label);
        
        if (isSuccess) {
          const category = normalizeCategory(detectData.category || detectData.detected_label);
          console.log(`Image ${i + 1} (index ${item.index}) normalized category:`, category);
          
          const imageData = {
            url: item.url,
            category: category,
            detected_label: detectData.detected_label,
            confidence: detectData.confidence,
            index: item.index,
          };

          // Check if this index already exists in results.all (shouldn't happen, but just in case)
          const existingIndex = results.all.findIndex(img => img.index === item.index);
          if (existingIndex >= 0) {
            console.warn(`Image ${i + 1} (index ${item.index}) already exists in results.all at position ${existingIndex}, replacing it`);
            results.all[existingIndex] = imageData;
          } else {
            // Add to all
            results.all.push(imageData);
          }
          imageAdded = true;
          console.log(`Image ${i + 1} (index ${item.index}) added to results.all. Total in all: ${results.all.length}`);

          // Add to specific category
          if (results[category]) {
            results[category].push(imageData);
            console.log(`Image ${i + 1} (index ${item.index}) added to category: ${category}`);
          } else {
            console.warn(`Category ${category} not found in results, image only added to 'all'`);
          }
        } else {
          console.warn(`Detection failed for image ${i + 1} (index ${item.index}):`, detectData);
          // Add to 'all' and 'exterior' even if detection fails
          const fallbackImage = {
            url: item.url,
            category: "exterior",
            detected_label: detectData.detected_label || "Unknown",
            confidence: detectData.confidence || 0,
            index: item.index,
          };
          // Check if this index already exists in results.all
          const existingIndex = results.all.findIndex(img => img.index === item.index);
          if (existingIndex >= 0) {
            console.warn(`Image ${i + 1} (index ${item.index}) already exists in results.all at position ${existingIndex}, replacing it`);
            results.all[existingIndex] = fallbackImage;
          } else {
            results.all.push(fallbackImage);
          }
          results.exterior.push(fallbackImage);
          imageAdded = true;
          console.log(`Image ${i + 1} (index ${item.index}) added as fallback. Total in all: ${results.all.length}`);
        }
      } catch (error) {
        console.error(`Error processing image ${i + 1} (index ${item.index}):`, {
          error: error.message,
          url: item.url,
        });
        // Add to 'all' and 'exterior' even if detection fails
        const fallbackImage = {
          url: item.url,
          category: "exterior",
          detected_label: "Unknown",
          confidence: 0,
          index: item.index,
        };
        // Check if this index already exists in results.all
        const existingIndex = results.all.findIndex(img => img.index === item.index);
        if (existingIndex >= 0) {
          console.warn(`Image ${i + 1} (index ${item.index}) already exists in results.all at position ${existingIndex}, replacing it`);
          results.all[existingIndex] = fallbackImage;
        } else {
          results.all.push(fallbackImage);
        }
        results.exterior.push(fallbackImage);
        imageAdded = true;
        console.log(`Image ${i + 1} (index ${item.index}) added after error. Total in all: ${results.all.length}`);
      }
      
      if (!imageAdded) {
        console.error(`CRITICAL: Image ${i + 1} (index ${item.index}) was NOT added to results!`);
        // Force add it
        const forceImage = {
          url: item.url,
          category: "exterior",
          detected_label: "Unknown",
          confidence: 0,
          index: item.index,
        };
        // Check if this index already exists in results.all
        const existingIndex = results.all.findIndex(img => img.index === item.index);
        if (existingIndex >= 0) {
          console.warn(`Image ${i + 1} (index ${item.index}) already exists in results.all at position ${existingIndex}, replacing it`);
          results.all[existingIndex] = forceImage;
        } else {
          results.all.push(forceImage);
        }
        results.exterior.push(forceImage);
        console.log(`Image ${i + 1} (index ${item.index}) force-added. Total in all: ${results.all.length}`);
      }
    }

    // Sort images by category order, then by original index within each category
    Object.keys(results).forEach((key) => {
      if (key === "all") {
        // For "all" category, sort by category order first, then by index
        results[key] = results[key].sort((a, b) => {
          const orderA = categoryOrder[a.category] ?? 999;
          const orderB = categoryOrder[b.category] ?? 999;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          // If same category, sort by original index
          return a.index - b.index;
        });
      } else {
        // For other categories, sort by original index
        results[key] = results[key].sort((a, b) => {
          return a.index - b.index;
        });
      }
    });

    // Verify all images were processed and add any missing ones
    const processedIndices = results.all.map(img => img.index);
    const missingIndices = [];
    for (let i = 0; i < images.length; i++) {
      if (!processedIndices.includes(i)) {
        missingIndices.push(i);
        // Add missing image to results
        const missingImage = {
          url: images[i],
          category: "exterior",
          detected_label: "Unknown",
          confidence: 0,
          index: i,
        };
        // Double-check this index doesn't already exist (shouldn't happen, but be safe)
        const existingIndex = results.all.findIndex(img => img.index === i);
        if (existingIndex >= 0) {
          console.warn(`Image at index ${i} already exists in results.all at position ${existingIndex}, but was marked as missing. Replacing it.`);
          results.all[existingIndex] = missingImage;
        } else {
          results.all.push(missingImage);
        }
        results.exterior.push(missingImage);
        console.warn(`Image at index ${i} was missing, added as exterior fallback`);
      }
    }
    
    // Final verification: ensure we have exactly images.length items in results.all
    if (results.all.length !== images.length) {
      console.error(`CRITICAL: After verification, results.all has ${results.all.length} items but expected ${images.length}`);
      // Remove any duplicates by index (keep the last one)
      const seenIndices = new Set();
      const uniqueResults = [];
      for (let i = results.all.length - 1; i >= 0; i--) {
        if (!seenIndices.has(results.all[i].index)) {
          seenIndices.add(results.all[i].index);
          uniqueResults.unshift(results.all[i]);
        }
      }
      // Add any still missing indices
      for (let i = 0; i < images.length; i++) {
        if (!seenIndices.has(i)) {
          const missingImage = {
            url: images[i],
            category: "exterior",
            detected_label: "Unknown",
            confidence: 0,
            index: i,
          };
          uniqueResults.push(missingImage);
          results.exterior.push(missingImage);
          console.warn(`Image at index ${i} was still missing after deduplication, added as exterior fallback`);
        }
      }
      results.all = uniqueResults;
      console.log(`After deduplication and fix, results.all now has ${results.all.length} items`);
    }
    
    // Re-sort "all" after adding missing images
    if (missingIndices.length > 0) {
      results.all.sort((a, b) => {
        const orderA = categoryOrder[a.category] ?? 999;
        const orderB = categoryOrder[b.category] ?? 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.index - b.index;
      });
    }

    console.log("Final categorized results:", {
      totalImages: results.all.length,
      expectedImages: images.length,
      byCategory: Object.keys(results).reduce((acc, key) => {
        acc[key] = results[key].length;
        return acc;
      }, {}),
      allImageIndices: results.all.map(img => img.index).sort((a, b) => a - b),
      allImageDetails: results.all.map(img => ({
        index: img.index,
        category: img.category,
        url: img.url.substring(0, 50)
      })),
      missingIndices: missingIndices.length > 0 ? missingIndices : "None",
    });
    
    // Verify all images were processed
    if (results.all.length !== images.length) {
      console.error(`Image count mismatch: Expected ${images.length} images, but only ${results.all.length} were processed`);
      console.error("Expected indices:", Array.from({ length: images.length }, (_, i) => i));
      console.error("Actual indices:", results.all.map(img => img.index).sort((a, b) => a - b));
    } else {
      console.log("✓ All images successfully processed and added to results.all");
    }

    setOrganizedImages(results);
    setProcessingStatus({});
    setIsProcessing(false);

    // Save results to cache
    if (carId) {
      const imagesHash = createImagesHash(images);
      saveCachedData(carId, imagesHash, results);
    }
  };

  // Handle clicked image after organizedImages is updated
  useEffect(() => {
    // Don't run if user manually changed category or if already on "all"
    if (clickedImageUrl && organizedImages.all.length > 0 && !isProcessing && !showSlider && !isManualCategoryChange.current && currentCategory !== "all") {
      // Find the clicked image by its original index in the images array (most reliable)
      const clickedIndexInOriginalArray = images.findIndex(img => {
        if (img === clickedImageUrl) return true;
        const normalizedImg = normalizeUrl(img);
        const normalizedClicked = normalizeUrl(clickedImageUrl);
        if (normalizedImg === normalizedClicked) return true;
        
        // Try with protocol variations
        const imgWithHttps = img.startsWith('http://') ? img.replace('http://', 'https://') : (img.startsWith('https://') ? img : `https://${img}`);
        const clickedWithHttps = clickedImageUrl.startsWith('http://') ? clickedImageUrl.replace('http://', 'https://') : (clickedImageUrl.startsWith('https://') ? clickedImageUrl : `https://${clickedImageUrl}`);
        return imgWithHttps === clickedWithHttps;
      });
      
      console.log("Finding clicked image", {
        clickedUrl: clickedImageUrl,
        clickedIndexInOriginalArray,
        totalImages: images.length,
        organizedImagesCount: organizedImages.all.length
      });
      
      if (clickedIndexInOriginalArray >= 0) {
        // Find the image in organizedImages by its index (this is the most reliable way)
        const clickedImage = organizedImages.all.find(img => img.index === clickedIndexInOriginalArray);
        
        if (clickedImage) {
          const category = clickedImage.category || "all";
          
          // If category is "all", always show gallery view (not slider)
          if (category === "all") {
            console.log("Opening clicked image in 'all' category - showing gallery", {
              clickedUrl: clickedImageUrl,
              totalImages: organizedImages.all.length
            });
            
            setCurrentCategory("all");
            setShowSlider(false);
            setSliderImages([]);
            setSliderIndex(0);
          } else {
            const categoryImages = organizedImages[category] || [];
            
            // Find the index of this image in the category array by its original index
            const indexInCategory = categoryImages.findIndex(img => img.index === clickedIndexInOriginalArray);
            
            console.log("Opening clicked image", {
              clickedUrl: clickedImageUrl,
              clickedIndexInOriginalArray,
              clickedImageIndex: clickedImage.index,
              category,
              indexInCategory,
              categoryImagesCount: categoryImages.length,
              categoryImageIndices: categoryImages.map((img, idx) => ({ position: idx, url: img.url, originalIndex: img.index }))
            });
            
            if (indexInCategory >= 0 && categoryImages.length > 0) {
              // Set all state synchronously
              setCurrentCategory(category);
              setSliderImages(categoryImages);
              setSliderIndex(indexInCategory);
              
              // Show slider after state is set
              setTimeout(() => {
                setShowSlider(true);
                // Update Swiper on mobile after it's rendered
                setTimeout(() => {
                  if (swiperRef.current?.swiper && window.innerWidth < 768) {
                    console.log("Setting Swiper to slide", indexInCategory, "in category", category);
                    swiperRef.current.swiper.slideTo(indexInCategory, 0);
                    swiperRef.current.swiper.update();
                  }
                }, 150);
              }, 0);
            } else {
              // If not found in category, show in "all" gallery
              console.log("Image not found in category, showing 'all' gallery", {
                clickedUrl: clickedImageUrl,
                category
              });
              
              setCurrentCategory("all");
              setShowSlider(false);
              setSliderImages([]);
              setSliderIndex(0);
            }
          }
        } else {
          console.error("Could not find image with index", clickedIndexInOriginalArray, "in organizedImages");
        }
      } else {
        console.error("Could not find clicked image in original images array", {
          clickedUrl: clickedImageUrl,
          imagesUrls: images.slice(0, 5)
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizedImages.all.length, clickedImageUrl, isProcessing, showSlider]);

  // Initialize and check cache before processing
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
      // Clear clickedImageUrl when modal closes to prevent it from reopening slider
      // Note: We can't directly modify the prop, but the parent should handle this

      // Check cache first
      const imagesHash = createImagesHash(images);
      const cachedResults = loadCachedData(carId, imagesHash);

      if (cachedResults) {
        // Use cached results
        console.log("Using cached categorization results for car:", carId);
        setOrganizedImages(cachedResults);
        setIsProcessing(false);

        // If a specific image was clicked, find its category and show it in slider
        if (clickedImageUrl) {
          // Normalize the clicked URL for comparison
          const normalizedClickedUrl = normalizeUrl(clickedImageUrl);
          const clickedImage = cachedResults.all.find(img => {
            const normalizedImgUrl = normalizeUrl(img.url);
            return normalizedImgUrl === normalizedClickedUrl || img.url === clickedImageUrl;
          });
        if (clickedImage) {
          const category = clickedImage.category || "all";
          
          // If category is "all", always show gallery view
          if (category === "all") {
            console.log("Opening clicked image from cache (all category) - showing gallery", {
              clickedUrl: clickedImageUrl,
              totalImages: cachedResults.all.length
            });
            
            setCurrentCategory("all");
            setShowSlider(false);
            setSliderImages([]);
            setSliderIndex(0);
          } else {
            const categoryImages = cachedResults[category] || [];
            const index = categoryImages.findIndex(img => {
              const normalizedImgUrl = normalizeUrl(img.url);
              const exactMatch = img.url === clickedImageUrl;
              const normalizedMatch = normalizedImgUrl === normalizedClickedUrl;
              if (!exactMatch && !normalizedMatch) {
                // Try with protocol variations
                const imgWithHttps = img.url.startsWith('http://') ? img.url.replace('http://', 'https://') : img.url;
                const clickedWithHttps = clickedImageUrl.startsWith('http://') ? clickedImageUrl.replace('http://', 'https://') : clickedImageUrl;
                return imgWithHttps === clickedWithHttps || img.url === clickedWithHttps || imgWithHttps === clickedImageUrl;
              }
              return exactMatch || normalizedMatch;
            });
            
            if (index >= 0 && categoryImages.length > 0) {
              console.log("Opening clicked image from cache", {
                clickedUrl: clickedImageUrl,
                clickedImageIndex: clickedImage.index,
                category,
                foundIndex: index,
                categoryImagesCount: categoryImages.length
              });
              
              setCurrentCategory(category);
              setSliderImages(categoryImages);
              setSliderIndex(index);
              
              // Use a small delay to ensure state is set before showing slider
              setTimeout(() => {
                setShowSlider(true);
                // Update Swiper on mobile after it's rendered
                setTimeout(() => {
                  if (swiperRef.current?.swiper && window.innerWidth < 768) {
                    console.log("Setting Swiper to slide from cache", index);
                    swiperRef.current.swiper.slideTo(index, 0); // 0 speed for instant transition
                    swiperRef.current.swiper.update();
                  }
                }, 100);
              }, 0);
            } else {
              // If not found in category, show in "all" gallery
              console.log("Image not found in category, showing 'all' gallery", {
                clickedUrl: clickedImageUrl,
                category
              });
              
              setCurrentCategory("all");
              setShowSlider(false);
              setSliderImages([]);
              setSliderIndex(0);
            }
          }
          }
        }
      } else {
        // No cache, process images
        console.log("No cache found, processing images for car:", carId);
        setOrganizedImages(initialCategories);
        processImagesQueue();
      }
    } else if (!isOpen) {
      // Reset processing state when modal closes
      setIsProcessing(false);
      setProcessingStatus({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, carId, images.length, clickedImageUrl]);

  const handleCategoryClick = (category) => {
    const categoryImages = organizedImages[category] || [];
    
    // Mark as manual category change to prevent useEffect from overriding
    isManualCategoryChange.current = true;
    
    // Set category first
    setCurrentCategory(category);
    
    if (category === "all") {
      // For "all" category, always show gallery view
      setShowSlider(false);
      setSliderImages([]);
      setSliderIndex(0);
    } else if (categoryImages.length > 0) {
      // For other categories, open first image in slider view
      setSliderImages(categoryImages);
      setSliderIndex(0);
      setShowSlider(true);
    } else {
      // If no images, just show the category (empty gallery)
      setShowSlider(false);
      setSliderImages([]);
      setSliderIndex(0);
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isManualCategoryChange.current = false;
    }, 100);
  };

  const handleImageClick = (image, category) => {
    console.log("handleImageClick called", {
      imageUrl: image.url,
      imageIndex: image.index,
      imageCategory: image.category,
      currentCategory: category
    });
    
    // If clicking from "all" category, find which category the image actually belongs to
    let targetCategory = category;
    let categoryImages = organizedImages[category] || [];
    
    if (category === "all") {
      // Find the actual category of this image
      const imageCategory = image.category || "exterior";
      targetCategory = imageCategory;
      categoryImages = organizedImages[imageCategory] || [];
      console.log("Clicked from 'all', found category:", imageCategory, "with", categoryImages.length, "images");
    }
    
    // Use the image's index property to find it in the category array (most reliable)
    let index = -1;
    if (image.index !== undefined) {
      // First, try to find by URL to ensure we get the exact match
      const normalizedImageUrl = normalizeUrl(image.url);
      index = categoryImages.findIndex((img) => {
        const normalizedImgUrl = normalizeUrl(img.url);
        return img.url === image.url || normalizedImgUrl === normalizedImageUrl;
      });
      
      // If not found by URL, try by index
      if (index < 0) {
        index = categoryImages.findIndex((img) => img.index === image.index);
      }
      
      console.log("Finding image", {
        imageIndex: image.index,
        imageUrl: image.url.substring(0, 50),
        foundAtIndex: index,
        categoryImagesCount: categoryImages.length,
        categoryImagesIndices: categoryImages.map((img, idx) => ({ position: idx, originalIndex: img.index, url: img.url.substring(0, 50) }))
      });
      
      // Verify the found image matches the clicked image
      if (index >= 0) {
        const foundImage = categoryImages[index];
        const urlMatch = foundImage.url === image.url || normalizeUrl(foundImage.url) === normalizeUrl(image.url);
        const indexMatch = foundImage.index === image.index;
        if (!urlMatch && !indexMatch) {
          console.warn("Found image doesn't match clicked image!", {
            foundImageUrl: foundImage.url.substring(0, 50),
            clickedImageUrl: image.url.substring(0, 50),
            foundImageIndex: foundImage.index,
            clickedImageIndex: image.index
          });
          // Try to find by URL again more carefully
          index = categoryImages.findIndex((img) => {
            return img.url === image.url || 
                   normalizeUrl(img.url) === normalizedImageUrl ||
                   img.index === image.index;
          });
          console.log("Re-searched, found at index:", index);
        }
      }
    }
    
    // If not found by index, try URL matching (fallback)
    if (index < 0) {
      const normalizedImageUrl = normalizeUrl(image.url);
      index = categoryImages.findIndex((img) => {
        const normalizedImgUrl = normalizeUrl(img.url);
        const exactMatch = img.url === image.url;
        const normalizedMatch = normalizedImgUrl === normalizedImageUrl;
        if (!exactMatch && !normalizedMatch) {
          // Try with protocol variations
          const imgWithHttps = img.url.startsWith('http://') ? img.url.replace('http://', 'https://') : img.url;
          const imageWithHttps = image.url.startsWith('http://') ? image.url.replace('http://', 'https://') : image.url;
          return imgWithHttps === imageWithHttps || img.url === imageWithHttps || imgWithHttps === image.url;
        }
        return exactMatch || normalizedMatch;
      });
      console.log("Finding image by URL (fallback)", {
        imageUrl: image.url,
        foundAtIndex: index
      });
    }
    
    // If still not found, default to 0
    if (index < 0) {
      console.warn("Image not found in category, defaulting to first image", {
        imageUrl: image.url,
        imageIndex: image.index,
        targetCategory,
        categoryImagesCount: categoryImages.length,
        categoryImagesIndices: categoryImages.map(img => img.index)
      });
      index = 0;
    }
    
    console.log("Opening clicked image", {
      imageUrl: image.url,
      imageIndex: image.index,
      targetCategory,
      indexInCategory: index,
      categoryImagesCount: categoryImages.length,
      targetImageIndex: categoryImages[index]?.index,
      targetImageUrl: categoryImages[index]?.url?.substring(0, 50)
    });
    
    // Mark as manual category change to prevent useEffect from overriding
    isManualCategoryChange.current = true;
    
    // Verify the target image before opening
    const targetImage = categoryImages[index];
    if (targetImage) {
      console.log("Target image verification", {
        targetImageIndex: targetImage.index,
        clickedImageIndex: image.index,
        targetImageUrl: targetImage.url.substring(0, 50),
        clickedImageUrl: image.url.substring(0, 50),
        indicesMatch: targetImage.index === image.index,
        urlsMatch: targetImage.url === image.url || normalizeUrl(targetImage.url) === normalizeUrl(image.url)
      });
    } else {
      console.error("Target image not found at index!", {
        index,
        categoryImagesCount: categoryImages.length,
        categoryImages: categoryImages.map((img, idx) => ({ position: idx, index: img.index, url: img.url.substring(0, 50) }))
      });
    }
    
    // Ensure index is valid
    const validIndex = Math.max(0, Math.min(index, categoryImages.length - 1));
    if (validIndex !== index) {
      console.warn("Index out of bounds, adjusting from", index, "to", validIndex);
    }
    
    // Set all state synchronously - order matters!
    // First, set the category and images
    setCurrentCategory(targetCategory);
    setSliderImages(categoryImages);
    
    // Then set the index
    setSliderIndex(validIndex);
    
    // Force Swiper to reinitialize by closing and reopening slider
    // This ensures Swiper gets the correct initialSlide value
    if (showSlider) {
      setShowSlider(false);
      // Wait a frame, then reopen with correct index
      requestAnimationFrame(() => {
        setSliderIndex(validIndex);
        setTimeout(() => {
          setShowSlider(true);
          // Update Swiper after it's rendered
          setTimeout(() => {
            if (swiperRef.current?.swiper && window.innerWidth < 768) {
              console.log("Setting Swiper to slide", validIndex, "in category", targetCategory, "out of", categoryImages.length);
              swiperRef.current.swiper.slideTo(validIndex, 0);
              swiperRef.current.swiper.update();
              
              // Verify Swiper is on the correct slide
              setTimeout(() => {
                const currentSlide = swiperRef.current?.swiper?.activeIndex;
                if (currentSlide !== validIndex) {
                  console.error("Swiper slide mismatch! Expected", validIndex, "but got", currentSlide);
                  swiperRef.current.swiper.slideTo(validIndex, 0);
                  swiperRef.current.swiper.update();
                } else {
                  console.log("✓ Swiper is on the correct slide", validIndex);
                }
              }, 50);
            }
          }, 100);
        }, 50);
      });
    } else {
      // Slider is closed, just open it with correct index
      setTimeout(() => {
        setShowSlider(true);
        // Update Swiper after it's rendered
        setTimeout(() => {
          if (swiperRef.current?.swiper && window.innerWidth < 768) {
            console.log("Setting Swiper to slide", validIndex, "in category", targetCategory, "out of", categoryImages.length);
            swiperRef.current.swiper.slideTo(validIndex, 0);
            swiperRef.current.swiper.update();
            
            // Verify Swiper is on the correct slide
            setTimeout(() => {
              const currentSlide = swiperRef.current?.swiper?.activeIndex;
              if (currentSlide !== validIndex) {
                console.error("Swiper slide mismatch! Expected", validIndex, "but got", currentSlide);
                swiperRef.current.swiper.slideTo(validIndex, 0);
                swiperRef.current.swiper.update();
              } else {
                console.log("✓ Swiper is on the correct slide", validIndex);
              }
            }, 50);
          }
        }, 100);
      }, 10);
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isManualCategoryChange.current = false;
    }, 300);
  };

  const navigateSlider = (step) => {
    if (!sliderImages.length) return;

    const newIndex = sliderIndex + step;
    
    // On mobile, use Swiper for navigation
    if (window.innerWidth < 768 && swiperRef.current?.swiper) {
      if (step > 0) {
        swiperRef.current.swiper.slideNext();
      } else {
        swiperRef.current.swiper.slidePrev();
      }
      return;
    }

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
      // Go to previous category - find previous category that has images
      const currentIdx = categorySequence.indexOf(currentCategory);
      let foundPrev = false;
      
      // Look for previous category with images
      for (let i = currentIdx - 1; i >= 0; i--) {
        const prevCategory = categorySequence[i];
        const prevImages = organizedImages[prevCategory] || [];
        if (prevImages.length > 0) {
          setCurrentCategory(prevCategory);
          setSliderImages(prevImages);
          setSliderIndex(prevImages.length - 1);
          setZoomLevel(1); // Reset zoom when changing category
          foundPrev = true;
          return;
        }
      }
      
      // If no previous category with images, loop to last category with images
      if (!foundPrev) {
        for (let i = categorySequence.length - 1; i > currentIdx; i--) {
          const prevCategory = categorySequence[i];
          const prevImages = organizedImages[prevCategory] || [];
          if (prevImages.length > 0) {
            setCurrentCategory(prevCategory);
            setSliderImages(prevImages);
            setSliderIndex(prevImages.length - 1);
            setZoomLevel(1);
            return;
          }
        }
      }
      
      // If still no category found, just loop within current category
      setSliderIndex(sliderImages.length - 1);
    } else if (newIndex >= sliderImages.length) {
      // Go to next category - find next category that has images
      const currentIdx = categorySequence.indexOf(currentCategory);
      let foundNext = false;
      
      // Look for next category with images
      for (let i = currentIdx + 1; i < categorySequence.length; i++) {
        const nextCategory = categorySequence[i];
        const nextImages = organizedImages[nextCategory] || [];
        if (nextImages.length > 0) {
          setCurrentCategory(nextCategory);
          setSliderImages(nextImages);
          setSliderIndex(0);
          setZoomLevel(1); // Reset zoom when changing category
          foundNext = true;
          return;
        }
      }
      
      // If no next category with images, loop back to first category with images
      if (!foundNext) {
        for (let i = 0; i < currentIdx; i++) {
          const nextCategory = categorySequence[i];
          const nextImages = organizedImages[nextCategory] || [];
          if (nextImages.length > 0) {
            setCurrentCategory(nextCategory);
            setSliderImages(nextImages);
            setSliderIndex(0);
            setZoomLevel(1);
            return;
          }
        }
      }
      
      // If still no category found, just loop within current category
      setSliderIndex(0);
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
  }, [isOpen, showSlider, sliderIndex, currentCategory]);

  // Ensure Swiper is on the correct slide when slider opens
  useEffect(() => {
    if (showSlider && swiperRef.current?.swiper && window.innerWidth < 768) {
      const currentSlide = swiperRef.current.swiper.activeIndex;
      if (currentSlide !== sliderIndex) {
        console.log("Correcting Swiper slide position", { currentSlide, targetIndex: sliderIndex });
        swiperRef.current.swiper.slideTo(sliderIndex, 0);
        swiperRef.current.swiper.update();
      }
    }
  }, [showSlider, sliderIndex]);

  // Debug logging for current images
  useEffect(() => {
    if (isOpen && currentCategory === "all") {
      const allImages = organizedImages.all || [];
      const totalCount = allImages.length;
      if (totalCount > 0) {
        console.log("Current 'all' images:", {
          total: totalCount,
          expected: totalCount,
          imageIndices: allImages.map(img => img.index).sort((a, b) => a - b),
          imageCategories: allImages.map(img => ({ index: img.index, category: img.category })),
        });
      }
    }
  }, [isOpen, currentCategory, organizedImages.all]);

  if (!isOpen) return null;

  // Get images for current category
  const currentImages = organizedImages[currentCategory] || [];
  // Get total count of all images
  const totalImagesCount = organizedImages.all?.length || 0;

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

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .category-scroll-container::-webkit-scrollbar {
          height: 3px;
        }
        .category-scroll-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .category-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .category-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        @media (min-width: 768px) {
          .category-scroll-container::-webkit-scrollbar {
            display: none;
          }
        }
      `}} />
      <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
        {/* Navigation Bar */}
        <div className="w-full sticky top-0 left-0 z-[110] bg-black shadow-lg" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
        <div className="w-full flex justify-between items-center">
          {/* Navigation - Inline scrollable on both mobile and desktop - positioned at far left */}
          <div 
            className="flex gap-3 md:gap-6 overflow-x-auto category-scroll-container pl-2 md:pl-4 mr-6 md:mr-12"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
              msOverflowStyle: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`text-base md:text-lg font-medium pb-1.5 relative transition-colors whitespace-nowrap flex-shrink-0 ${currentCategory === cat
                  ? "text-white"
                  : "text-white hover:opacity-70"
                  }`}
                style={{ paddingTop: '1px', color: currentCategory === cat ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)' }}
              >
                {cat === "all" 
                  ? `All photos (${totalImagesCount})`
                  : capitalizeWord(cat)
                }
              </button>
            ))}
          </div>
   
          {/* Action Buttons - positioned at far right */}
          <div className="flex gap-2 md:gap-4 items-center flex-shrink-0 ml-6 md:ml-12" style={{ marginRight: '15px' }}>
            {showSlider && (
              <>
                {/* Image counter - shown before zoom button (desktop only) */}
                <div className="hidden md:flex text-white text-base md:text-lg mr-2" style={{ fontWeight: 300 }}>
                  {(() => {
                    // Use the original index from the image to match thumbnail sequence
                    const currentImage = sliderImages[sliderIndex];
                    if (currentImage && currentImage.index !== undefined) {
                      return `${currentImage.index + 1} of ${totalImagesCount}`;
                    }
                    // Fallback to slider index if index property is missing
                    return `${sliderIndex + 1} of ${totalImagesCount}`;
                  })()}
                </div>
                <div className="hidden md:flex gap-4">
                  <button
                    onClick={handleZoom}
                    className="text-gray-500 flex items-center justify-center hover:text-gray-300 transition-colors text-2xl md:text-3xl p-2"
                    title="Zoom"
                  >
                    +
                  </button>
                  <button
                    onClick={handleFullscreen}
                    className="text-gray-500 flex items-center justify-center hover:text-gray-300 transition-colors text-2xl md:text-3xl p-2"
                    title="Full Screen"
                  >
                    ⛶
                  </button>
                </div>
              </>
            )}
            <button
              onClick={handleClose}
              className="text-white flex items-center justify-center hover:opacity-70 transition-opacity text-2xl md:text-4xl p-1 md:p-2"
              style={{ marginTop: '-8px', lineHeight: '1.2', marginLeft: '-4px' }}
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

        {/* Gallery View */}
        {!showSlider && (
          <>
            <div className="fixed bottom-4 right-4 md:relative md:bottom-auto md:right-auto mb-5 md:text-right text-gray-400 text-sm z-10 bg-black bg-opacity-50 px-2 py-1 rounded">
              Total photos: {totalImagesCount}
            </div>

            {currentImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                {currentImages.map((image, index) => (
                  <div
                    key={`${image.url}-${image.index}-${index}`}
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
              <div className="flex items-center justify-center min-h-[300px]" style={{ paddingTop: '150px' }}>
                <p className="text-gray-400 text-sm">
                  No photos found in this category
                </p>
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
                className="hidden md:flex text-white text-4xl items-center justify-center hover:opacity-70 transition-opacity fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[105] disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={
                  currentCategory !== "all" &&
                  sliderIndex === 0 &&
                  categorySequence.indexOf(currentCategory) === 0
                }
              >
                ‹
              </button>

              <div className="flex items-center justify-center max-w-full relative w-full h-[80vh] px-0 overflow-hidden">
                {/* Mobile: Swiper for smooth swiping */}
                <div className="md:hidden w-full h-full flex items-center justify-center" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
                  <Swiper
                    ref={swiperRef}
                    modules={[A11y]}
                    spaceBetween={0}
                    slidesPerView={1}
                    key={`swiper-${currentCategory}-${sliderIndex}-${sliderImages.length}`}
                    initialSlide={sliderIndex}
                    loop={false}
                    watchSlidesProgress={true}
                    updateOnWindowResize={true}
                    observer={true}
                    observeParents={true}
                    touchRatio={1}
                    touchAngle={45}
                    threshold={10}
                    longSwipesRatio={0.5}
                    longSwipesMs={300}
                    resistance={true}
                    resistanceRatio={0.85}
                    onSlideChange={(swiper) => {
                      const newIndex = swiper.activeIndex;
                      setSliderIndex(newIndex);
                      // Handle category navigation
                      if (currentCategory !== "all" && newIndex >= sliderImages.length - 1) {
                        const currentIdx = categorySequence.indexOf(currentCategory);
                        // Find next category with images
                        for (let i = currentIdx + 1; i < categorySequence.length; i++) {
                          const nextCategory = categorySequence[i];
                          const nextImages = organizedImages[nextCategory] || [];
                          if (nextImages.length > 0) {
                            setCurrentCategory(nextCategory);
                            setSliderImages(nextImages);
                            setSliderIndex(0);
                            setTimeout(() => {
                              if (swiperRef.current?.swiper) {
                                swiperRef.current.swiper.slideTo(0, 300);
                              }
                            }, 50);
                            return;
                          }
                        }
                        // Loop back to first category with images
                        for (let i = 0; i < currentIdx; i++) {
                          const nextCategory = categorySequence[i];
                          const nextImages = organizedImages[nextCategory] || [];
                          if (nextImages.length > 0) {
                            setCurrentCategory(nextCategory);
                            setSliderImages(nextImages);
                            setSliderIndex(0);
                            setTimeout(() => {
                              if (swiperRef.current?.swiper) {
                                swiperRef.current.swiper.slideTo(0, 300);
                              }
                            }, 50);
                            return;
                          }
                        }
                      } else if (currentCategory !== "all" && newIndex <= 0) {
                        const currentIdx = categorySequence.indexOf(currentCategory);
                        // Find previous category with images
                        for (let i = currentIdx - 1; i >= 0; i--) {
                          const prevCategory = categorySequence[i];
                          const prevImages = organizedImages[prevCategory] || [];
                          if (prevImages.length > 0) {
                            setCurrentCategory(prevCategory);
                            setSliderImages(prevImages);
                            setSliderIndex(prevImages.length - 1);
                            setTimeout(() => {
                              if (swiperRef.current?.swiper) {
                                swiperRef.current.swiper.slideTo(prevImages.length - 1, 300);
                              }
                            }, 50);
                            return;
                          }
                        }
                        // Loop to last category with images
                        for (let i = categorySequence.length - 1; i > currentIdx; i--) {
                          const prevCategory = categorySequence[i];
                          const prevImages = organizedImages[prevCategory] || [];
                          if (prevImages.length > 0) {
                            setCurrentCategory(prevCategory);
                            setSliderImages(prevImages);
                            setSliderIndex(prevImages.length - 1);
                            setTimeout(() => {
                              if (swiperRef.current?.swiper) {
                                swiperRef.current.swiper.slideTo(prevImages.length - 1, 300);
                              }
                            }, 50);
                            return;
                          }
                        }
                      }
                    }}
                    speed={300}
                    allowTouchMove={true}
                    simulateTouch={false}
                    grabCursor={true}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%', touchAction: 'pan-x pan-y' }}
                    onSwiper={(swiper) => {
                      // Ensure Swiper is properly initialized
                      if (swiper && sliderImages.length > 0) {
                        setTimeout(() => {
                          swiper.update();
                          swiper.slideTo(sliderIndex, 0);
                        }, 100);
                      }
                    }}
                  >
                    {sliderImages.map((image, index) => (
                      <SwiperSlide key={`${image.url}-${image.index}-${index}`} className="!flex items-center justify-center !w-full !h-full" style={{ width: '100%', height: '100%' }}>
                        <div className="w-full h-full flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
                          <img
                            src={image.url}
                            alt={image.detected_label || "Gallery image"}
                            className="max-w-[100vw] max-h-[80vh] w-auto h-auto object-contain rounded-none shadow-2xl bg-gray-900"
                            style={{
                              transform: zoomLevel > 1 ? `scale(${zoomLevel})` : "none",
                              transformOrigin: "center center",
                              display: "block",
                              margin: "0 auto",
                              width: "auto",
                              height: "auto",
                              maxWidth: "100vw",
                              maxHeight: "80vh"
                            }}
                            loading="eager"
                            draggable={false}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Desktop: Manual slider */}
                <div className="hidden md:flex items-center justify-center w-full h-full">
                  {sliderImages[sliderIndex] ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        key={sliderImages[sliderIndex].url}
                        ref={sliderImageRef}
                        src={sliderImages[sliderIndex].url}
                        alt={
                          sliderImages[sliderIndex].detected_label || "Gallery image"
                        }
                        className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-gray-900"
                        style={{
                          transform: zoomLevel > 1 ? `scale(${zoomLevel})` : "none",
                          transformOrigin: "center center",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[80vh] flex items-center justify-center">
                      <p className="text-gray-400 text-lg">No photos found in this category</p>
                    </div>
                  )}
                </div>

                {/* Mobile: Image counter in bottom right corner */}
                {showSlider && (
                  <div className="md:hidden fixed bottom-4 right-4 text-white text-sm font-light z-[110] bg-black bg-opacity-70 px-3 py-2 rounded">
                    {(() => {
                      // Use the original index from the image to match thumbnail sequence
                      const currentImage = sliderImages[sliderIndex];
                      if (currentImage && currentImage.index !== undefined) {
                        return `${currentImage.index + 1} of ${totalImagesCount}`;
                      }
                      // Fallback to slider index if index property is missing
                      return `${sliderIndex + 1} of ${totalImagesCount}`;
                    })()}
                  </div>
                )}

              </div>

              <button
                onClick={() => navigateSlider(1)}
                className="hidden md:flex text-white text-4xl items-center justify-center hover:opacity-70 transition-opacity fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[105] disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={
                  currentCategory !== "all" &&
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
    </>
  );
}

