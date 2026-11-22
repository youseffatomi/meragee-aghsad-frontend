"use client";

import { useEffect } from "react";

/**
 * Registers the pass-through service worker that makes the app installable.
 *
 * It renders nothing and fails silently: a browser without service worker
 * support, or a registration error, must never break the page — the app works
 * exactly the same without it.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
