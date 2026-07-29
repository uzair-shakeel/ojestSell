"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { animate } from "framer-motion";
import { usePathname } from "next/navigation";

const CarImageTransitionContext = createContext(null);

/** Module flag so NavigationOverlay can skip without React coupling */
export const carImageTransitionFlag = {
  active: false,
};

function rectFromElement(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 8 || r.height < 8) return null;
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
  };
}

function readBorderRadius(el) {
  if (!el || typeof window === "undefined") return "1rem";
  return window.getComputedStyle(el).borderRadius || "1rem";
}

function parseRadiusPx(value) {
  if (typeof value !== "string") return 0;
  if (value.includes("rem")) return parseFloat(value) * 16;
  const first = value.split(" ")[0];
  return parseFloat(first) || 0;
}

/**
 * Prefer the already-painted <img> inside the card (Next/Image currentSrc),
 * so the morph reuses pixels that are already on screen.
 * Same-origin Next optimizer URLs can be snapshotted to a data URL for zero-flash paint.
 */
function getReadyImageSrc(sourceEl, fallbackSrc) {
  if (typeof window === "undefined") return null;

  const candidates = [];
  if (sourceEl) {
    sourceEl.querySelectorAll("img").forEach((img) => candidates.push(img));
  }

  for (const img of candidates) {
    if (!(img.complete && img.naturalWidth > 0)) continue;

    // Snapshot avoids a second decode/fetch of a different URL (raw Cloudinary vs /_next/image)
    try {
      const canvas = document.createElement("canvas");
      const maxEdge = 1600;
      const scale = Math.min(
        1,
        maxEdge / Math.max(img.naturalWidth, img.naturalHeight)
      );
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.88);
      }
    } catch {
      // Cross-origin without CORS — fall through to URL
    }

    const src = img.currentSrc || img.src;
    if (src) return src;
  }

  // Fallback URL only if it's already in the browser image cache
  if (fallbackSrc) {
    const probe = new window.Image();
    probe.src = fallbackSrc;
    if (probe.complete && probe.naturalWidth > 0) return fallbackSrc;
  }

  return null;
}

