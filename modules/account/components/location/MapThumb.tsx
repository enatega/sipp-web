"use client";

import Image from "next/image";
import { useState } from "react";

type MapThumbProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  /** Classes for the frame — size, radius, margins. */
  className?: string;
  /** Width of the centred pin, as a Tailwind class. */
  pinClassName?: string;
};

/**
 * Map preview with the location pin centred on top.
 *
 * Prefers the live Static Maps render from /api/maps/static; when no
 * GOOGLE_MAPS_API_KEY is configured that route 404s and the bundled map
 * artwork stands in, so the frame is never blank.
 */
export function MapThumb({
  latitude,
  longitude,
  zoom = 15,
  className = "",
  pinClassName = "w-[22%]",
}: MapThumbProps) {
  const [fallback, setFallback] = useState(false);
  const live = `/api/maps/static?lat=${latitude}&lng=${longitude}&zoom=${zoom}`;

  return (
    <span className={`relative block overflow-hidden bg-[#eef1f4] ${className}`}>
      <Image
        src={fallback ? "/images/maps-address-icon.png" : live}
        alt=""
        fill
        unoptimized={!fallback}
        sizes="440px"
        className="object-cover"
        onError={() => setFallback(true)}
      />
      <Image
        src="/images/maps-location-icon.png"
        alt=""
        width={64}
        height={64}
        className={`absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_4px_rgba(20,10,14,0.35)] ${pinClassName}`}
      />
    </span>
  );
}
