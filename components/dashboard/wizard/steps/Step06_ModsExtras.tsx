"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, GaugeCircle, Package, Plus, X } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";

interface Step06Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

const COMMON_MODS = ["Tinted Windows", "Performance Exhaust", "ECU Tune", "Lowering Springs", "Custom Rims", "Spoiler", "Wrapped Body", "Upgraded Sound System"];
const COMMON_EXTRAS = ["Winter Tires", "Roof Rack", "Car Cover", "Rubber Mats", "Spare Key", "Service Book", "Battery Charger"];

export default function Step06_ModsExtras({ formData, updateFormData, nextStep, prevStep }: Step06Props) {
    const [modInput, setModInput] = useState("");
    const [extraInput, setExtraInput] = useState("");

    const toggleItem = (field: string, item: string) => {
        const currentList = formData[field] || [];
        const newList = currentList.includes(item)
            ? currentList.filter((i: string) => i !== item)
            : [...currentList, item];
        updateFormData({ [field]: newList });
    };

    const addCustomItem = (field: string, input: string, setInput: (v: string) => void) => {
        if (input.trim()) {
            const currentList = formData[field] || [];
            if (!currentList.includes(input.trim())) {
                updateFormData({ [field]: [...currentList, input.trim()] });
            }
            setInput("");
        }
    };

    return (
        <div className="space-y-6">
            <QuestionCard title="Modifications & Extras" subtitle="Any upgrades or additional items included?">

                {/* Modifications */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100">
                        <GaugeCircle className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-lg">Modifications</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {COMMON_MODS.map((item) => (
                            <button
                                key={item}
                                onClick={() => toggleItem("modifications", item)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${(formData.modifications || []).includes(item)
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                    : "bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 max-w-md">
                        <input
                            type="text"
                            value={modInput}
                            onChange={(e) => setModInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomItem("modifications", modInput, setModInput)}
                            placeholder="Add other mod..."
                            className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-bg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={() => addCustomItem("modifications", modInput, setModInput)}
                            className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                    {/* Show custom added mods that are not in common list */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {(formData.modifications || []).filter((m: string) => !COMMON_MODS.includes(m)).map((item: string) => (
                            <div key={item} className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm border border-blue-100 dark:border-blue-800">
                                <span>{item}</span>
                                <button onClick={() => toggleItem("modifications", item)} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Extras */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100">
                        <Package className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-lg">Included Extras</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {COMMON_EXTRAS.map((item) => (
                            <button
                                key={item}
                                onClick={() => toggleItem("extras", item)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${(formData.extras || []).includes(item)
                                    ? "bg-green-600 text-white border-green-600 shadow-md"
                                    : "bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 max-w-md">
                        <input
                            type="text"
                            value={extraInput}
                            onChange={(e) => setExtraInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomItem("extras", extraInput, setExtraInput)}
                            placeholder="Add other extra..."
                            className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-bg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <button
                            onClick={() => addCustomItem("extras", extraInput, setExtraInput)}
                            className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-green-100 hover:text-green-600 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                    {/* Show custom added extras not in common list */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {(formData.extras || []).filter((e: string) => !COMMON_EXTRAS.includes(e)).map((item: string) => (
                            <div key={item} className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm border border-green-100 dark:border-green-800">
                                <span>{item}</span>
                                <button onClick={() => toggleItem("extras", item)} className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </QuestionCard>

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
                    Next Step <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            <div className="h-8" />
        </div>
    );
}
