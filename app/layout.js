import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { Suspense } from "react";
import VideoLoaderWrapper from "../components/website/VideoLoaderWrapper";
import { GoogleMapsProvider } from "../lib/GoogleMapsContext";
import Providers from "../components/Providers";
import CookieConsent from "../components/website/CookieConsent";
import ErrorBoundary from "../components/ErrorBoundary";

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
      suppressHydrationWarning
      className="loading-active"
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: loaderStyles }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Show loader only on home page initial load
            const isInitialLoad = !sessionStorage.getItem('hasNavigated');
            const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
            
            if (isInitialLoad && isHomePage) {
              document.documentElement.classList.add('loading-active');
              sessionStorage.setItem('hasNavigated', 'true');
            } else {
              // Remove loading-active class for non-home pages or subsequent loads
              document.documentElement.classList.remove('loading-active');
              const loaderContainer = document.querySelector('.loader-container');
              if (loaderContainer) {
                loaderContainer.style.display = 'none';
                loaderContainer.style.pointerEvents = 'none';
              }
            }
            
            window.addEventListener('loaderComplete', function() {
              document.documentElement.classList.remove('loading-active');
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
        <ErrorBoundary>
          <div className="loader-container">
            <Suspense
              fallback={
                <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              }
            >
              <VideoLoaderWrapper />
            </Suspense>
          </div>
          <Providers>
            <GoogleMapsProvider>{children}</GoogleMapsProvider>
          </Providers>
          <CookieConsent />
        </ErrorBoundary>
      </body>
    </html>
  );
}
