"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, Check, Loader2, AlertCircle } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { generateCarListing } from "../../../../services/carService";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { motion } from "framer-motion";

interface Step11Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step11_AIPreview({ formData, updateFormData, nextStep, prevStep }: Step11Props) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generated, setGenerated] = useState(false);

    // Auto-generate on mount if not already done
    useEffect(() => {
        if (!formData.generatedListing && !generated && !loading) {
            generateListing();
        }
    }, []);

    const generateListing = async () => {
        setLoading(true);
        setError(null);
        try {
            // Prioritize description field if user wrote something, but also use AI to enhance it?
            // Or if description is empty, generate it.
            // Typically we send all data to AI.

            const promptData = {
                make: formData.make,
                model: formData.model,
                year: formData.year,
                mileage: formData.mileage,
                condition: formData.conditionType,
                equipment: formData.equipment,
                modifications: formData.modifications,
                extras: formData.extras,
                userNotes: formData.description, // User inputs
            };

            // Call API
            // If API fails or is not implemented, fallback to local generation
            let listingText = "";
            try {
                const res = await generateCarListing(promptData, getToken);
                listingText = res.listing;
            } catch (e) {
                console.warn("AI Generation failed, falling back to template", e);
                // Fallback template
                listingText = `FOR SALE: ${formData.year} ${formData.make} ${formData.model} ${formData.trim || ''}\n\n` +
                    `Mileage: ${formData.mileage}km\n` +
                    `Price: ${formData.price} ${formData.currency}\n\n` +
                    `This vehicle is in ${formData.conditionType} condition. ` +
                    (formData.equipment?.length ? `Equipped with: ${formData.equipment.join(", ")}. ` : "") +
                    (formData.description ? `\n\nSeller Notes: ${formData.description}` : "");
            }

            updateFormData({ generatedListing: listingText });
            setGenerated(true);
        } catch (err) {
            setError("Failed to generate listing. You can write it manually.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <QuestionCard title="AI Listing Preview" subtitle="Our AI has drafted a listing for you based on your inputs.">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative">
                            <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-sky-500 rounded-full flex items-center justify-center animate-pulse">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-sky-400 rounded-full blur opacity-30 animate-ping" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-2">Crafting your listing...</h3>
                        <p className="text-gray-500 max-w-sm">Analyzing features, condition, and market data to write the perfect description.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Generated Content */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-dark-bg">
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-500" />
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">AI Draft</span>
                                </div>
                                <button
                                    onClick={generateListing}
                                    className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                                >
                                    <RefreshCw className="h-3 w-3" /> Regenerate
                                </button>
                            </div>
                            <textarea
                                value={formData.generatedListing || ""}
                                onChange={(e) => updateFormData({ generatedListing: e.target.value })}
                                className="w-full p-6 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 min-h-[300px] leading-relaxed resize-y font-serif text-lg"
                            />
                            <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/10 text-xs text-yellow-700 dark:text-yellow-400 border-t border-yellow-100 dark:border-yellow-900/20">
                                Review carefully. Statistics show structured listings sell 2x faster.
                            </div>
                        </div>
                    </div>
                )}

            </QuestionCard>

            {/* Navigation */}
            {/* Navigation - Static */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={prevStep}
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <button
                    onClick={nextStep}
                    className="px-8 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                    Review & Publish <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
