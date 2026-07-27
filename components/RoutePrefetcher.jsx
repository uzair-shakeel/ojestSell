"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Prefetch critical marketplace routes as soon as the app shell is ready */
export default function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/website/cars");
  }, [router]);

  return null;
}
