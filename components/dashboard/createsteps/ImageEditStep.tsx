"use client";
import { useState, useEffect, useRef } from "react";
import type React from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Wand2, CloudyIcon as Blur, CropIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ImageEditStepProps {
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: any) => void;
  formData: {
    images: File[];
    imagePreviews: string[];
    imageAdjustments?: {
      [key: number]: {
        brightness: number;
        contrast: number;
        saturation: number;
        blur: number;
        grayscale: number;
        sepia: number;
        hueRotate: number;
        exposure: number;
        shadows: number;
        highlights: number;
        vignette: number;
        sharpen: number;
        rotate: number;
        flipX: boolean;
        flipY: boolean;
        clarity: number;
        temperature: number;
        vibrance: number;
        noise: number;
        tint: number;
      };
    };
  };
}

// Compress an image file to stay under a target size using canvas
async function compressImage(
  file: File,
  targetBytes = 1000 * 1000, // 1 MB
  maxDimension = 1920,
  minQuality = 0.5
): Promise<File> {
  try {
    if (file.size <= targetBytes) return file;

    const bitmap = await createImageBitmap(file);
    // Compute scale to limit longest dimension
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);

    // Binary search-like quality reduction
    let quality = 0.9;
    let blob: Blob | null = null;
    // Try a few steps to get under target
    for (let i = 0; i < 6; i++) {
      // eslint-disable-next-line no-await-in-loop
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), file.type || "image/jpeg", quality)
      );
      if (!blob) break;
      if (blob.size <= targetBytes || quality <= minQuality) break;
      quality -= 0.1;
    }
    if (blob && blob.size < file.size) {
      return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }
    return file;
  } catch (e) {
    console.warn("Compression failed, using original file", e);
    return file;
  }
}

