import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import VideoLoaderWrapper from "../components/website/VideoLoaderWrapper";
import { GoogleMapsProvider } from "../lib/GoogleMapsContext";
import Providers from "../components/Providers";
import { reportWebVitals } from "../lib/performance-monitor";

// Optimize font loading with display swap and preload
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false, // Only preload main font
  fallback: ['Courier New', 'monospace'],
});

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
  keywords: "cars, marketplace, buy cars, sell cars, premium cars, automotive",
  authors: [{ name: "OjestSell" }],
  creator: "OjestSell",
  publisher: "OjestSell",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ojestsell.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Add your verification code
  },
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
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <meta name="theme-color" content="#000000" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="OjestSell" />
          
          {/* PWA and Performance */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
          
          {/* DNS Prefetch for external domains */}
          <link rel="dns-prefetch" href="//res.cloudinary.com" />
          <link rel="dns-prefetch" href="//images.unsplash.com" />
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          
          {/* Preconnect to critical domains */}
          <link rel="preconnect" href="https://res.cloudinary.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
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
              
              // Initialize performance monitoring
              if ('performance' in window) {
                // Mark initial navigation
                performance.mark('navigation-start');
                
                // Report when fully loaded
                window.addEventListener('load', function() {
                  performance.mark('page-load-complete');
                });
              }
            `,
            }}
          />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="loader-container">
            <VideoLoaderWrapper />
          </div>
          <Providers>
            <GoogleMapsProvider>{children}</GoogleMapsProvider>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
