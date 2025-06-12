import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import VideoLoaderWrapper from "../components/website/VideoLoaderWrapper";
import { GoogleMapsProvider } from "../lib/GoogleMapsContext";

// Add specific CSS to ensure content doesn't flash before loader
const loaderStyles = `
  html.loading-active body > *:not(.loader-container) {
    visibility: hidden;
    opacity: 0;
  }
  
  .loader-container {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
  }
  
  .loader-container > * {
    pointer-events: auto;
  }
  
  html:not(.loading-active) .loader-container {
    display: none;
  }
`;

export const metadata = {
  title: "OjestSell - Premium Car Marketplace",
  description:
    "Find, buy, and sell premium cars on OjestSell - the ultimate car marketplace.",
};

export default function RootLayout({ children }) {
  // Check if we're in a static build environment
  const isStaticBuild = process.env.NEXT_PHASE === "phase-production-build";

  return (
    <ClerkProvider>
      <html
        lang="en"
        data-theme="light"
        suppressHydrationWarning
        className="loading-active"
      >
        <head>
          <style dangerouslySetInnerHTML={{ __html: loaderStyles }} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              document.documentElement.classList.add('loading-active');
              window.addEventListener('loaderComplete', function() {
                document.documentElement.classList.remove('loading-active');
                // Clean up any loader elements
                const loaderContainer = document.querySelector('.loader-container');
                if (loaderContainer) {
                  loaderContainer.style.display = 'none';
                  loaderContainer.style.pointerEvents = 'none';
                }
              });
            `,
            }}
          />
        </head>
        <body>
          <div className="loader-container">
            <VideoLoaderWrapper />
          </div>
          <GoogleMapsProvider>{children}</GoogleMapsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
