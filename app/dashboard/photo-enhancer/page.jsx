"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  FiUpload,
  FiDownload,
  FiRotateCw,
  FiRotateCcw,
  FiRefreshCw,
} from "react-icons/fi";
import {
  MdBrightness5,
  MdBrightness6,
  MdBrightness7,
  MdContrast,
  MdFilterBAndW,
  MdCrop,
  MdAutoFixHigh,
} from "react-icons/md";
import { BsArrowsFullscreen, BsFillImageFill } from "react-icons/bs";
import { TbFlipHorizontal, TbFlipVertical } from "react-icons/tb";
import { RiShadowLine } from "react-icons/ri";
import { IoColorPaletteOutline } from "react-icons/io5";

export default function PhotoEnhancer() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/placeholder.jpg");
  const fileInputRef = useRef(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropCoordinates, setCropCoordinates] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const cropStartRef = useRef({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Image adjustments state
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    rotate: 0,
    flipX: false,
    flipY: false,
  });

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

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      // Reset crop state
      setIsCropping(false);
      setCropCoordinates({ x: 0, y: 0, width: 0, height: 0 });
    }
  };

  // Handle value change for image adjustments
  const handleAdjustmentChange = (property, value) => {
    setAdjustments((prev) => ({
      ...prev,
      [property]: value,
    }));
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
      rotate: 0,
      flipX: false,
      flipY: false,
    });
  };

  // Auto-enhance image
  const autoEnhance = () => {
    // Apply a predefined set of adjustments that generally improve photos
    setAdjustments({
      brightness: 110, // Slightly increase brightness
      contrast: 115, // Increase contrast
      saturation: 120, // Make colors pop
      blur: 0, // No blur
      grayscale: 0, // No grayscale
      sepia: 10, // Slight warm tone
      rotate: adjustments.rotate, // Keep current rotation
      flipX: adjustments.flipX, // Keep current flip
      flipY: adjustments.flipY, // Keep current flip
    });
  };

  // Initialize crop with predefined aspect ratio
  const startCrop = () => {
    if (!imageRef.current || !containerRef.current || !selectedImage) return;

    setIsCropping(true);

    // Get container dimensions
    const container = containerRef.current.getBoundingClientRect();

    // Calculate crop area with 3:2 aspect ratio centered in the image
    const aspectRatio = 3 / 2; // width:height ratio

    // Get the current image dimensions
    const imgWidth = imageSize.width;
    const imgHeight = imageSize.height;

    let cropWidth, cropHeight;

    // Calculate the maximum possible crop area while maintaining the aspect ratio
    if (imgWidth / imgHeight > aspectRatio) {
      // Image is wider than the target aspect ratio (landscape)
      // Use 100% of the height and calculate width based on the aspect ratio
      cropHeight = imgHeight;
      cropWidth = cropHeight * aspectRatio;
    } else {
      // Image is taller than or equal to the target aspect ratio (portrait or square)
      // Use 100% of the width and calculate height based on the aspect ratio
      cropWidth = imgWidth;
      cropHeight = cropWidth / aspectRatio;
    }

    // If the calculated dimensions exceed the image, adjust them
    if (cropWidth > imgWidth) {
      cropWidth = imgWidth;
      cropHeight = cropWidth / aspectRatio;
    }
    if (cropHeight > imgHeight) {
      cropHeight = imgHeight;
      cropWidth = cropHeight * aspectRatio;
    }

    // Center the crop area
    const cropX = (imgWidth - cropWidth) / 2;
    const cropY = (imgHeight - cropHeight) / 2;

    setCropCoordinates({
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    });
  };

  // Handle start of crop dragging
  const handleCropDragStart = (e) => {
    if (!isCropping) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDraggingCrop(true);

    // Get mouse position relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Store the offset of mouse from the crop area top-left corner
    setDragStartPos({
      x: mouseX - cropCoordinates.x,
      y: mouseY - cropCoordinates.y,
    });
  };

  // Handle crop area dragging
  const handleCropDragMove = (e) => {
    if (!isCropping || !isDraggingCrop) return;

    // Get mouse position relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new position
    let newX = mouseX - dragStartPos.x;
    let newY = mouseY - dragStartPos.y;

    // Constrain to image boundaries
    newX = Math.max(0, Math.min(newX, imageSize.width - cropCoordinates.width));
    newY = Math.max(
      0,
      Math.min(newY, imageSize.height - cropCoordinates.height)
    );

    setCropCoordinates((prev) => ({
      ...prev,
      x: newX,
      y: newY,
    }));
  };

  // Handle end of crop dragging
  const handleCropDragEnd = () => {
    setIsDraggingCrop(false);
  };

  // Apply cropping
  const applyCrop = () => {
    if (!isCropping || !selectedImage || !imageRef.current) return;

    // Create a canvas to apply the crop
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Get the original image
    const img = imageRef.current;

    // Calculate the scale factor between the displayed image and the original image
    const scaleX = img.naturalWidth / imageSize.width;
    const scaleY = img.naturalHeight / imageSize.height;

    // Set canvas size to the cropped size with the right aspect ratio
    canvas.width = cropCoordinates.width * scaleX;
    canvas.height = cropCoordinates.height * scaleY;

    // Apply current filters to the context
    ctx.filter = `
      brightness(${adjustments.brightness}%) 
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
      blur(${adjustments.blur}px)
      grayscale(${adjustments.grayscale}%)
      sepia(${adjustments.sepia}%)
    `;

    // Draw the cropped portion
    ctx.drawImage(
      img,
      cropCoordinates.x * scaleX,
      cropCoordinates.y * scaleY,
      cropCoordinates.width * scaleX,
      cropCoordinates.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert to blob and create a new object URL
    canvas.toBlob(
      (blob) => {
        // Clean up the old object URL to prevent memory leaks
        if (previewUrl !== "/placeholder.jpg") {
          URL.revokeObjectURL(previewUrl);
        }

        // Create new object URL and update the preview
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);

        // Create a new File object to store the cropped image
        const croppedFile = new File([blob], selectedImage.name, {
          type: "image/jpeg",
          lastModified: new Date().getTime(),
        });

        // Update the selected image
        setSelectedImage(croppedFile);

        // Exit crop mode
        setIsCropping(false);
      },
      "image/jpeg",
      0.95
    );
  };

  // Cancel cropping
  const cancelCrop = () => {
    setIsCropping(false);
    setCropCoordinates({ x: 0, y: 0, width: 0, height: 0 });
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

    // Apply transformations
    ctx.filter = `
      brightness(${adjustments.brightness}%) 
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
      blur(${adjustments.blur}px)
      grayscale(${adjustments.grayscale}%)
      sepia(${adjustments.sepia}%)
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
      0.9
    );
  };

  // Compute the CSS filter string based on adjustments
  const getFilterStyle = () => {
    return {
      filter: `
        brightness(${adjustments.brightness}%) 
        contrast(${adjustments.contrast}%)
        saturate(${adjustments.saturation}%)
        blur(${adjustments.blur}px)
        grayscale(${adjustments.grayscale}%)
        sepia(${adjustments.sepia}%)
      `,
      transform: `
        rotate(${adjustments.rotate}deg)
        scaleX(${adjustments.flipX ? -1 : 1})
        scaleY(${adjustments.flipY ? -1 : 1})
      `,
    };
  };

  // Set up event listeners for crop dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingCrop) {
        handleCropDragMove(e);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingCrop) {
        handleCropDragEnd();
      }
    };

    if (isDraggingCrop) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingCrop]);

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
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    style={getFilterStyle()}
                  />

                  {/* Crop overlay */}
                  {isCropping &&
                    cropCoordinates.width !== 0 &&
                    cropCoordinates.height !== 0 && (
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 cursor-move"
                        style={{
                          left: `${cropCoordinates.x}px`,
                          top: `${cropCoordinates.y}px`,
                          width: `${cropCoordinates.width}px`,
                          height: `${cropCoordinates.height}px`,
                        }}
                        onMouseDown={handleCropDragStart}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-80 select-none">
                          <p className="bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                            Drag to position
                          </p>
                        </div>
                      </div>
                    )}
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
                onClick={autoEnhance}
                className="btn btn-accent flex items-center gap-2"
                disabled={!selectedImage}
              >
                <MdAutoFixHigh /> Auto Enhance
              </button>

              <button
                onClick={isCropping ? cancelCrop : startCrop}
                className={`btn ${
                  isCropping ? "btn-error" : "btn-outline"
                } flex items-center gap-2`}
                disabled={!selectedImage}
              >
                <MdCrop /> {isCropping ? "Cancel Crop" : "Crop (3:2)"}
              </button>

              {isCropping && (
                <button
                  onClick={applyCrop}
                  className="btn btn-success flex items-center gap-2"
                >
                  Apply Crop
                </button>
              )}

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

        {/* Controls Section */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Adjust Image</h2>

          <div className="space-y-6">
            {/* Brightness */}
            <div>
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
                  handleAdjustmentChange("brightness", parseInt(e.target.value))
                }
                className="w-full"
                disabled={!selectedImage}
              />
            </div>

            {/* Contrast */}
            <div>
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
            <div>
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
                  handleAdjustmentChange("saturation", parseInt(e.target.value))
                }
                className="w-full"
                disabled={!selectedImage}
              />
            </div>

            {/* Blur */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <RiShadowLine className="w-5 h-5" /> Blur
                </label>
                <span>{adjustments.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={adjustments.blur}
                onChange={(e) =>
                  handleAdjustmentChange("blur", parseFloat(e.target.value))
                }
                className="w-full"
                disabled={!selectedImage}
              />
            </div>

            {/* Grayscale */}
            <div>
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
                  handleAdjustmentChange("grayscale", parseInt(e.target.value))
                }
                className="w-full"
                disabled={!selectedImage}
              />
            </div>

            {/* Sepia */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <MdBrightness5 className="w-5 h-5" /> Sepia
                </label>
                <span>{adjustments.sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sepia}
                onChange={(e) =>
                  handleAdjustmentChange("sepia", parseInt(e.target.value))
                }
                className="w-full"
                disabled={!selectedImage}
              />
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
          <li>For quick enhancement, click the Auto Enhance button</li>
          <li>
            To crop to a 3:2 aspect ratio, click the Crop button and drag the
            selection to position it
          </li>
          <li>Adjust individual image properties using the sliders</li>
          <li>Transform the image using rotation and flip controls</li>
          <li>Download your enhanced image when satisfied</li>
        </ol>
      </div>
    </div>
  );
}
