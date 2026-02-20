"use client";
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../../components/website/Navbar';
import { Footer } from '../../components/website/Footer';
import DiscoveryCard from '../../components/website/DiscoveryCard';
import { getAllCars } from '../../services/carService';
import { getInteractedCars, likeCar, passCar, resetDiscoveryInteractions } from '../../services/userService';
import { useAuth } from '../../lib/auth/AuthContext';
import { AlertCircle, RefreshCw, Filter, Heart } from 'lucide-react';
import Link from 'next/link';

export default function DiscoveryPage() {
    const [cars, setCars] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isSignedIn, getToken } = useAuth();

    useEffect(() => {
        loadCars();
    }, [isSignedIn]);

    const loadCars = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllCars();
            let likedIds = [];
            let passedIds = [];

            if (isSignedIn) {
                try {
                    const interacted = await getInteractedCars(getToken);
                    likedIds = interacted.likedCars.map(id => id.toString());
                    passedIds = interacted.passedCars.map(id => id.toString());

                    // Sync with localStorage for consistency
                    localStorage.setItem('ojest_liked_cars', JSON.stringify(likedIds));
                    localStorage.setItem('ojest_passed_cars', JSON.stringify(passedIds));
                } catch (err) {
                    console.error("Failed to fetch interacted cars from DB:", err);
                    likedIds = JSON.parse(localStorage.getItem('ojest_liked_cars') || '[]');
                    passedIds = JSON.parse(localStorage.getItem('ojest_passed_cars') || '[]');
                }
            } else {
                likedIds = JSON.parse(localStorage.getItem('ojest_liked_cars') || '[]');
                passedIds = JSON.parse(localStorage.getItem('ojest_passed_cars') || '[]');
            }

            const interactedIds = [...likedIds, ...passedIds];

            // Filter out interacted cars
            const filtered = data.filter(car => !interactedIds.includes(car._id));

            // Shuffle filtered cars for randomized discovery experience
            const shuffled = [...filtered].sort(() => Math.random() - 0.5);
            setCars(shuffled);
        } catch (err) {
            console.error("Discovery Page Error:", err);
            setError("Failed to load cars. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = (direction, car) => {
        // 1. Move to next card immediately for UI smoothness
        setCurrentIndex(prev => prev + 1);

        // 2. Process data in background
        const isLike = direction === 'right';
        const storageKey = isLike ? 'ojest_liked_cars' : 'ojest_passed_cars';

        // Update Local Storage
        const currentInteracted = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!currentInteracted.includes(car._id)) {
            currentInteracted.push(car._id);
            localStorage.setItem(storageKey, JSON.stringify(currentInteracted));
        }

        // Update DB if signed in (non-blocking)
        if (isSignedIn) {
            const updateDB = async () => {
                try {
                    if (isLike) {
                        await likeCar(car._id, getToken);
                    } else {
                        await passCar(car._id, getToken);
                    }
                } catch (err) {
                    console.error(`Failed to save ${direction} to DB:`, err);
                }
            };
            updateDB();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-main flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center p-6 py-24 relative overflow-hidden">
                {/* Visual Flair Backgrounds */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20 dark:opacity-10">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-400 rounded-full blur-[120px]" />
                </div>

                {/* Header Info */}
                <div className="text-center mb-10 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-600/20">
                        <img src="/logooo.png" alt="Ojest" className="h-3.5 w-3.5" />
                        Ojest Discovery Beta
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase italic">
                        Find Your <span className="text-blue-600 dark:text-blue-400">Match</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                        Swipe through {cars.length > 0 ? cars.length : 'premium'} hand-picked listings
                    </p>
                </div>

                {/* The Stack */}
                <div className="relative w-full max-w-[380px] md:max-w-[440px] h-[620px] md:h-[750px] z-10 transition-all">
                    {loading ? (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                <img src="/logooo.png" alt="Ojest" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8" />
                            </div>
                            <p className="mt-8 font-black text-gray-900 dark:text-white uppercase tracking-widest animate-pulse">Scanning the market...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Engines stalled</h3>
                            <p className="text-gray-500 font-medium mb-8">{error}</p>
                            <button
                                onClick={loadCars}
                                className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold flex items-center gap-2"
                            >
                                <RefreshCw className="h-5 w-5" /> Try Again
                            </button>
                        </div>
                    ) : currentIndex >= cars.length ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-8">
                                <img src="/logooo.png" alt="Ojest" className="h-10 w-10" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase italic leading-none">That's all for now!</h3>
                            <p className="text-gray-500 font-bold mb-10 leading-relaxed text-sm">
                                You've swiped through all available cars.
                                We update our listings every hour, so check back shortly!
                            </p>
                            <div className="flex flex-col w-full gap-3">
                                <Link href="/wishlist" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/25 active:scale-95 transition-transform uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                                    <Heart className="h-4 w-4 fill-white" /> View Wishlist
                                </Link>
                                <button onClick={async () => {
                                    localStorage.removeItem('ojest_passed_cars');
                                    localStorage.removeItem('ojest_liked_cars');
                                    if (isSignedIn) {
                                        try {
                                            await resetDiscoveryInteractions(getToken);
                                        } catch (err) {
                                            console.error("Failed to reset DB interactions:", err);
                                        }
                                    }
                                    loadCars();
                                    setCurrentIndex(0);
                                }} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black active:scale-95 transition-transform uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                                    <RefreshCw className="h-4 w-4" /> Reset Discovery
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="relative h-full w-full perspective-1000">
                            <AnimatePresence initial={false}>
                                {cars.slice(currentIndex, currentIndex + 3).reverse().map((car, index, array) => {
                                    const displayIndex = array.length - 1 - index; // 0 is top
                                    return (
                                        <DiscoveryCard
                                            key={car._id}
                                            car={car}
                                            index={displayIndex}
                                            active={displayIndex === 0}
                                            onSwipe={handleSwipe}
                                        />
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>


            </main>

            <Footer />
        </div>
    );
}

const X = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
