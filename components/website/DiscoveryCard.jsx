"use client";
import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Fuel, Gauge, Settings2, MapPin, Heart, X, Info, Activity } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export default function DiscoveryCard({ car, onSwipe, active, index }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

    // Smooth appearance of "LIKE" and "SKIP" stamps
    const skipOpacity = useTransform(x, [-150, -50], [1, 0]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            onSwipe('right', car);
        } else if (info.offset.x < -100) {
            onSwipe('left', car);
        }
    };

    const formatCarImage = (imagePath) => {
        if (!imagePath) return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&auto=format&fit=crop";
        if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
            return imagePath;
        }
        return `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
    };

    const toTitleCase = (text) =>
        text ? text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Car";

    return (
        <motion.div
            style={{
                x,
                rotate,
                opacity,
                zIndex: active ? 50 : 10 - index,
                scale: active ? 1 : 0.95 - (index * 0.05),
                y: active ? 0 : index * 10
            }}
            drag={active ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`absolute inset-0 select-none ${active ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
        >
            {/* Swiping indicators */}
            <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute top-8 left-6 md:top-12 md:left-10 z-30 border-4 border-green-500 rounded-xl px-4 py-1.5 md:px-6 md:py-2 bg-green-500/10 rotate-[-20deg] pointer-events-none"
            >
                <span className="text-2xl md:text-4xl font-black text-green-500 uppercase tracking-tighter">LIKE</span>
            </motion.div>

            <motion.div
                style={{ opacity: skipOpacity }}
                className="absolute top-8 right-6 md:top-12 md:right-10 z-30 border-4 border-red-500 rounded-xl px-4 py-1.5 md:px-6 md:py-2 bg-red-500/10 rotate-[20deg] pointer-events-none"
            >
                <span className="text-2xl md:text-4xl font-black text-red-500 uppercase tracking-tighter">SKIP</span>
            </motion.div>

            {/* Card Content */}
            <div className="h-full w-full bg-white dark:bg-gray-900 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800 flex flex-col">
                {/* Image Section */}
                <div className="relative flex-1 group">
                    <img
                        src={formatCarImage(car.images?.[0])}
                        className="h-full w-full object-cover select-none pointer-events-none"
                        alt={`${car.make} ${car.model}`}
                    />

                    {/* Overlays */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-6 left-6 md:top-8 md:left-8 flex flex-col gap-2">
                        {car.isFeatured && (
                            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 md:gap-1.5 shadow-lg">
                                <img src="/logooo.png" alt="Ojest" className="h-2.5 w-2.5 md:h-3 md:w-3" /> Featured
                            </div>
                        )}
                        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/20">
                            {car.condition || 'Used'}
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 text-white">
                        <div className="flex flex-col gap-1 mb-3 md:mb-4">
                            <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight drop-shadow-md">
                                {car.year} {toTitleCase(car.make)} {toTitleCase(car.model)}
                            </h2>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-400" />
                                <span className="text-xs md:text-sm font-bold text-gray-300">Warsaw, Poland</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-xl md:text-2xl font-black text-blue-400">
                                {car.financialInfo?.priceNetto?.toLocaleString('pl-PL') || "Contact"} <span className="text-xs uppercase">zł</span>
                            </div>
                            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                <Info className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specs Grid */}
                <div className="p-6 md:p-8 pb-8 md:pb-10 bg-white dark:bg-gray-950">
                    <div className="grid grid-cols-2 gap-x-6 md:gap-x-8 gap-y-4 md:gap-y-6 mb-6 md:mb-8">
                        <SpecItem icon={<Gauge />} label="Mileage" value={`${car.mileage?.toLocaleString('pl-PL') || "0"} km`} />
                        <SpecItem icon={<Settings2 />} label="Trans" value={car.transmission || "Auto"} />
                        <SpecItem icon={<Fuel />} label="Fuel" value={car.fuel || "Petrol"} />
                        <SpecItem icon={<Activity />} label="Engine" value={car.engine ? `${car.engine} cm3` : "2.0 TSI"} />
                    </div>

                    <div className="flex gap-3 md:gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSwipe('left', car); }}
                            className="flex-1 py-3.5 md:py-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl font-black text-xs md:text-sm text-gray-900 dark:text-white hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 md:gap-2 border border-gray-100 dark:border-gray-700 active:scale-95"
                        >
                            <X className="w-4 h-4 md:w-5 md:h-5 text-red-500" /> Pass
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSwipe('right', car); }}
                            className="flex-[2] py-3.5 md:py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 md:gap-2"
                        >
                            <Heart className="w-4 h-4 md:w-5 md:h-5 fill-white" /> I'm Interested
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SpecItem({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-blue-600 dark:text-blue-400">
                {React.cloneElement(icon, { className: "w-5 h-5" })}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{value}</p>
            </div>
        </div>
    );
}