function isHeicFile(file: File) {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );
    if (!blob) return file;
    return new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg") || "image.jpg",
      { type: "image/jpeg", lastModified: Date.now() }
    );
  } catch (_) {
    try {
      const anyGlobal: any = globalThis as any;
      if (!anyGlobal.heic2any) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("heic2any failed to load"));
          document.head.appendChild(s);
        });
      }
      if (anyGlobal.heic2any) {
        const result: Blob | Blob[] = await anyGlobal.heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        const outBlob = Array.isArray(result) ? result[0] : result;
        if (outBlob) {
          return new File(
            [outBlob],
            file.name.replace(/\.(heic|heif)$/i, ".jpg") || "image.jpg",
            { type: "image/jpeg", lastModified: Date.now() }
          );
        }
      }
    } catch (_) {}
    return file;
  }
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export default function ImageEditStep({
  nextStep,
  prevStep,
  updateFormData,
  formData,
}: ImageEditStepProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState<File | null>(null);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("none");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBlurBox, setShowBlurBox] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isBlurringPlate, setIsBlurringPlate] = useState(false);

  // Image adjustments state
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    exposure: 100,
    shadows: 0,
    highlights: 0,
    vignette: 0,
    sharpen: 0,
    rotate: 0,
    flipX: false,
    flipY: false,
    clarity: 0,
    temperature: 0,
    vibrance: 0,
    noise: 0,
    tint: 0,
  });

  // Upload images directly in this step
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const currentCount = formData.images?.length || 0;
    if (currentCount + selectedFiles.length > 10) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    const images: File[] = [...(formData.images || [])];
    const newPreviews: string[] = [...(formData.imagePreviews || [])];
    const process = async () => {
      for (const f of selectedFiles) {
        const converted = isHeicFile(f) ? await convertHeicToJpeg(f) : f;
        images.push(converted);
        try {
          const dataUrl = await fileToDataURL(converted);
          newPreviews.push(dataUrl);
        } catch (_) {
          newPreviews.push("");
        }
      }
      updateFormData({ ...formData, images, imagePreviews: newPreviews });
      if (currentCount === 0 && images.length > 0) {
        setActiveImage(images[0]);
        setActiveImageIndex(0);
        setPreviewUrl(newPreviews[0]);
      }
      (e.currentTarget as HTMLInputElement).value = "";
    };
    process();
  };

  // Drag & drop reorder state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Helper to reorder arrays immutably
  const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Drag handlers
  const handleThumbDragStart = (index: number) => () => setDraggingIndex(index);
  const handleThumbDragOver = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleThumbDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };
  const handleThumbDrop = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return handleThumbDragEnd();
    const newImages = reorder(formData.images, draggingIndex, index);
    const newPreviews = reorder(formData.imagePreviews, draggingIndex, index);
    updateFormData({ ...formData, images: newImages, imagePreviews: newPreviews });
    setActiveImageIndex(index);
    handleThumbDragEnd();
  };

  // Load the first image when component mounts
  useEffect(() => {
    if (formData.images && formData.images.length > 0) {
      setActiveImage(formData.images[0]);
      setActiveImageIndex(0);
      setPreviewUrl(formData.imagePreviews[0]);
    }
  }, [formData.images, formData.imagePreviews]);

  // Load saved adjustments when switching images
  useEffect(() => {
    if (
      formData.imageAdjustments &&
      formData.imageAdjustments[activeImageIndex]
    ) {
      setAdjustments(formData.imageAdjustments[activeImageIndex]);
    } else {
      resetAdjustments();
    }
  }, [activeImageIndex, formData.imageAdjustments]);

  // Handle value change for image adjustments
  const handleAdjustmentChange = (
    property: string,
    value: number | boolean
  ) => {
    setAdjustments((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  // Auto-enhance image - exact same functionality from photo-enhancer.tsx
  const autoEnhance = () => {
    // Apply a predefined set of adjustments that generally improve car photos
    setAdjustments({
      brightness: 105,
      contrast: 115,
      saturation: 110,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      exposure: 102,
      shadows: 10,
      highlights: -5,
      vignette: 15,
      sharpen: 20,
      rotate: adjustments.rotate,
      flipX: adjustments.flipX,
      flipY: adjustments.flipY,
      clarity: 15,
      temperature: 5,
      vibrance: 10,
      noise: 0,
      tint: 0,
    });
  };

  // Reset all adjustments
  const resetAdjustments = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      exposure: 100,
      shadows: 0,
      highlights: 0,
      vignette: 0,
      sharpen: 0,
      rotate: 0,
      flipX: false,
      flipY: false,
      clarity: 0,
      temperature: 0,
      vibrance: 0,
      noise: 0,
      tint: 0,
    });
  };

  // Compute the CSS filter string based on adjustments
  const getFilterStyle = () => {
    // Generate filter string with sharpness simulation
    const filterString = `
      brightness(${adjustments.brightness}%) 
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
      blur(${adjustments.blur}px)
      grayscale(${adjustments.grayscale}%)
      sepia(${adjustments.sepia}%)
      hue-rotate(${adjustments.hueRotate}deg)
      ${
        adjustments.sharpen > 0
          ? `contrast(${100 + adjustments.sharpen * 0.3}%) brightness(${
              100 + adjustments.sharpen * 0.1
            }%)`
          : ""
      }
    `;

    return filterString;
  };

  // Helper function to get filter style for a specific image
  const getFilterStyleForImage = (imageIndex: number) => {
    if (!formData.imageAdjustments || !formData.imageAdjustments[imageIndex]) {
      return "none";
    }

    const adj = formData.imageAdjustments[imageIndex];
    const filterString = `
      brightness(${adj.brightness}%) 
      contrast(${adj.contrast}%)
      saturate(${adj.saturation}%)
      blur(${adj.blur}px)
      grayscale(${adj.grayscale}%)
      sepia(${adj.sepia}%)
      hue-rotate(${adj.hueRotate}deg)
      ${
        adj.sharpen > 0
          ? `contrast(${100 + adj.sharpen * 0.3}%) brightness(${
              100 + adj.sharpen * 0.1
            }%)`
          : ""
      }
    `;
    return filterString;
  };

  // Select a different image to edit
  const selectImage = (index: number) => {
    if (formData.images[index]) {
      setActiveImage(formData.images[index]);
      setActiveImageIndex(index);
      setPreviewUrl(formData.imagePreviews[index]);
      resetAdjustments();
      setShowCrop(false);
    }
  };

  // Apply crop to the image
  const applyCrop = () => {
    if (!activeImage || !imageRef.current || !completedCrop) return;

    const image = imageRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], activeImage.name, {
            type: activeImage.type,
          });

          const newImages = [...formData.images];
          newImages[activeImageIndex] = croppedFile;

          const newPreviewUrl = URL.createObjectURL(blob);
          const newPreviews = [...formData.imagePreviews];
          newPreviews[activeImageIndex] = newPreviewUrl;

          updateFormData({
            images: newImages,
            imagePreviews: newPreviews,
          });

          setActiveImage(croppedFile);
          setPreviewUrl(newPreviewUrl);
          setShowCrop(false);
          setCrop(undefined);
          setCompletedCrop(undefined);
        }
      },
      activeImage.type,
      1.0
    );
  };

  // Call external API directly to blur number plate (no internal /api route)
  const blurNumberPlate = async () => {
    if (!activeImage) {
      alert("Please select an image first");
      return;
    }

    setIsBlurringPlate(true);
    try {
      const externalUrl = "https://ojest.pl/detect/detect";
      const fd = new FormData();
      const baseFile = isHeicFile(activeImage) ? await convertHeicToJpeg(activeImage) : activeImage;
      const optimized = await compressImage(baseFile, 600 * 1000, 1600, 0.4);
      fd.append("file", optimized as File, (optimized as File).name || "upload.jpg");

      const resp = await fetch(externalUrl, { method: "POST", mode: "cors", headers: { Accept: "application/json" }, body: fd });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      // Support both possible response shapes
      const base64 = data?.image_base64 || (data?.processed_image?.includes(",") ? data?.processed_image.split(",")[1] : data?.processed_image);
      if (!base64) throw new Error("No image returned by detector");

      const imageUrl = (data?.processed_image && data.processed_image.startsWith("data:"))
        ? data.processed_image
        : `data:image/jpeg;base64,${base64}`;

      // Update preview
      setPreviewUrl(imageUrl);

      // Convert base64 to File and update form state
      const byteString = atob(imageUrl.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: "image/jpeg" });
      const file = new File([blob], "blurred-plate.jpg", { type: "image/jpeg" });

      const newImages = [...formData.images];
      newImages[activeImageIndex] = file;
      const newPreviews = [...formData.imagePreviews];
      newPreviews[activeImageIndex] = imageUrl;

      updateFormData({ ...formData, images: newImages, imagePreviews: newPreviews });
      setActiveImage(file);
    } catch (error) {
      console.error("Error blurring number plate (external API):", error);
      alert("Failed to blur number plate. Please try again.");
    } finally {
      setIsBlurringPlate(false);
    }
  };

  // Save the current adjustments to the form data
  const saveAdjustments = () => {
    if (!activeImage) return;

    // Simply update the form data with current adjustments
    // The visual changes are already applied via CSS filters
    const updatedFormData = {
      ...formData,
      imageAdjustments: {
        ...formData.imageAdjustments,
        [activeImageIndex]: adjustments,
      },
    };

    updateFormData(updatedFormData);

    // Show a brief success message or feedback
    console.log("Adjustments saved for image", activeImageIndex + 1);
  };

  // Professional filter presets
  const filterPresets = {
    none: {
      name: "Brak",
      adjustments: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        exposure: 100,
        shadows: 0,
        highlights: 0,
        vignette: 0,
        sharpen: 0,
        clarity: 0,
        temperature: 0,
        vibrance: 0,
        noise: 0,
        tint: 0,
      },
    },
    showroom: {
      name: "Salon Samochodowy",
      adjustments: {
        brightness: 105,
        contrast: 115,
        saturation: 110,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        exposure: 102,
        shadows: 10,
        highlights: -5,
        vignette: 15,
        sharpen: 20,
        clarity: 15,
        temperature: 5,
        vibrance: 10,
        noise: 0,
        tint: 0,
      },
    },
    sportsCar: {
      name: "Auto Sportowe",
      adjustments: {
        brightness: 102,
        contrast: 125,
        saturation: 115,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        exposure: 105,
        shadows: 15,
        highlights: -10,
        vignette: 25,
        sharpen: 30,
        clarity: 25,
        temperature: 10,
        vibrance: 20,
        noise: 0,
        tint: 0,
      },
    },
    vintage: {
      name: "Klasyk",
      adjustments: {
        brightness: 98,
        contrast: 105,
        saturation: 85,
        blur: 0,
        grayscale: 0,
        sepia: 30,
        hueRotate: 10,
        exposure: 98,
        shadows: 15,
        highlights: 5,
        vignette: 35,
        sharpen: 0,
        clarity: -10,
        temperature: 15,
        vibrance: -10,
        noise: 10,
        tint: 10,
      },
    },
    luxury: {
      name: "Luksusowe",
      adjustments: {
        brightness: 102,
        contrast: 110,
        saturation: 95,
        blur: 0,
        grayscale: 15,
        sepia: 5,
        hueRotate: 0,
        exposure: 102,
        shadows: 20,
        highlights: -15,
        vignette: 30,
        sharpen: 15,
        clarity: 20,
        temperature: -5,
        vibrance: 5,
        noise: 0,
        tint: -5,
      },
    },
    dramatic: {
      name: "Dramatyczne",
      adjustments: {
        brightness: 95,
        contrast: 140,
        saturation: 90,
        blur: 0,
        grayscale: 25,
        sepia: 0,
        hueRotate: 0,
        exposure: 95,
        shadows: 35,
        highlights: -25,
        vignette: 45,
        sharpen: 25,
        clarity: 30,
        temperature: -15,
        vibrance: 10,
        noise: 5,
        tint: 0,
      },
    },
    neon: {
      name: "Noc Neonowa",
      adjustments: {
        brightness: 95,
        contrast: 120,
        saturation: 130,
        blur: 1,
        grayscale: 0,
        sepia: 0,
        hueRotate: 220,
        exposure: 105,
        shadows: 25,
        highlights: -15,
        vignette: 40,
        sharpen: 10,
        clarity: 15,
        temperature: -30,
        vibrance: 30,
        noise: 0,
        tint: 25,
      },
    },
    offroad: {
      name: "Off-Road",
      adjustments: {
        brightness: 105,
        contrast: 115,
        saturation: 120,
        blur: 0,
        grayscale: 0,
        sepia: 10,
        hueRotate: 0,
        exposure: 103,
        shadows: 20,
        highlights: -5,
        vignette: 20,
        sharpen: 25,
        clarity: 20,
        temperature: 15,
        vibrance: 15,
        noise: 5,
        tint: 5,
      },
    },
    blackWhite: {
      name: "Czarno Białe",
      adjustments: {
        brightness: 105,
        contrast: 125,
        saturation: 0,
        blur: 0,
        grayscale: 100,
        sepia: 0,
        hueRotate: 0,
        exposure: 105,
        shadows: 15,
        highlights: -15,
        vignette: 25,
        sharpen: 20,
        clarity: 25,
        temperature: 0,
        vibrance: 0,
        noise: 5,
        tint: 0,
      },
    },
    dealershipPro: {
      name: "Dealership Pro",
      adjustments: {
        brightness: 108,
        contrast: 118,
        saturation: 105,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        exposure: 105,
        shadows: 12,
        highlights: -10,
        vignette: 10,
        sharpen: 30,
        clarity: 25,
        temperature: 0,
        vibrance: 15,
        noise: 0,
        tint: 0,
      },
    },
    sunset: {
      name: "Zachód Słońca ",
      adjustments: {
        brightness: 100,
        contrast: 110,
        saturation: 115,
        blur: 0,
        grayscale: 0,
        sepia: 15,
        hueRotate: 10,
        exposure: 100,
        shadows: 15,
        highlights: -10,
        vignette: 25,
        sharpen: 15,
        clarity: 10,
        temperature: 30,
        vibrance: 20,
        noise: 0,
        tint: 15,
      },
    },
  };

  // Apply filter preset
  const applyFilterPreset = (presetKey: string) => {
    const preset = filterPresets[presetKey as keyof typeof filterPresets];
    if (preset) {
      setAdjustments((prev) => ({
        ...prev,
        ...preset.adjustments,
      }));
      setActiveFilter(presetKey);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg w-full">
        <h2 className="text-xl font-bold mb-4">Krok 2: Edytuj Swoje Zdjęcia</h2>
        <p className="text-gray-600 mb-6">
         Popraw zdjęcia auta przed wystawieniem go na sprzedaż. Wybierz zdjęcia, które chcesz edytować.
        </p>

        {formData.images.length === 0 ? (
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <p className="text-gray-700 font-medium mb-2">Załaduj zdjęcia (1-10)</p>
              <p className="text-sm text-gray-500 mb-4">Dodaj zdjęcia auta tutaj. Możesz je edytować od razu po załadowaniu.</p>
              <label className="inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Wybierz zdjęcia
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Thumbnails */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Dodane zdjęcia</h3>
              <div className="mb-3">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 5v14m-7-7h14"/></svg>
                  Dodaj zdjęcia
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                {formData.imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer border-2 ${
                      activeImageIndex === index ? "border-blue-500" : "border-transparent"
                    } ${dragOverIndex === index ? "border-blue-400" : ""} rounded-md overflow-hidden`}
                    onClick={() => selectImage(index)}
                    draggable
                    onDragStart={handleThumbDragStart(index)}
                    onDragOver={handleThumbDragOver(index)}
                    onDrop={handleThumbDrop(index)}
                    onDragEnd={handleThumbDragEnd}
                  >
                    <img
                      src={preview || "/placeholder.svg?height=96&width=96"}
                      alt={`Car image ${index + 1}`}
                      className="w-full h-24 object-cover"
                      style={{ filter: getFilterStyleForImage(index) }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                      Zdjecie {index + 1}
                      {formData.imageAdjustments && formData.imageAdjustments[index] && (
                        <span className="ml-1 text-green-300">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Preview & Edit Area */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Edytuj Zdjęcie</h3>

                {/* Image Preview */}
                <div
                  ref={containerRef}
                  className="relative w-full h-[400px] border border-gray-300 rounded-lg overflow-hidden bg-white flex items-center justify-center mb-4"
                >
                  {activeImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {showCrop ? (
                        <ReactCrop
                          crop={crop}
                          onChange={(c) => setCrop(c)}
                          onComplete={(c) => setCompletedCrop(c)}
                          aspect={undefined}
                          className="max-w-full max-h-full"
                        >
                          <img
                            ref={imageRef}
                            src={
                              previewUrl ||
                              "/placeholder.svg?height=300&width=400"
                            }
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                            style={{ filter: getFilterStyle() }}
                          />
                        </ReactCrop>
                      ) : (
                        <img
                          ref={imageRef}
                          src={
                            previewUrl ||
                            "/placeholder.svg?height=300&width=400"
                          }
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                          style={{ filter: getFilterStyle() }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400">Wybierz zdjęcie do edycji</div>
                  )}
                </div>

                {/* Edit Controls */}
                <div className="space-y-4">
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setShowPresetsModal(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      disabled={!activeImage}
                    >
                      <Wand2 className="w-4 h-4" /> Auto Poprawianie
                    </button>

                    <button
                      onClick={blurNumberPlate}
                      className="flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors"
                      disabled={!activeImage || isBlurringPlate}
                    >
                      <Blur className="w-4 h-4" />
                      {isBlurringPlate ? "Ładowanie..." : "Zamaż Tablice Rejestracyjną"}
                    </button>
                    <button
                      onClick={() => setShowCrop(!showCrop)}
                      className={`flex items-center gap-1 ${
                        showCrop ? "bg-green-600" : "bg-gray-600"
                      } text-white px-3 py-2 rounded-md hover:bg-opacity-90 transition-colors`}
                    >
                      <CropIcon className="w-4 h-4" />{" "}
                      {showCrop ? "Cofnij Przycinanie" : "Przytnij"}
                    </button>
                    {showCrop && completedCrop && (
                      <button
                        onClick={applyCrop}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Zastosuj Przytnięcie
                      </button>
                    )}
                    <button
                      onClick={resetAdjustments}
                      className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Save Adjustments Button */}
                  <button
                    onClick={saveAdjustments}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={!activeImage}
                  >
                    Zapisz zmiany
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cofnij
          </button>
          <button
            onClick={nextStep}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Następne: Dane Auta
          </button>
        </div>
      </div>

      {/* Presets Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Ustawienia Zdjęć</h3>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.keys(filterPresets).map((presetKey) => (
                <button
                  key={presetKey}
                  onClick={() => {
                    applyFilterPreset(presetKey);
                    setShowPresetsModal(false);
                  }}
                  className={`p-4 rounded-md border transition-all duration-200 flex flex-col items-center ${
                    activeFilter === presetKey
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="w-full pb-[56.25%] relative mb-2 bg-gray-100 rounded overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* This would ideally display a thumbnail preview of the effect */}
                      <div className="w-12 h-12 flex items-center justify-center">
                        {presetKey === "none" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                          </svg>
                        ) : (
                          <Wand2 className="w-full h-full text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {
                      filterPresets[presetKey as keyof typeof filterPresets]
                        .name
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
