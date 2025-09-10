import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import VideoLoaderWrapper from "../components/website/VideoLoaderWrapper";
import { GoogleMapsProvider } from "../lib/GoogleMapsContext";
import Providers from "../components/Providers";
import CookieConsent from "../components/website/CookieConsent";

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
            // Only show loader on initial page load, not on navigation
            const isInitialLoad = !sessionStorage.getItem('hasNavigated');
            if (isInitialLoad) {
              document.documentElement.classList.add('loading-active');
              sessionStorage.setItem('hasNavigated', 'true');
            }
            
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
        <Providers>
          <GoogleMapsProvider>{children}</GoogleMapsProvider>
        </Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
