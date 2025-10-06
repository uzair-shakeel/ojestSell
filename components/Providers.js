"use client";

import { LanguageProvider } from "../lib/i18n/LanguageContext";
import { AuthProvider } from "../lib/auth/AuthContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}

        <Toaster
          position="top-right"
          containerClassName="pointer-events-none fixed inset-0 z-0"
          toastOptions={{
            className: "pointer-events-auto",
          }}
        />

        {/* Fallback if you’re not using Tailwind */}
        <style jsx global>{`
          #_rht_toaster {
            pointer-events: none !important;
            z-index: 0 !important;
          }
          #_rht_toaster > * {
            pointer-events: auto !important;
          }
        `}</style>
      </AuthProvider>
    </LanguageProvider>
  );
}
