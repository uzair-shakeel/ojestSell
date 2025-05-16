"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  FiUpload,
  FiDownload,
  FiRotateCw,
  FiRotateCcw,
  FiRefreshCw,
  FiChevronDown,
} from "react-icons/fi";
import {
  MdBrightness5,
  MdBrightness6,
  MdBrightness7,
  MdContrast,
  MdFilterBAndW,
  MdCrop,
  MdAutoFixHigh,
  MdCheck,
  MdClose,
} from "react-icons/md";
import { BsArrowsFullscreen, BsFillImageFill } from "react-icons/bs";
import { TbFlipHorizontal, TbFlipVertical } from "react-icons/tb";
import { RiShadowLine } from "react-icons/ri";
import { IoColorPaletteOutline } from "react-icons/io5";

export default function PhotoEnhancer() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/placeholder.jpg");
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const cropperRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [activeFilter, setActiveFilter] = useState("none");
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropCoordinates, setCropCoordinates] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Aspect ratio for crop (3:2)
  const cropAspectRatio = 3 / 2;

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

  // Professional filter presets
  const filterPresets = {
    none: {
      name: "None",
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
      name: "Showroom",
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
      name: "Sports Car",
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
      name: "Vintage",
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
      name: "Luxury",
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
      name: "Dramatic",
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
      name: "Neon Night",
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
      name: "Classic B&W",
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
      name: "Sunset Drive",
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

  // Update image size when image loads
  useEffect(() => {
    if (imageRef.current && selectedImage) {
      const updateImageSize = () => {
        setImageSize({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
        });
      };

      // Update initially and on window resize
      updateImageSize();
      window.addEventListener("resize", updateImageSize);

      // Set up listener for when image loads
      imageRef.current.onload = updateImageSize;

      return () => {
        window.removeEventListener("resize", updateImageSize);
      };
    }
  }, [selectedImage, imageRef.current]);

  // Initialize crop area when opening crop modal
  useEffect(() => {
    if (showCropModal && imageRef.current) {
      const img = imageRef.current;
      const imgRect = img.getBoundingClientRect();

      // Use the actual displayed dimensions from bounding client rect
      const imgWidth = imgRect.width;
      const imgHeight = imgRect.height;

      // Calculate the initial crop area based on the 3:2 aspect ratio
      let cropWidth, cropHeight;

      if (imgWidth / imgHeight > cropAspectRatio) {
        // If image is wider than crop aspect ratio
        cropHeight = Math.min(imgHeight, 300);
        cropWidth = cropHeight * cropAspectRatio;
      } else {
        // If image is taller than crop aspect ratio
        cropWidth = Math.min(imgWidth, 450);
        cropHeight = cropWidth / cropAspectRatio;
      }

      // Center the crop area
      const x = Math.max(0, (imgWidth - cropWidth) / 2);
      const y = Math.max(0, (imgHeight - cropHeight) / 2);

      // Make sure the crop area is completely within the image bounds
      const constrainedWidth = Math.min(cropWidth, imgWidth);
      const constrainedHeight = Math.min(cropHeight, imgHeight);

      // Final position check to ensure the crop doesn't exceed image bounds
      const finalX = Math.min(x, imgWidth - constrainedWidth);
      const finalY = Math.min(y, imgHeight - constrainedHeight);

      setCropCoordinates({
        x: finalX,
        y: finalY,
        width: constrainedWidth,
        height: constrainedHeight,
      });
    }
  }, [showCropModal]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Handle value change for image adjustments
  const handleAdjustmentChange = (property, value) => {
    setAdjustments((prev) => ({
      ...prev,
      [property]: value,
    }));
    setActiveFilter("custom");
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
    setActiveFilter("none");
  };

  // Apply filter preset
  const applyFilterPreset = (presetKey) => {
    const preset = filterPresets[presetKey];
    if (preset) {
      setAdjustments((prev) => ({
        ...prev,
        ...preset.adjustments,
      }));
      setActiveFilter(presetKey);
    }
  };

  // Auto-enhance image
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
    setActiveFilter("showroom");
  };

  // Handle crop drag start
  const handleCropDragStart = (e) => {
    if (!cropperRef.current) return;

    const cropperRect = cropperRef.current.getBoundingClientRect();
    setDragStartPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setIsDragging(true);
  };

  // Handle crop drag
  const handleCropDrag = (e) => {
    if (!isDragging || !cropperRef.current || !imageRef.current) return;

    const dx = e.clientX - dragStartPosition.x;
    const dy = e.clientY - dragStartPosition.y;

    setDragStartPosition({
      x: e.clientX,
      y: e.clientY,
    });

    setCropCoordinates((prev) => {
      // Calculate new position
      let newX = prev.x + dx;
      let newY = prev.y + dy;

      // Get image dimensions from the actual displayed image
      const imgElement = imageRef.current;
      const imgRect = imgElement.getBoundingClientRect();

      // For the displayed dimensions, we need to use the bounding client rect properties
      const imgDisplayWidth = imgRect.width;
      const imgDisplayHeight = imgRect.height;

      // Constrain to image bounds - ensure the crop area doesn't go outside the actual image
      newX = Math.max(0, Math.min(imgDisplayWidth - prev.width, newX));
      newY = Math.max(0, Math.min(imgDisplayHeight - prev.height, newY));

      return {
        ...prev,
        x: newX,
        y: newY,
      };
    });
  };

  // Handle crop drag end
  const handleCropDragEnd = () => {
    setIsDragging(false);
  };

  // Apply crop to the image
  const applyCrop = () => {
    if (!selectedImage || !imageRef.current) return;

    // Create a canvas to apply the crop
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    // Get the image display dimensions
    const imgRect = img.getBoundingClientRect();

    // Calculate the scale factors between the natural image size and the displayed size
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Scale crop coordinates to match the original image dimensions
    const cropX = cropCoordinates.x * scaleX;
    const cropY = cropCoordinates.y * scaleY;
    const cropWidth = cropCoordinates.width * scaleX;
    const cropHeight = cropCoordinates.height * scaleY;

    // Set canvas size to the crop dimensions
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Draw the cropped image to the canvas
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Convert canvas to a blob and set as new image
    canvas.toBlob((blob) => {
      // Release the previous URL
      URL.revokeObjectURL(previewUrl);

      // Create new URL for the cropped image
      const croppedUrl = URL.createObjectURL(blob);
      setPreviewUrl(croppedUrl);

      // Create a file from the blob
      const croppedFile = new File([blob], selectedImage.name, {
        type: selectedImage.type,
      });
      setSelectedImage(croppedFile);

      // Close the crop modal
      setShowCropModal(false);
    }, selectedImage.type);
  };

  // Download the edited image
  const downloadImage = () => {
    if (!selectedImage || !imageRef.current) return;

    // Create a canvas to apply the filters and transformations
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // For simplicity, we'll use the actual image dimensions
    const img = imageRef.current;

    // Set canvas size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply filters and transformations
    // Note: Some advanced filters like shadows, highlights, sharpen, and vignette
    // would need custom implementations in a production app
    ctx.filter = `
      brightness(${adjustments.brightness}%) 
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
      blur(${adjustments.blur}px)
      grayscale(${adjustments.grayscale}%)
      sepia(${adjustments.sepia}%)
      hue-rotate(${adjustments.hueRotate}deg)
    `;

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((adjustments.rotate * Math.PI) / 180);
    if (adjustments.flipX) ctx.scale(-1, 1);
    if (adjustments.flipY) ctx.scale(1, -1);
    ctx.drawImage(
      img,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    // Add vignette effect if needed
    if (adjustments.vignette > 0) {
      ctx.save();

      // Create radial gradient for vignette
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.5
      );

      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${adjustments.vignette / 100})`);

      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = "multiply";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();
    }

    // Add film grain if needed
    if (adjustments.noise > 0) {
      ctx.save();
      const noiseCanvas = document.createElement("canvas");
      const noiseCtx = noiseCanvas.getContext("2d");
      noiseCanvas.width = canvas.width;
      noiseCanvas.height = canvas.height;

      // Create noise pattern
      const imageData = noiseCtx.createImageData(
        noiseCanvas.width,
        noiseCanvas.height
      );
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Random noise value
        const value = Math.floor(Math.random() * 255);
        data[i] = value; // red
        data[i + 1] = value; // green
        data[i + 2] = value; // blue
        data[i + 3] = Math.random() * adjustments.noise * 2; // alpha (controls intensity)
      }

      noiseCtx.putImageData(imageData, 0, 0);

      // Apply noise to main canvas
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = adjustments.noise / 100;
      ctx.drawImage(noiseCanvas, 0, 0);

      ctx.restore();
    }

    // Convert to blob and download
    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const filename = selectedImage.name.split(".")[0] + "-enhanced.jpg";

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.95
    );
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

    // Background/overlay for simulating vignette and additional effects
    const pseudoElementStyle = {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      mixBlendMode: "multiply",
      background: `
        ${
          adjustments.vignette > 0
            ? `radial-gradient(
            circle, 
            transparent 30%, 
            rgba(0,0,0,${adjustments.vignette / 100}) 100%)`
            : "none"
        }
      `,
      opacity: adjustments.vignette > 0 ? 1 : 0,
      borderRadius: "inherit",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
    };

    // Temperature tint overlay
    const temperatureOverlay = {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background:
        adjustments.temperature > 0
          ? `rgba(255,${255 - adjustments.temperature * 2},${
              255 - adjustments.temperature * 4
            },${adjustments.temperature / 100})`
          : `rgba(${255 + adjustments.temperature * 4},${
              255 + adjustments.temperature * 2
            },255,${Math.abs(adjustments.temperature) / 100})`,
      mixBlendMode: "overlay",
      opacity: Math.abs(adjustments.temperature) > 0 ? 1 : 0,
      borderRadius: "inherit",
    };

    // Tint overlay (green/magenta)
    const tintOverlay = {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background:
        adjustments.tint > 0
          ? `rgba(${255 - adjustments.tint * 2},255,${
              255 - adjustments.tint * 2
            },${adjustments.tint / 100})`
          : `rgba(255,${255 + adjustments.tint * 2},255,${
              Math.abs(adjustments.tint) / 100
            })`,
      mixBlendMode: "overlay",
      opacity: Math.abs(adjustments.tint) > 0 ? 1 : 0,
      borderRadius: "inherit",
    };

    // Clarity overlay (local contrast)
    const clarityOverlay = {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      backdropFilter: `contrast(${100 + adjustments.clarity * 0.5}%)`,
      opacity: adjustments.clarity > 0 ? adjustments.clarity / 100 : 0,
      borderRadius: "inherit",
    };

    // Noise texture
    const noiseStyle = {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      backgroundImage:
        'url("data:image/png;base64,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")',
      opacity: adjustments.noise / 100,
      mixBlendMode: "overlay",
      backgroundSize: "120px 120px",
      borderRadius: "inherit",
    };

    return {
      filter: filterString,
      transform: `
        rotate(${adjustments.rotate}deg)
        scaleX(${adjustments.flipX ? -1 : 1})
        scaleY(${adjustments.flipY ? -1 : 1})
      `,
      position: "relative",
      vignetteStyle: pseudoElementStyle,
      temperatureStyle: temperatureOverlay,
      tintStyle: tintOverlay,
      clarityStyle: clarityOverlay,
      noiseStyle: noiseStyle,
    };
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Photo Enhancer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Preview Section */}
        <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6 shadow-md">
          <div className="flex flex-col items-center">
            <div
              ref={containerRef}
              className="relative w-full h-[400px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white flex items-center justify-center"
            >
              {selectedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="relative" style={{ display: "inline-block" }}>
                    <img
                      ref={imageRef}
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                      style={getFilterStyle()}
                    />
                    {/* Vignette effect overlay */}
                    <div
                      style={getFilterStyle().vignetteStyle}
                      className="absolute top-0 left-0 w-full h-full"
                    ></div>

                    {/* Temperature tint overlay */}
                    <div
                      style={getFilterStyle().temperatureStyle}
                      className="absolute top-0 left-0 w-full h-full"
                    ></div>

                    {/* Green/Magenta tint overlay */}
                    <div
                      style={getFilterStyle().tintStyle}
                      className="absolute top-0 left-0 w-full h-full"
                    ></div>

                    {/* Clarity overlay */}
                    <div
                      style={getFilterStyle().clarityStyle}
                      className="absolute top-0 left-0 w-full h-full"
                    ></div>

                    {/* Noise overlay */}
                    <div
                      style={getFilterStyle().noiseStyle}
                      className="absolute top-0 left-0 w-full h-full"
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <BsFillImageFill className="w-16 h-16 mb-4" />
                  <p className="text-lg">No image selected</p>
                  <p className="text-sm mt-2">Upload an image to enhance</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => fileInputRef.current.click()}
                className="btn btn-primary flex items-center gap-2"
              >
                <FiUpload /> Upload Image
              </button>

              <button
                onClick={downloadImage}
                className="btn btn-outline flex items-center gap-2"
                disabled={!selectedImage}
              >
                <FiDownload /> Download
              </button>

              <button
                onClick={resetAdjustments}
                className="btn btn-outline flex items-center gap-2"
                disabled={!selectedImage}
              >
                <FiRefreshCw /> Reset
              </button>

              <button
                onClick={() => setShowPresetsModal(true)}
                className="btn btn-accent flex items-center gap-2"
                disabled={!selectedImage}
              >
                <MdAutoFixHigh /> Auto Enhance
              </button>

              <button
                onClick={() => setShowCropModal(true)}
                className="btn btn-outline flex items-center gap-2"
                disabled={!selectedImage}
              >
                <MdCrop /> Crop
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
        </div>

        {/* Presets Modal */}
        {showPresetsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-lg font-semibold">Car Photo Presets</h3>
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
                            <MdAutoFixHigh className="w-full h-full text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {filterPresets[presetKey].name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Crop Modal */}
        {showCropModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-lg font-semibold">
                  Crop Image (3:2 Ratio)
                </h3>
                <button
                  onClick={() => setShowCropModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 bg-gray-100 relative">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="relative" style={{ display: "inline-block" }}>
                    <img
                      src={previewUrl}
                      alt="Crop Preview"
                      className="max-w-full max-h-[60vh] object-contain"
                    />

                    {/* Crop overlay */}
                    <div
                      ref={cropperRef}
                      className="absolute cursor-move"
                      style={{
                        left: `${cropCoordinates.x}px`,
                        top: `${cropCoordinates.y}px`,
                        width: `${cropCoordinates.width}px`,
                        height: `${cropCoordinates.height}px`,
                        border: "2px solid #007BFF",
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                      }}
                      onMouseDown={handleCropDragStart}
                      onMouseMove={handleCropDrag}
                      onMouseUp={handleCropDragEnd}
                      onMouseLeave={handleCropDragEnd}
                    >
                      {/* Crop grid lines */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                        <div className="border-r border-b border-white border-opacity-50"></div>
                        <div className="border-r border-b border-white border-opacity-50"></div>
                        <div className="border-b border-white border-opacity-50"></div>
                        <div className="border-r border-b border-white border-opacity-50"></div>
                        <div className="border-r border-b border-white border-opacity-50"></div>
                        <div className="border-b border-white border-opacity-50"></div>
                        <div className="border-r border-white border-opacity-50"></div>
                        <div className="border-r border-white border-opacity-50"></div>
                        <div className="border-white border-opacity-50"></div>
                      </div>

                      {/* Resize handles */}
                      {/* Note: Resize handlers would be implemented here in a full version */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t p-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCrop}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <MdCheck size={18} /> Apply Crop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-md overflow-y-auto max-h-[800px]">
          <h2 className="text-xl font-semibold mb-4">Adjust Image</h2>

          <div className="space-y-6">
            {/* Basic Adjustments */}
            <div>
              <h3 className="text-md font-medium mb-3 border-b pb-1">
                Basic Adjustments
              </h3>

              {/* Brightness */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MdBrightness6 className="w-5 h-5" /> Brightness
                  </label>
                  <span>{adjustments.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.brightness}
                  onChange={(e) =>
                    handleAdjustmentChange(
                      "brightness",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Contrast */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MdContrast className="w-5 h-5" /> Contrast
                  </label>
                  <span>{adjustments.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.contrast}
                  onChange={(e) =>
                    handleAdjustmentChange("contrast", parseInt(e.target.value))
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Saturation */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <IoColorPaletteOutline className="w-5 h-5" /> Saturation
                  </label>
                  <span>{adjustments.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.saturation}
                  onChange={(e) =>
                    handleAdjustmentChange(
                      "saturation",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Exposure */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MdBrightness7 className="w-5 h-5" /> Exposure
                  </label>
                  <span>{adjustments.exposure}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={adjustments.exposure}
                  onChange={(e) =>
                    handleAdjustmentChange("exposure", parseInt(e.target.value))
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Shadows */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <RiShadowLine className="w-5 h-5" /> Shadows
                  </label>
                  <span>
                    {adjustments.shadows > 0
                      ? `+${adjustments.shadows}`
                      : adjustments.shadows}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={adjustments.shadows}
                  onChange={(e) =>
                    handleAdjustmentChange("shadows", parseInt(e.target.value))
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Highlights */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <BsArrowsFullscreen className="w-5 h-5" /> Highlights
                  </label>
                  <span>
                    {adjustments.highlights > 0
                      ? `+${adjustments.highlights}`
                      : adjustments.highlights}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={adjustments.highlights}
                  onChange={(e) =>
                    handleAdjustmentChange(
                      "highlights",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Sharpen */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MdFilterBAndW className="w-5 h-5" /> Sharpen
                  </label>
                  <span>{adjustments.sharpen}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.sharpen}
                  onChange={(e) =>
                    handleAdjustmentChange("sharpen", parseInt(e.target.value))
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Hue Rotation */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <IoColorPaletteOutline className="w-5 h-5" /> Hue Shift
                  </label>
                  <span>{adjustments.hueRotate}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={adjustments.hueRotate}
                  onChange={(e) =>
                    handleAdjustmentChange(
                      "hueRotate",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Grayscale */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MdFilterBAndW className="w-5 h-5" /> Grayscale
                  </label>
                  <span>{adjustments.grayscale}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.grayscale}
                  onChange={(e) =>
                    handleAdjustmentChange(
                      "grayscale",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Temperature */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MdBrightness5 className="w-5 h-5" /> Temperature
                  </label>
                  <span>
                    {adjustments.temperature > 0
                      ? `+${adjustments.temperature}`
                      : adjustments.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={adjustments.temperature}
                  onChange={(e) =>
                    handleAdjustmentChange(
                      "temperature",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Tint */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <IoColorPaletteOutline className="w-5 h-5" /> Tint
                  </label>
                  <span>
                    {adjustments.tint > 0
                      ? `+${adjustments.tint}`
                      : adjustments.tint}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={adjustments.tint}
                  onChange={(e) =>
                    handleAdjustmentChange("tint", parseInt(e.target.value))
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Clarity */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MdFilterBAndW className="w-5 h-5" /> Clarity
                  </label>
                  <span>{adjustments.clarity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.clarity}
                  onChange={(e) =>
                    handleAdjustmentChange("clarity", parseInt(e.target.value))
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>

              {/* Vibrance */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <IoColorPaletteOutline className="w-5 h-5" /> Vibrance
                  </label>
                  <span>{adjustments.vibrance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.vibrance}
                  onChange={(e) =>
                    handleAdjustmentChange("vibrance", parseInt(e.target.value))
                  }
                  className="w-full"
                  disabled={!selectedImage}
                />
              </div>
            </div>

            {/* Transform Controls */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">Transform</h3>

              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                    !selectedImage
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() =>
                    handleAdjustmentChange("rotate", adjustments.rotate - 90)
                  }
                  disabled={!selectedImage}
                >
                  <FiRotateCcw /> Rotate Left
                </button>

                <button
                  className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                    !selectedImage
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() =>
                    handleAdjustmentChange("rotate", adjustments.rotate + 90)
                  }
                  disabled={!selectedImage}
                >
                  <FiRotateCw /> Rotate Right
                </button>

                <button
                  className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                    !selectedImage
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() =>
                    handleAdjustmentChange("flipX", !adjustments.flipX)
                  }
                  disabled={!selectedImage}
                >
                  <TbFlipHorizontal /> Flip H
                </button>

                <button
                  className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                    !selectedImage
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() =>
                    handleAdjustmentChange("flipY", !adjustments.flipY)
                  }
                  disabled={!selectedImage}
                >
                  <TbFlipVertical /> Flip V
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          How to use Photo Enhancer
        </h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Upload an image using the Upload button</li>
          <li>
            Try out different car-specific filter presets to quickly enhance
            your photo
          </li>
          <li>For quick enhancement, click the Auto Enhance button</li>
          <li>Fine-tune individual settings using the adjustment sliders</li>
          <li>
            Transform the image using rotation, flip, and crop controls if
            needed
          </li>
          <li>Download your enhanced image when satisfied</li>
        </ol>
      </div>
    </div>
  );
}
