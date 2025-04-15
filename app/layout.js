import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import VideoLoaderWrapper from "../components/website/VideoLoaderWrapper";

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

  // If we're in a static build, don't use ClerkProvider
  if (isStaticBuild) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

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
              });
            `,
            }}
          />
        </head>
        <body>
          <div className="loader-container">
            <VideoLoaderWrapper />
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
