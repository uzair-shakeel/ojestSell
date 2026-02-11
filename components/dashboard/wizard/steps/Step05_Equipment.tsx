"use client";

import { ArrowLeft, ArrowRight, Shield, Armchair, CircuitBoard, Lightbulb } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";

interface Step05Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

const EQUIPMENT_CATEGORIES = [
    {
        id: "safety",
        label: "Safety & Assistance",
        icon: Shield,
        items: ["ABS", "ESP", "Airbags", "ISOFIX", "Blind Spot Monitor", "Lane Assist", "Traffic Sign Recog.", "Fatigue Detection"]
    },
    {
        id: "interior",
        label: "Interior & Comfort",
        icon: Armchair,
        items: ["Leather Seats", "Heated Seats", "Ventilated Seats", "Electric Seats", "Memory Seats", "Sunroof", "Panoramic Roof", "Auto Climate Control", "Heated Steering Wheel"]
    },
    {
        id: "tech",
        label: "Multimedia & Tech",
        icon: CircuitBoard,
        items: ["Navigation", "Apple CarPlay", "Android Auto", "Bluetooth", "Digital Cockpit", "Head-up Display", "Premium Sound", "Wireless Charging"]
    },
    {
        id: "exterior",
        label: "Exterior & Convenience",
        icon: Lightbulb,
        items: ["LED Headlights", "Matrix LED", "Xenon", "Alloy Wheels", "Tow Bar", "Roof Rails", "Keyless Entry", "Power Tailgate", "Reverse Camera", "360 Camera", "Parking Sensors"]
    }
];

export default function Step05_Equipment({ formData, updateFormData, nextStep, prevStep }: Step05Props) {

    const toggleEquipment = (item: string) => {
        const currentList = formData.equipment || [];
        const newList = currentList.includes(item)
            ? currentList.filter((i: string) => i !== item)
            : [...currentList, item];

        updateFormData({ equipment: newList });
    };

    return (
        <div className="space-y-6">
            <QuestionCard title="Feature Checklist" subtitle="Select all that apply. More features often mean a higher value!">
                <div className="space-y-10">
                    {EQUIPMENT_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div key={category.id} className="p-1 px-2">
                                <div className="flex items-center gap-3 mb-5 group">
                                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">{category.label}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {category.items.map((item) => {
                                        const isSelected = (formData.equipment || []).includes(item);
                                        return (
                                            <button
                                                key={item}
                                                onClick={() => toggleEquipment(item)}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${isSelected
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]"
                                                    : "bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400"
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </QuestionCard>

            {/* Navigation - Static */}
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
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
