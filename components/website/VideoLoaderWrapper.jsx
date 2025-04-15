"use client";
import React from "react";
import dynamic from "next/dynamic";

// Pre-load the VideoLoader component
const VideoLoader = dynamic(() => import("./VideoLoader"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[9999] bg-white">
      {/* Simple top progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200">
        <div className="h-full w-1/4 bg-black animate-pulse"></div>
      </div>
    </div>
  ),
});

const VideoLoaderWrapper = () => {
  return <VideoLoader />;
};

export default VideoLoaderWrapper;
