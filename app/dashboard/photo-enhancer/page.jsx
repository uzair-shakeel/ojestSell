"use client";

import { useState, useRef } from "react";
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
} from "react-icons/md";
import { BsArrowsFullscreen, BsFillImageFill } from "react-icons/bs";
import { TbFlipHorizontal, TbFlipVertical } from "react-icons/tb";
import { RiShadowLine } from "react-icons/ri";
import { IoColorPaletteOutline } from "react-icons/io5";

export default function PhotoEnhancer() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/placeholder.jpg");
  const fileInputRef = useRef(null);

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

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Photo Enhancer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Preview Section */}
        <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6 shadow-md">
          <div className="flex flex-col items-center">
            <div className="relative w-full h-[400px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              {selectedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    style={getFilterStyle()}
                  />
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
          <li>Adjust the image properties using the sliders</li>
          <li>Transform the image using rotation and flip controls</li>
          <li>Download your enhanced image when satisfied</li>
        </ol>
      </div>
    </div>
  );
}
