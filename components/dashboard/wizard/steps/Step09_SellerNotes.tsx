"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, FileSignature, User, Building2 } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";

interface Step09Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step09_SellerNotes({ formData, updateFormData, nextStep, prevStep }: Step09Props) {

    return (
        <div className="space-y-6">
            <QuestionCard title="Seller Information" subtitle="Tell buyers about yourself and the transaction terms.">

                {/* Sell Options */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-4">Opcje Sprzedaży</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "longTermRental", label: "Wynajem długoterminowy" },
                            { id: "leasing", label: "Leasing" },
                            { id: "financing", label: "Finansowanie/Kredyt" },
                            { id: "cash", label: "Gotówka" }
                        ].map((option) => (
                            <div key={option.id}
                                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${formData.sellOptions?.[option.id]
                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500"
                                    : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                                onClick={() => updateFormData({
                                    sellOptions: { ...formData.sellOptions, [option.id]: !formData.sellOptions?.[option.id] }
                                })}
                            >
                                <div className={`h-5 w-5 rounded border mr-3 flex items-center justify-center transition-colors ${formData.sellOptions?.[option.id]
                                    ? "bg-blue-500 border-blue-500"
                                    : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                                    }`}>
                                    {formData.sellOptions?.[option.id] && <div className="h-2.5 w-2.5 bg-white rounded-[1px]" />}
                                </div>
                                <span className="font-semibold text-gray-700 dark:text-gray-200">{option.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sale Method */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-4">Sposób Sprzedaży</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "invoice", label: "Faktura" },
                            { id: "vatInvoice", label: "Faktura VAT" },
                            { id: "saleAgreement", label: "Umowa Kupna Sprzedaży" }
                        ].map((option) => (
                            <div key={option.id}
                                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${formData.saleMethod?.[option.id]
                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500"
                                    : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                                onClick={() => updateFormData({
                                    saleMethod: { ...formData.saleMethod, [option.id]: !formData.saleMethod?.[option.id] }
                                })}
                            >
                                <div className={`h-5 w-5 rounded border mr-3 flex items-center justify-center transition-colors ${formData.saleMethod?.[option.id]
                                    ? "bg-blue-500 border-blue-500"
                                    : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                                    }`}>
                                    {formData.saleMethod?.[option.id] && <div className="h-2.5 w-2.5 bg-white rounded-[1px]" />}
                                </div>
                                <span className="font-semibold text-gray-700 dark:text-gray-200">{option.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-4">Cena</h3>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">€</span>
                        <input
                            type="number"
                            value={formData.price || ""}
                            onChange={(e) => updateFormData({ price: e.target.value })}
                            placeholder="Wprowadź cenę"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Featured */}
                <div className="mb-8">
                    <div
                        className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${formData.isFeatured
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500"
                            : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700"
                            }`}
                        onClick={() => updateFormData({ isFeatured: !formData.isFeatured })}
                    >
                        <div className={`mt-1 h-5 w-5 rounded border mr-3 flex-shrink-0 flex items-center justify-center transition-colors ${formData.isFeatured
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                            }`}>
                            {formData.isFeatured && <div className="h-2.5 w-2.5 bg-white rounded-[1px]" />}
                        </div>
                        <div>
                            <span className="font-semibold text-gray-900 dark:text-white block mb-1">Oznacz jako polecany samochód</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Polecane samochody zostaną wyróżnione i wyeksponowane na stronie głównej oraz w wynikach wyszukiwania.</span>
                        </div>
                    </div>
                </div>

                {/* Description (Keep existing but simplified styling if needed, or put at bottom) */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase mb-2">Opis (Opcjonalnie)</label>
                    <div className="relative">
                        <textarea
                            value={formData.description || ""}
                            onChange={(e) => updateFormData({ description: e.target.value })}
                            placeholder="Dodatkowe informacje dla kupującego..."
                            className="w-full p-4 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                        />
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
