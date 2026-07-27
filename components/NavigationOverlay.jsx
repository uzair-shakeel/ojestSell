"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationOverlayInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  // Hide overlay once the new route has painted
  useEffect(() => {
    setPending(false);
  }, [pathname, searchParams]);

  // Show overlay as soon as an in-app link is clicked (keeps current page visible under blur)
  useEffect(() => {
    const start = () => setPending(true);

    const onClick = (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      // External links
      if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)) {
        return;
      }

      try {
        const next = new URL(href, window.location.origin);
        if (
          next.origin === window.location.origin &&
          next.pathname === window.location.pathname &&
          next.search === window.location.search
        ) {
          return;
        }
        if (next.origin === window.location.origin) {
          start();
        }
      } catch {
        // ignore invalid hrefs
      }
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("ojest:navstart", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("ojest:navstart", start);
    };
  }, []);

  // Safety: never leave overlay stuck
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(false), 8000);
    return () => clearTimeout(t);
  }, [pending]);

  if (!pending) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/50 dark:bg-black/45 backdrop-blur-md transition-opacity"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/80 dark:bg-dark-card/80 px-6 py-5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" />
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300">
          Ładowanie
        </span>
      </div>
    </div>
  );
}

export default function NavigationOverlay() {
  return (
    <Suspense fallback={null}>
      <NavigationOverlayInner />
    </Suspense>
  );
}
