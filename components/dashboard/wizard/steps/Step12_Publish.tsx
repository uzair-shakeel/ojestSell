"use client";

import { ArrowLeft, Check, Car, DollarSign, Calendar, ShieldCheck, AlertTriangle, Gauge, Fuel, Loader2 } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";

interface Step12Props {
    formData: any;
    updateFormData: (data: any) => void;
    prevStep: () => void;
    handleSubmit: () => void;
    loading: boolean;
}

export default function Step12_Publish({ formData, prevStep, handleSubmit, loading }: Step12Props) {

    const SummaryItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <Icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
                <span className="block text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{value || "-"}</span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-8">
                <QuestionCard title="Publishing…" subtitle="Please wait while we upload your listing.">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="relative mb-6">
                            <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl border border-gray-100 dark:border-gray-700">
                                <img src="/logooo.png" alt="Ojest AI" className="h-12 w-12 object-contain animate-pulse" />
                            </div>
                            <div className="absolute -inset-2 bg-gradient-to-br from-green-400 to-emerald-300 rounded-full blur-lg opacity-20 animate-ping" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Publishing your listing…
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs text-sm leading-relaxed">
                            Uploading photos and saving details. This can take a few seconds — don’t close this page.
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm font-semibold">Working…</span>
                        </div>
                        <div className="mt-4 flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-2 w-2 rounded-full bg-green-500 animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                    </div>
                </QuestionCard>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <QuestionCard title="Ready to Publish?" subtitle="Review your listing summary before going live.">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <SummaryItem icon={Car} label="Vehicle" value={`${formData.make} ${formData.model} ${formData.year}`} />
                    <SummaryItem icon={DollarSign} label="Price" value={`${formData.price} ${formData.currency}`} />
                    <SummaryItem icon={Gauge} label="Mileage" value={`${formData.mileage} km`} />
                    <SummaryItem icon={Fuel} label="Fuel" value={formData.fuel} />
                    <SummaryItem icon={Calendar} label="Reg. Status" value={formData.registrationStatus} />
                    <SummaryItem icon={ShieldCheck} label="Warranty" value={formData.warranty?.hasWarranty ? "Yes" : "No"} />
                </div>

                {/* Missing crucial info warning if any (though required steps should prevent this) */}
                {!formData.images?.length && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Missing photos! Please go back to Step 1.</span>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl border border-green-100 dark:border-green-900/30 text-center">
                    <div className="h-16 w-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4">
                        <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Everything looks great!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                        Your listing is complete with AI-enhanced description and details.
                        Ready to find a buyer?
                    </p>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full max-w-sm py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 hover:shadow-green-500/30"
                    >
                        Publish Listing Now <Check className="h-5 w-5" />
                    </button>
                    <p className="mt-4 text-xs text-gray-400">
                        By publishing, you agree to our Terms of Service. Listing will be pending admin approval.
                    </p>
                </div>

            </QuestionCard>

            {/* Navigation - Static */}
            <div className="mt-8 flex justify-start items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Edit
                </button>
            </div>
        </div>
    );
}
