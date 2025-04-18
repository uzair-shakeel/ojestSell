"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Initial placeholder loader that displays immediately
const LoaderPlaceholder = () => (
  <div className="fixed inset-0 z-[9999] bg-white">
    {/* Simple top progress bar */}
    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200">
      <div className="h-full w-1/4 bg-black animate-pulse"></div>
    </div>
  </div>
);

// Pre-load the VideoLoader component
const VideoLoader = dynamic(() => import("./VideoLoader"), {
  ssr: false,
  loading: () => <LoaderPlaceholder />,
});

const VideoLoaderWrapper = () => {
  const [mounted, setMounted] = useState(false);

  // Make sure component is mounted before rendering
  useEffect(() => {
    setMounted(true);

    // Set up cleanup function
    return () => {
      // Make sure loading-active class is removed when this component unmounts
      document.documentElement.classList.remove("loading-active");
    };
  }, []);

  if (!mounted) return <LoaderPlaceholder />;

  return <VideoLoader />;
};

export default VideoLoaderWrapper;
