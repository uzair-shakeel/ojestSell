"use client";

import { LanguageProvider } from "../lib/i18n/LanguageContext";
import { AuthProvider } from "../lib/auth/AuthContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-right" />
        <style jsx global>{`
          #_rht_toaster {
            z-index: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `}</style>
      </AuthProvider>
    </LanguageProvider>
  );
}
