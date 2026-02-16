"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function DiscoveryPromo() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 border border-blue-100 dark:border-blue-800 shadow-sm shadow-blue-500/10">
                            <img src="/logooo.png" alt="Ojest" className="h-4 w-4" />
                            NEW FEATURE
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                            Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400 uppercase italic">Perfect Match.</span>
                        </h2>

                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-lg">
                            Ditch the boring filters. Experience car shopping like never before with
                            <span className="text-gray-900 dark:text-white font-bold"> Ojest Discovery. </span>
                            Swipe through curated listings, find what you love, and skip what you don't.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/discovery"
                                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group w-full sm:w-auto"
                            >
                                Start Swiping <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Stats/Proof */}
                        <div className="mt-12 flex items-center gap-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                            <div>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">10k+</p>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Matches Daily</p>
                            </div>
                            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
                            <div>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">2.5s</p>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Avg. Response</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative mt-12 lg:mt-0 flex justify-center"
                    >
                        {/* Decorative Rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
                            <div className="absolute inset-0 border-2 border-blue-500/5 rounded-full animate-[spin_20s_linear_infinite]" />
                            <div className="absolute inset-10 border border-purple-500/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                        </div>

                        {/* The "Phone" mockup */}
                        <div className="relative w-[280px] h-[520px] md:w-[320px] md:h-[580px] bg-white dark:bg-gray-900 rounded-[2.5rem] md:rounded-[3rem] border-[6px] md:border-[8px] border-gray-900 dark:border-gray-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden z-10">
                            {/* App Header */}
                            <div className="absolute top-0 left-0 w-full h-14 md:h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-20 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 gap-2">
                                <img src="/logooo.png" alt="Logo" className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="text-[10px] md:text-xs font-black tracking-widest text-gray-900 dark:text-white uppercase">OJEST</span>
                            </div>

                            {/* Cards Stack Mockup with Animated Swipe */}
                            <div className="absolute inset-x-2.5 top-16 bottom-20 md:inset-x-3 md:top-20 md:bottom-24 bg-gray-100 dark:bg-gray-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-inner">
                                {/* Bottom Card (Static) */}
                                <div className="absolute inset-0 opacity-40 scale-95 translate-y-2">
                                    <Image src="/Hero2-QKTSHICM.webp" alt="Car Preview" fill className="object-cover grayscale-[50%]" />
                                </div>

                                {/* Top Card (Animated) */}
                                <motion.div
                                    animate={{
                                        x: [0, 100, 0, -100, 0],
                                        rotate: [0, 10, 0, -10, 0],
                                        opacity: [1, 0, 0, 0, 1]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 z-10"
                                >
                                    <Image src="/Hero2-QKTSHICM.webp" alt="Car Preview" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 text-white">
                                        <h4 className="text-lg md:text-xl font-black mb-1">BMW M4 Competition</h4>
                                        <p className="text-[10px] md:text-sm text-white/80 font-medium">2023 • 12,500 km • Warsaw</p>
                                    </div>

                                    {/* Indicators in Mockup */}
                                    <motion.div
                                        animate={{ opacity: [0, 1, 0, 0, 0] }}
                                        transition={{ duration: 6, repeat: Infinity }}
                                        className="absolute top-8 left-4 border-2 border-green-500 rounded px-2 py-0.5 text-green-500 font-black text-[10px] -rotate-12"
                                    > LIKE </motion.div>
                                    <motion.div
                                        animate={{ opacity: [0, 0, 0, 1, 0] }}
                                        transition={{ duration: 6, repeat: Infinity }}
                                        className="absolute top-8 right-4 border-2 border-red-500 rounded px-2 py-0.5 text-red-500 font-black text-[10px] rotate-12"
                                    > SKIP </motion.div>
                                </motion.div>
                            </div>

                            {/* Action Buttons Mockup */}
                            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-3 md:gap-4 px-4 md:px-6">
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-red-500 shadow-lg scale-90 md:scale-100">
                                    <X className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 scale-90 md:scale-100">
                                    <Heart className="h-5 w-5 md:h-6 md:w-6 fill-white" />
                                </div>
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-sky-500 shadow-lg scale-90 md:scale-100">
                                    <Share2 className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}

const X = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
const Check = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
