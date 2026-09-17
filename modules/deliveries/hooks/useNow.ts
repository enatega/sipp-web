"use client";
import { useEffect, useState } from "react";

// Relative-time labels (e.g. "2 minutes ago") go stale the moment they
// render, since nothing re-renders the component as real time passes. This
// ticks on an interval so callers can recompute against a live "now".
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
