"use client";
import React, { useState, useEffect, useRef } from "react";

const VideoLoader = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Reduced minimum loading time for better performance
    const minimumLoadingTime = 500; // Reduced from 2000ms to 500ms
    const startTime = Date.now();

    // Create more realistic loading simulation with faster progress
    let speed = 25; // Increased initial speed
    let currentProgress = 0;

    const interval = setInterval(() => {
      // Faster progression through loading states
      if (currentProgress < 30) speed = 25;
      else if (currentProgress < 60) speed = 15;
      else if (currentProgress < 80) speed = 8;
      else speed = 5;

      // Add some randomness to make it feel more natural
      const increment = Math.random() * speed + speed / 2;

      currentProgress += increment;

      if (currentProgress >= 100) {
        clearInterval(interval);
        currentProgress = 100;

        // Make sure we've shown the loader for at least the minimum time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

        // Add a delay before hiding the loader
        setTimeout(() => {
          setLoading(false);
          // Dispatch event to notify that loading is complete
          window.dispatchEvent(new Event("loaderComplete"));

          // Make sure the loading-active class is removed
          document.documentElement.classList.remove("loading-active");
        }, remainingTime); // Removed extra 500ms delay
      }

      setProgress(currentProgress);
    }, 100); // Faster interval (was 200ms)

    // Detect when page is fully loaded
    const handleLoad = () => {
      // When the page is loaded, quickly finish the loading animation
      const quickFinish = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10; // Faster progress (was 5)
          if (newProgress >= 100) {
            clearInterval(quickFinish);

            // Make sure we've shown the loader for at least the minimum time
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

            setTimeout(() => {
              setLoading(false);
              // Dispatch event to notify that loading is complete
              window.dispatchEvent(new Event("loaderComplete"));

              // Make sure the loading-active class is removed
              document.documentElement.classList.remove("loading-active");
            }, remainingTime); // Removed extra 500ms delay
            return 100;
          }
          return newProgress;
        });
      }, 30); // Faster interval (was 50ms)
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  // Use a static image instead of video for better performance
  useEffect(() => {
    // Clean up function
    return () => {
      // Make sure loading-active class is removed when component unmounts
      document.documentElement.classList.remove("loading-active");
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white pointer-events-auto transition-opacity duration-700"
      style={{ opacity: loading ? 1 : 0 }}
    >
      <div className="relative w-full h-full">
        {/* Top progress bar */}
        <div className="absolute top-0 left-0 right-0 z-10 h-1.5 bg-gray-200">
          <div
            className="h-full bg-black rounded-r-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Simple logo or brand image instead of video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Loading"
            className="w-32 h-32 object-contain animate-pulse"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoLoader;
