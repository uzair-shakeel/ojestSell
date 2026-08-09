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

const ORIGIN_KEY = "ojest:car-transition-origin";

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

function snapshotReadyImg(img) {
  if (!img || !(img.complete && img.naturalWidth > 0)) return null;

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
    /* CORS — fall through */
  }

  return img.currentSrc || img.src || null;
}

function isCarPhotoImg(img) {
  if (!img || img.tagName !== "IMG") return false;
  const alt = (img.getAttribute("alt") || "").toLowerCase();
  if (alt === "premium") return false;
  const r = img.getBoundingClientRect();
  return r.width >= 8 && r.height >= 8;
}

export function resolveTransitionSource(wrapperEl, clientX, clientY) {
  if (!wrapperEl || typeof window === "undefined") return null;

  const imgs = [...wrapperEl.querySelectorAll("img")].filter(isCarPhotoImg);
  if (!imgs.length) return null;

  let hitImg = null;
  if (typeof clientX === "number" && typeof clientY === "number") {
    hitImg =
      imgs.find((img) => {
        const r = img.getBoundingClientRect();
        return (
          clientX >= r.left &&
          clientX <= r.right &&
          clientY >= r.top &&
          clientY <= r.bottom
        );
      }) || null;
  }

  const img = hitImg || imgs[0];
  const tileEl =
    img.closest("[data-car-tile]") || img.parentElement || img;

  const rawIndex = tileEl.getAttribute?.("data-car-tile-index");
  let imageIndex = rawIndex != null ? parseInt(rawIndex, 10) : NaN;
  if (Number.isNaN(imageIndex)) {
    imageIndex = Math.max(0, imgs.indexOf(img));
  }

  return { tileEl, img, imageIndex };
}

function getReadyImageSrc(sourceEl, fallbackSrc, preferredImg) {
  if (typeof window === "undefined") return null;

  if (preferredImg) {
    const snapped = snapshotReadyImg(preferredImg);
    if (snapped) return snapped;
  }

  if (sourceEl) {
    const imgs = [...sourceEl.querySelectorAll("img")].filter(isCarPhotoImg);
    for (const img of imgs) {
      const snapped = snapshotReadyImg(img);
      if (snapped) return snapped;
    }
  }

  if (fallbackSrc) {
    const probe = new window.Image();
    probe.src = fallbackSrc;
    if (probe.complete && probe.naturalWidth > 0) return fallbackSrc;
  }

  return null;
}

