"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Car, Info, Camera, ScanLine, ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import QuestionCard from "../shared/QuestionCard";

interface Step01Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
}

export default function Step01_Start({ formData, updateFormData, nextStep }: Step01Props) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFiles = (files: FileList | File[]) => {
        const validFiles = Array.from(files).filter(file =>
            file.type.startsWith("image/") && file.size <= 20 * 1024 * 1024 // 20MB limit
        );

        if (validFiles.length > 0) {
            const newImages = [...(formData.images || []), ...validFiles];
            const newPreviews = [
                ...(formData.imagePreviews || []),
                ...validFiles.map(file => URL.createObjectURL(file))
            ];

            updateFormData({
                images: newImages,
                imagePreviews: newPreviews
            });
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...formData.images];
        const newPreviews = [...formData.imagePreviews];

        // Revoke URL to prevent memory leaks
        URL.revokeObjectURL(newPreviews[index]);

        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        updateFormData({
            images: newImages,
            imagePreviews: newPreviews
        });
    };

    const canProceed =
        formData.images?.length > 0 &&
        formData.conditionType &&
        formData.fuel;

    return (
        <div className="space-y-6">
            {/* 1. Upload Photos (Required) */}
            <QuestionCard
                title="Let's start with photos"
                subtitle="Upload at least one photo. Use good lighting for better AI detection."
            >
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                        }`}
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    />

                    <div className="flex flex-col items-center justify-center cursor-pointer">
                        <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                            <Upload className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            Click to upload or drag and drop
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            JPG, PNG or WEBP (max 20MB)
                        </p>
                    </div>
                </div>

                {/* Image Previews */}
                {formData.imagePreviews?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <AnimatePresence>
                            {formData.imagePreviews.map((preview: string, idx: number) => (
                                <motion.div
                                    key={preview}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative aspect-[4/3] rounded-lg overflow-hidden group shadow-sm bg-gray-100 dark:bg-gray-800"
                                >
                                    <Image
                                        src={preview}
                                        alt={`Preview ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-sm"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                    {idx === 0 && (
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur-sm">
                                            Main Photo
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Add More Button (small) */}
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                        >
                            <Camera className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold">Add More</span>
                        </button>
                    </div>
                )}
            </QuestionCard>

            {/* 2. VIN & Basic Info - Only show after photos are uploaded */}
            <AnimatePresence>
                {formData.images?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* VIN Input */}
                        <QuestionCard title="VIN Number" subtitle="Enter VIN for automatic decoding (Recommended)">
                            <div className="relative">
                                <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    value={formData.vin || ""}
                                    onChange={(e) => updateFormData({ vin: e.target.value.toUpperCase() })}
                                    placeholder="Enter 17-character VIN"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase font-mono tracking-wider text-lg"
                                    maxLength={17}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {formData.vin?.length === 17 ? (
                                        <span className="text-green-500 flex items-center gap-1 text-sm font-medium animate-in fade-in slide-in-from-right-2">
                                            <CheckCircle className="h-4 w-4" /> Valid Format
                                        </span>
                                    ) : (
                                        formData.vin?.length > 0 && (
                                            <span className="text-gray-400 text-xs font-mono">
                                                {formData.vin.length}/17
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                <Info className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                                <p>Skip if unavailable. We can likely detect it from your photos later.</p>
                            </div>
                        </QuestionCard>

                        {/* Condition Type */}
                        <QuestionCard title="Condition & Fuel">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Condition</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {["New", "Used", "Nearly-new"].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => updateFormData({ conditionType: type })}
                                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${formData.conditionType === type
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                    }`}
                                            >
                                                <div className={`h-5 w-5 rounded-full border-2 absolute top-4 right-4 flex items-center justify-center transition-colors ${formData.conditionType === type ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                                                    }`}>
                                                    {formData.conditionType === type && <div className="h-2 w-2 bg-white rounded-full" />}
                                                </div>
                                                <Car className={`h-8 w-8 mb-3 transition-colors ${formData.conditionType === type ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
                                                    }`} />
                                                <h3 className="font-bold text-gray-900 dark:text-white">{type}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {type === "New" ? "0 km mileage, never registered" :
                                                        type === "Nearly-new" ? "Low mileage demo/display car" :
                                                            "Has previous owners"}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Fuel Type - Visual separation */}
                                <motion.div
                                    initial={false}
                                    animate={{ opacity: formData.conditionType ? 1 : 0.4, pointerEvents: formData.conditionType ? 'auto' : 'none' }}
                                >
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Fuel Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            "Petrol", "Diesel", "LPG", "Electric",
                                            "Hybrid", "Plug-in Hybrid", "Mild Hybrid", "Other"
                                        ].map((fuel) => (
                                            <button
                                                key={fuel}
                                                onClick={() => updateFormData({ fuel: fuel })}
                                                className={`px-4 py-3 rounded-xl border transition-all font-medium text-sm flex items-center justify-center gap-2 ${formData.fuel === fuel
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]"
                                                    : "bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                                                    }`}
                                            >
                                                {fuel}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </QuestionCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Continue Button */}
            {/* Navigation - Static */}
            <div className="mt-8 flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={nextStep}
                    disabled={!canProceed}
                    className={`px-8 py-2.5 rounded-lg font-bold text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg ${canProceed
                        ? "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
                        : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50"
                        }`}
                >
                    Next Step <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            <div className="h-8" /> {/* Spacer */}
        </div>
    );
}
