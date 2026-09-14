"use client";

import { useEffect, useState } from "react";
import { readStoredPlace } from "../api/location";
import type { ChosenPlace } from "../types";

export function useStoredPlace() {
  const [state, setState] = useState<{
    isReady: boolean;
    place: ChosenPlace | null;
  }>({ isReady: false, place: null });

  useEffect(() => {
    const sync = () => {
      setState({ isReady: true, place: readStoredPlace() });
    };
    sync();
    window.addEventListener("shaaneiol-location-change", sync);
    return () => window.removeEventListener("shaaneiol-location-change", sync);
  }, []);

  return state;
}