function saveOriginMeta(meta) {
  try {
    sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

function readOriginMeta() {
  try {
    const raw = sessionStorage.getItem(ORIGIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearOriginMeta() {
  try {
    sessionStorage.removeItem(ORIGIN_KEY);
  } catch {
    /* ignore */
  }
}

function resolveSectionKey(el, explicitSection) {
  if (explicitSection) return String(explicitSection);
  if (!el || typeof el.closest !== "function") return null;
  const host = el.closest("[data-car-section]");
  return host?.getAttribute("data-car-section") || null;
}

function documentCenterOfRect(rect) {
  if (!rect || typeof window === "undefined") return null;
  return {
    x: rect.left + window.scrollX + rect.width / 2,
    y: rect.top + window.scrollY + rect.height / 2,
  };
}

function findTileInWrapper(wrapperEl, imageIndex) {
  if (!wrapperEl) return null;
  const tiles = [...wrapperEl.querySelectorAll("[data-car-tile]")];
  if (!tiles.length) return wrapperEl;

  const match = tiles.find(
    (t) => t.getAttribute("data-car-tile-index") === String(imageIndex)
  );
  if (match) return match;

  // Prefer outermost primary tile
  const primary = tiles.find(
    (t) => t.getAttribute("data-car-tile-index") === "0"
  );
  return primary || tiles[0] || wrapperEl;
}

export function CarImageTransitionProvider({ children }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState("idle");
  // idle | departing | waiting | morphing | done | releasing
  const [payload, setPayload] = useState(null);
  const [visual, setVisual] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [veilOpacity, setVeilOpacity] = useState(0.35);

  const phaseRef = useRef(phase);
  const payloadRef = useRef(payload);
  const targetRef = useRef(null); // { carId, el }
  const animControlsRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const morphStartedRef = useRef(false);
  const morphRetryCountRef = useRef(0);
  const releaseFnRef = useRef(null);
  const returnCandidatesRef = useRef([]);
  const returnPickTimerRef = useRef(null);

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
    document
      .querySelectorAll("[data-car-morph-source]")
      .forEach((el) => el.removeAttribute("data-car-morph-source"));
    carImageTransitionFlag.active = false;
    morphStartedRef.current = false;
    morphRetryCountRef.current = 0;
    returnCandidatesRef.current = [];
    if (returnPickTimerRef.current) {
      clearTimeout(returnPickTimerRef.current);
      returnPickTimerRef.current = null;
    }
    if (payloadRef.current?.direction === "back") {
      clearOriginMeta();
    }
    setPhase("idle");
    setPayload(null);
    setVisual(null);
    setVeilOpacity(0.35);
  }, [clearSafety]);

  const armSafety = useCallback(() => {
    clearSafety();
    safetyTimerRef.current = setTimeout(() => finish(), 4500);
  }, [clearSafety, finish]);

  const startRelease = useCallback(() => {
    if (phaseRef.current !== "done" && phaseRef.current !== "releasing") return;
    phaseRef.current = "releasing";
    setPhase("releasing");

    const target = targetRef.current;
    const to = target?.el ? rectFromElement(target.el) : null;
    if (to) {
      setVisual((prev) =>
        prev
          ? {
              ...prev,
              top: to.top,
              left: to.left,
              width: to.width,
              height: to.height,
              borderRadius: readBorderRadius(target.el) || prev.borderRadius,
              opacity: 1,
            }
          : prev
      );
    }

    const proxy = { cover: 1, veil: veilOpacity > 0 ? veilOpacity : 0.35 };
    if (animControlsRef.current) animControlsRef.current.stop();
    animControlsRef.current = animate(
      proxy,
      { cover: 0, veil: 0 },
      {
        duration: 0.16,
        ease: "easeOut",
        onUpdate: () => {
          setVeilOpacity(proxy.veil);
          setVisual((prev) =>
            prev ? { ...prev, opacity: proxy.cover } : prev
          );
        },
        onComplete: () => finish(),
      }
    );
  }, [finish, veilOpacity]);

  releaseFnRef.current = startRelease;

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
          // Reverse: card is already painted underneath — release immediately
          if (current.direction === "back") {
            requestAnimationFrame(() => {
              releaseFnRef.current?.();
            });
          }
        },
      }
    );
  }, []);

  // Abort only after morph is underway and we've left the expected destination.
  // Do NOT run during "waiting" — we're still on the listing while the route changes.
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

  useEffect(() => {
    if (phase !== "waiting" && phase !== "departing") return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => runMorph());
    });
    return () => cancelAnimationFrame(id);
  }, [phase, payload, runMorph]);

  const beginOverlay = useCallback(
    (next) => {
      if (animControlsRef.current) {
        animControlsRef.current.stop();
        animControlsRef.current = null;
      }
      morphStartedRef.current = false;
      morphRetryCountRef.current = 0;
      carImageTransitionFlag.active = true;

      setPayload(next);
      setVisual({
        ...next.from,
        borderRadius: next.borderRadius,
        opacity: 1,
      });
      setVeilOpacity(0.2);
      setPhase("departing");
      armSafety();

      requestAnimationFrame(() => {
        setVeilOpacity(0.35);
        setPhase("waiting");
      });
    },
    [armSafety]
  );

  const startTransition = useCallback(
    ({ carId, href, imageSrc, sourceEl, clientX, clientY, section }) => {
      if (!href || !carId || !sourceEl) return false;

      const resolved = resolveTransitionSource(sourceEl, clientX, clientY);
      const tileEl = resolved?.tileEl || sourceEl;
      const photoImg = resolved?.img || null;

      const from = rectFromElement(tileEl);
      if (!from) return false;

      const readySrc =
        getReadyImageSrc(tileEl, imageSrc, photoImg) || imageSrc || null;
      if (!readySrc) return false;

      const tileRadius = readBorderRadius(tileEl);
      const wrapRadius = readBorderRadius(sourceEl);
      const borderRadius =
        parseRadiusPx(tileRadius) > 0 ? tileRadius : wrapRadius;
      const imageIndex =
        typeof resolved?.imageIndex === "number" ? resolved.imageIndex : 0;
      const sectionKey = resolveSectionKey(sourceEl, section);
      const anchor = documentCenterOfRect(from);

      document
        .querySelectorAll("[data-car-morph-source]")
        .forEach((el) => el.removeAttribute("data-car-morph-source"));
      tileEl.setAttribute("data-car-morph-source", "1");

      saveOriginMeta({
        carId: String(carId),
        imageIndex,
        originPath: `${window.location.pathname}${window.location.search}`,
        section: sectionKey,
        scrollY: window.scrollY,
        anchorX: anchor?.x ?? null,
        anchorY: anchor?.y ?? null,
      });

      beginOverlay({
        direction: "forward",
        carId: String(carId),
        href,
        imageSrc: readySrc,
        from,
        borderRadius,
        imageIndex,
        section: sectionKey,
        scrollY: window.scrollY,
        anchorX: anchor?.x ?? null,
        anchorY: anchor?.y ?? null,
      });

      return true;
    },
    [beginOverlay]
  );

  const startBackTransition = useCallback(
    ({ carId, sourceEl, imageIndex = 0, imageSrc }) => {
      if (!carId || !sourceEl) return false;

      const photoImg = sourceEl.querySelector?.("img") || null;
      const from = rectFromElement(sourceEl);
      if (!from) return false;

      const readySrc =
        getReadyImageSrc(sourceEl, imageSrc, photoImg) || imageSrc || null;
      if (!readySrc) return false;

      const borderRadius = readBorderRadius(sourceEl) || "0px";
      const origin = readOriginMeta();
      // Prefer the tile/section we originally left from — not wherever the gallery is now
      const idx =
        typeof origin?.imageIndex === "number"
          ? origin.imageIndex
          : typeof imageIndex === "number"
            ? imageIndex
            : 0;

      document
        .querySelectorAll("[data-car-morph-source]")
        .forEach((el) => el.removeAttribute("data-car-morph-source"));
      sourceEl.setAttribute("data-car-morph-source", "1");

      returnCandidatesRef.current = [];

      beginOverlay({
        direction: "back",
        carId: String(carId),
        href: origin?.originPath || "/website/cars",
        imageSrc: readySrc,
        from,
        borderRadius,
        imageIndex: idx,
        section: origin?.section || null,
        scrollY: typeof origin?.scrollY === "number" ? origin.scrollY : null,
        anchorX: typeof origin?.anchorX === "number" ? origin.anchorX : null,
        anchorY: typeof origin?.anchorY === "number" ? origin.anchorY : null,
      });

      return true;
    },
    [beginOverlay]
  );

  const registerTarget = useCallback(
    (carId, targetEl) => {
      if (!carId || !targetEl) return () => {};
      // Detail hero is only the forward morph target
      if (payloadRef.current?.direction === "back") return () => {};

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

  const pickBestReturnTarget = useCallback(() => {
    const current = payloadRef.current;
    if (!current || current.direction !== "back") return;
    if (phaseRef.current !== "waiting" && phaseRef.current !== "departing") {
      return;
    }

    const candidates = returnCandidatesRef.current.filter(
      (c) => c?.el && String(c.carId) === String(current.carId)
    );
    if (!candidates.length) return;

    let pool = candidates;
    if (current.section) {
      const sectionMatches = candidates.filter(
        (c) => c.section && c.section === current.section
      );
      if (sectionMatches.length) pool = sectionMatches;
    }

    let best = pool[0];
    let bestDist = Number.POSITIVE_INFINITY;
    const hasAnchor =
      typeof current.anchorX === "number" && typeof current.anchorY === "number";

    for (const candidate of pool) {
      const tileEl = findTileInWrapper(candidate.el, current.imageIndex ?? 0);
      if (!tileEl) continue;
      const rect = rectFromElement(tileEl);
      if (!rect) continue;
      const center = documentCenterOfRect(rect);
      if (!center) continue;

      const dist = hasAnchor
        ? (center.x - current.anchorX) ** 2 + (center.y - current.anchorY) ** 2
        : 0;

      if (dist < bestDist) {
        bestDist = dist;
        best = { ...candidate, tileEl };
      }
    }

    const tileEl =
      best?.tileEl || findTileInWrapper(best?.el, current.imageIndex ?? 0);
    if (!tileEl) return;

    try {
      tileEl.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
      /* ignore */
    }

    document
      .querySelectorAll("[data-car-morph-source]")
      .forEach((el) => el.removeAttribute("data-car-morph-source"));
    tileEl.setAttribute("data-car-morph-source", "1");
    targetRef.current = { carId: String(current.carId), el: tileEl };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => runMorph());
    });
  }, [runMorph]);

  const registerReturnTarget = useCallback(
    (carId, wrapperEl, section) => {
      if (!carId || !wrapperEl) return () => {};
      const current = payloadRef.current;
      if (!current || current.direction !== "back") return () => {};
      if (String(current.carId) !== String(carId)) return () => {};

      const sectionKey = resolveSectionKey(wrapperEl, section);
      const entry = {
        carId: String(carId),
        el: wrapperEl,
        section: sectionKey,
      };

      returnCandidatesRef.current = returnCandidatesRef.current.filter(
        (c) => c.el !== wrapperEl
      );
      returnCandidatesRef.current.push(entry);

      // Restore origin scroll before we measure which card instance to land on
      if (
        typeof current.scrollY === "number" &&
        Math.abs(window.scrollY - current.scrollY) > 8
      ) {
        window.scrollTo(0, current.scrollY);
      }

      if (returnPickTimerRef.current) clearTimeout(returnPickTimerRef.current);
      // Wait so every matching card instance can register, then pick the origin one
      returnPickTimerRef.current = setTimeout(() => {
        returnPickTimerRef.current = null;
        pickBestReturnTarget();
      }, 70);

      return () => {
        returnCandidatesRef.current = returnCandidatesRef.current.filter(
          (c) => c.el !== wrapperEl
        );
      };
    },
    [pickBestReturnTarget]
  );

  // Restore listing scroll before measuring return targets
  useEffect(() => {
    if (!payload || payload.direction !== "back") return;
    if (phase !== "waiting" && phase !== "departing") return;
    if (typeof payload.scrollY !== "number") return;
    // Wait until we're off the detail route
    if (/\/website\/cars\/[^/?]+/.test(pathname)) return;
    if (Math.abs(window.scrollY - payload.scrollY) > 8) {
      window.scrollTo(0, payload.scrollY);
    }
  }, [pathname, phase, payload]);

  const isTransitioningFor = useCallback(
    (carId) => {
      if (!payload || !carId) return false;
      if (phase === "idle") return false;
      return String(payload.carId) === String(carId);
    },
    [payload, phase]
  );

  const isReturningFor = useCallback(
    (carId, section) => {
      if (!payload || !carId) return false;
      if (payload.direction !== "back") return false;
      if (phase === "idle") return false;
      if (String(payload.carId) !== String(carId)) return false;
      // If we know the origin section, only that section's cards should register
      if (payload.section && section && payload.section !== section) return false;
      return true;
    },
    [payload, phase]
  );

  const peekImageIndex = useCallback(
    (id) => {
      if (!payload || !id) return null;
      if (phase === "idle") return null;
      if (String(payload.carId) !== String(id)) return null;
      return typeof payload.imageIndex === "number" ? payload.imageIndex : 0;
    },
    [payload, phase]
  );

  const confirmHandoff = useCallback(() => {
    if (phaseRef.current !== "done") return;
    startRelease();
  }, [startRelease]);

  const getBackHref = useCallback(() => {
    const origin = readOriginMeta();
    return origin?.originPath || "/website/cars";
  }, []);

  const value = useMemo(
    () => ({
      startTransition,
      startBackTransition,
      registerTarget,
      registerReturnTarget,
      isTransitioningFor,
      isReturningFor,
      peekImageIndex,
      confirmHandoff,
      getBackHref,
      phase,
      activeCarId: payload?.carId ?? null,
      finish,
    }),
    [
      startTransition,
      startBackTransition,
      registerTarget,
      registerReturnTarget,
      isTransitioningFor,
      isReturningFor,
      peekImageIndex,
      confirmHandoff,
      getBackHref,
      phase,
      payload,
      finish,
    ]
  );

  const showOverlay =
    mounted &&
    visual &&
    payload &&
    (phase === "departing" ||
      phase === "waiting" ||
      phase === "morphing" ||
      phase === "done" ||
      phase === "releasing");

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
              className="absolute inset-0 bg-white dark:bg-black"
              style={{ opacity: veilOpacity }}
            />
            <div
              className="absolute overflow-hidden bg-transparent"
              style={{
                top: visual.top,
                left: visual.left,
                width: visual.width,
                height: visual.height,
                borderRadius: visual.borderRadius,
                opacity: visual.opacity ?? 1,
                boxShadow:
                  phase === "done" ||
                  phase === "morphing" ||
                  phase === "releasing"
                    ? "none"
                    : "0 25px 50px -12px rgb(0 0 0 / 0.35)",
                willChange: "top, left, width, height, border-radius, opacity",
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
      startBackTransition: () => false,
      registerTarget: () => () => {},
      registerReturnTarget: () => () => {},
      isTransitioningFor: () => false,
      isReturningFor: () => false,
      peekImageIndex: () => null,
      confirmHandoff: () => {},
      getBackHref: () => "/website/cars",
      phase: "idle",
      activeCarId: null,
      finish: () => {},
    };
  }
  return ctx;
}
