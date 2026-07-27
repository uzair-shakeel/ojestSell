import "./globals.css";
import React from "react";
import Providers from "../components/Providers";
import CookieConsent from "../components/website/CookieConsent";
import ErrorBoundary from "../components/ErrorBoundary";
import ScrollToTop from "../components/ScrollToTop";

export const metadata = {
  title: "OjestSell - Premium Car Marketplace",
  description:
    "Find, buy, and sell premium cars on OjestSell - the ultimate car marketplace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        <ErrorBoundary>
          <Providers>
            <ScrollToTop />
            {children}
          </Providers>
          <CookieConsent />
        </ErrorBoundary>
      </body>
    </html>
  );
}