export function CarImageTransitionProvider({ children }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState("idle"); // idle | departing | waiting | morphing | done
  const [payload, setPayload] = useState(null);
  const [visual, setVisual] = useState(null);
  const [mounted, setMounted] = useState(false);

  const phaseRef = useRef(phase);
  const payloadRef = useRef(payload);
  const targetRef = useRef(null); // { carId, el }
  const animControlsRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const morphStartedRef = useRef(false);
  const morphRetryCountRef = useRef(0);

  phaseRef.current = phase;
  payloadRef.current = payload;

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearSafety = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    clearSafety();
    if (animControlsRef.current) {
      animControlsRef.current.stop();
      animControlsRef.current = null;
    }
    carImageTransitionFlag.active = false;
    morphStartedRef.current = false;
    morphRetryCountRef.current = 0;
    setPhase("idle");
    setPayload(null);
    setVisual(null);
  }, [clearSafety]);

  const armSafety = useCallback(() => {
    clearSafety();
    safetyTimerRef.current = setTimeout(() => finish(), 4500);
  }, [clearSafety, finish]);

  const runMorph = useCallback(() => {
    const current = payloadRef.current;
    const target = targetRef.current;
    const currentPhase = phaseRef.current;

    if (!current || !target) return;
    if (String(current.carId) !== String(target.carId)) return;
    if (currentPhase !== "waiting" && currentPhase !== "departing") return;
    if (morphStartedRef.current) return;

    const to = rectFromElement(target.el);
    if (!to) {
      if (morphRetryCountRef.current < 60) {
        morphRetryCountRef.current += 1;
        requestAnimationFrame(() => {
          if (!morphStartedRef.current) runMorph();
        });
      }
      return;
    }
    morphRetryCountRef.current = 0;

    morphStartedRef.current = true;
    setPhase("morphing");

    const from = current.from;
    const fromR = parseRadiusPx(current.borderRadius);
    const toR = parseRadiusPx(readBorderRadius(target.el) || "0px");

    const proxy = {
      top: from.top,
      left: from.left,
      width: from.width,
      height: from.height,
      borderRadius: fromR,
    };

    setVisual({
      top: from.top,
      left: from.left,
      width: from.width,
      height: from.height,
      borderRadius: `${fromR}px`,
      opacity: 1,
    });

    if (animControlsRef.current) {
      animControlsRef.current.stop();
    }

    animControlsRef.current = animate(
      proxy,
      {
        top: to.top,
        left: to.left,
        width: to.width,
        height: to.height,
        borderRadius: toR,
      },
      {
        duration: 0.55,
        ease: [0.32, 0.72, 0, 1],
        onUpdate: () => {
          setVisual({
            top: proxy.top,
            left: proxy.left,
            width: proxy.width,
            height: proxy.height,
            borderRadius: `${proxy.borderRadius}px`,
            opacity: 1,
          });
        },
        onComplete: () => {
          setPhase("done");
          requestAnimationFrame(() => {
            setTimeout(() => finish(), 48);
          });
        },
      }
    );
  }, [finish]);

  // Abort only if we already reached the detail route, then left it
  useEffect(() => {
    if (!payload?.href) return;
    if (phase !== "morphing" && phase !== "done") return;
    try {
      const expected = new URL(payload.href, window.location.origin).pathname;
      if (pathname !== expected) finish();
    } catch {
      /* ignore */
    }
  }, [pathname, phase, payload, finish]);

  // Retry morph when phase/payload change or after resize/layout
  useEffect(() => {
    if (phase !== "waiting" && phase !== "departing") return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => runMorph());
    });
    return () => cancelAnimationFrame(id);
  }, [phase, payload, runMorph]);

  const startTransition = useCallback(
    ({ carId, href, imageSrc, sourceEl }) => {
      const from = rectFromElement(sourceEl);
      if (!from || !href || !carId) return false;

      // Never morph a grey box — skip shared transition until a real image is painted
      const readySrc = getReadyImageSrc(sourceEl, imageSrc);
      if (!readySrc) return false;

      if (animControlsRef.current) {
        animControlsRef.current.stop();
        animControlsRef.current = null;
      }
      morphStartedRef.current = false;
      morphRetryCountRef.current = 0;

      const borderRadius = readBorderRadius(sourceEl);
      carImageTransitionFlag.active = true;

      const next = {
        carId: String(carId),
        href,
        imageSrc: readySrc,
        from,
        borderRadius,
      };

      setPayload(next);
      setVisual({
        ...from,
        borderRadius,
        opacity: 1,
      });
      setPhase("departing");
      armSafety();

      requestAnimationFrame(() => {
        setPhase("waiting");
      });

      return true;
    },
    [armSafety]
  );

  const registerTarget = useCallback(
    (carId, targetEl) => {
      if (!carId || !targetEl) return () => {};

      targetRef.current = { carId: String(carId), el: targetEl };

      requestAnimationFrame(() => {
        requestAnimationFrame(() => runMorph());
      });

      return () => {
        if (
          targetRef.current &&
          String(targetRef.current.carId) === String(carId) &&
          targetRef.current.el === targetEl
        ) {
          targetRef.current = null;
        }
      };
    },
    [runMorph]
  );

  const isTransitioningFor = useCallback(
    (carId) => {
      if (!payload || !carId) return false;
      if (phase === "idle" || phase === "done") return false;
      return String(payload.carId) === String(carId);
    },
    [payload, phase]
  );

  const value = useMemo(
    () => ({
      startTransition,
      registerTarget,
      isTransitioningFor,
      phase,
      activeCarId: payload?.carId ?? null,
      finish,
    }),
    [startTransition, registerTarget, isTransitioningFor, phase, payload, finish]
  );

  const showOverlay =
    mounted &&
    visual &&
    payload &&
    (phase === "departing" ||
      phase === "waiting" ||
      phase === "morphing" ||
      phase === "done");

  return (
    <CarImageTransitionContext.Provider value={value}>
      {children}
      {showOverlay &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[10000]"
            style={{ contain: "layout paint" }}
          >
            <div
              className="absolute inset-0 bg-white/40 dark:bg-black/35 transition-opacity duration-300"
              style={{
                opacity:
                  phase === "done" ? 0 : phase === "departing" ? 0.25 : 0.5,
              }}
            />
            <div
              className="absolute overflow-hidden bg-transparent shadow-2xl"
              style={{
                top: visual.top,
                left: visual.left,
                width: visual.width,
                height: visual.height,
                borderRadius: visual.borderRadius,
                opacity: visual.opacity,
                willChange: "top, left, width, height, border-radius",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payload.imageSrc}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
                decoding="sync"
              />
            </div>
          </div>,
          document.body
        )}
    </CarImageTransitionContext.Provider>
  );
}

export function useCarImageTransition() {
  const ctx = useContext(CarImageTransitionContext);
  if (!ctx) {
    return {
      startTransition: () => false,
      registerTarget: () => () => {},
      isTransitioningFor: () => false,
      phase: "idle",
      activeCarId: null,
      finish: () => {},
    };
  }
  return ctx;
}
