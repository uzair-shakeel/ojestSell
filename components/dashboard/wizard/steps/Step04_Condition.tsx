"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Wrench, Users, Warehouse, AlertTriangle, Eye, Plus, X } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";

interface Step04Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step04_Condition({ formData, updateFormData, nextStep, prevStep }: Step04Props) {
    const [issueInput, setIssueInput] = useState("");
    const [flawInput, setFlawInput] = useState("");

    const addIssue = () => {
        if (issueInput.trim() && (formData.knownIssues || []).length < 5) {
            updateFormData({ knownIssues: [...(formData.knownIssues || []), { text: issueInput.trim(), source: 'Seller' }] });
            setIssueInput("");
        }
    };

    const addFlaw = () => {
        if (flawInput.trim() && (formData.visibleFlaws || []).length < 5) {
            updateFormData({ visibleFlaws: [...(formData.visibleFlaws || []), { text: flawInput.trim(), source: 'Seller' }] });
            setFlawInput("");
        }
    };

    const removeItem = (field: string, index: number) => {
        const list = [...(formData[field] || [])];
        list.splice(index, 1);
        updateFormData({ [field]: list });
    };

    const renderToggleGroup = (field: string, options: string[], icons: any[]) => (
        <div className="grid grid-cols-3 gap-2">
            {options.map((option, idx) => {
                const Icon = icons[idx] || ShieldCheck;
                const isSelected = formData[field] === option;
                return (
                    <button
                        key={option}
                        onClick={() => updateFormData({ [field]: option })}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                            : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        <Icon className={`h-6 w-6 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
                        <span className="text-sm font-medium">{option}</span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="space-y-6">
            <QuestionCard title="Vehicle History & Condition" subtitle="Be honest - transparency builds trust with buyers.">
                <div className="space-y-8">

                    {/* Accident History */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Accident History *</label>
                        {renderToggleGroup("accidentHistory", ["No Accidents", "Accident Reported", "Unknown"], [ShieldCheck, AlertTriangle, Users])}
                    </div>

                    {/* Service History */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Service History</label>
                        {renderToggleGroup("serviceHistory", ["Full History", "Partial History", "Unknown"], [Wrench, Wrench, Users])}
                    </div>

                    {/* Ownership */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Previous Owners</label>
                        {renderToggleGroup("ownership", ["First Owner", "2+ Owners", "Unknown"], [Users, Users, Users])}
                    </div>

                    {/* Storage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Where is it kept?</label>
                        {renderToggleGroup("storage", ["Garage", "Outside", "Mixed"], [Warehouse, Warehouse, Warehouse])}
                    </div>

                </div>
            </QuestionCard>

            <QuestionCard title="Issues & Flaws" subtitle="Optional. Add up to 5 items each.">
                <div className="space-y-6">
                    {/* Known Issues */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Known Technical Issues</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={issueInput}
                                onChange={(e) => setIssueInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addIssue()}
                                placeholder="e.g. AC needs recharge"
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-bg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                onClick={addIssue}
                                disabled={!issueInput.trim()}
                                className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <AnimatePresence>
                                {(formData.knownIssues || []).map((item: any, idx: number) => (
                                    <motion.div
                                        key={`issue-${idx}`}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-700 dark:text-red-300">{item.text}</span>
                                        </div>
                                        <button onClick={() => removeItem('knownIssues', idx)} className="text-gray-400 hover:text-red-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Visible Flaws */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visible Flaws (Scratches/Dents)</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={flawInput}
                                onChange={(e) => setFlawInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addFlaw()}
                                placeholder="e.g. Scratch on rear bumper"
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-bg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                onClick={addFlaw}
                                disabled={!flawInput.trim()}
                                className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <AnimatePresence>
                                {(formData.visibleFlaws || []).map((item: any, idx: number) => (
                                    <motion.div
                                        key={`flaw-${idx}`}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4 text-amber-500" />
                                            <span className="text-sm text-amber-700 dark:text-amber-300">{item.text}</span>
                                        </div>
                                        <button onClick={() => removeItem('visibleFlaws', idx)} className="text-gray-400 hover:text-amber-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
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
