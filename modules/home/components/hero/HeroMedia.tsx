"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/shared/brand/Icon";
import type { IconName } from "@/components/shared/brand/Icon";
import { cn } from "@/lib/utils";
import type { ServiceSlide } from "@/modules/home/data/hero-slides";
import styles from "@/modules/home/styles/home.module.css";

/* On a short viewport the art gives way rather than making the hero taller
   than one screen: the frame keeps its width and crops a little more. */
const HEIGHT_CAP = "max-h-[26svh] sm:max-h-[40svh] md:max-h-[52svh]";

/**
 * The slide photograph. If the file is missing or fails to decode, the frame
 * keeps its exact footprint and falls back to a branded panel, so the hero
 * never collapses and the copy beside it is untouched.
 */
export function HeroMedia({
  image,
  panel,
  fallbackIcon,
}: {
  image: ServiceSlide["image"];
  panel?: string;
  /** Stands in for the photograph if it cannot be loaded. */
  fallbackIcon: IconName;
}) {
  /* Track *which* source failed rather than a plain boolean: a bare flag
     would latch on and keep showing the fallback even after the slide is
     pointed at a different (working) file. */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === image.src;
  /* Mirrored art is flipped in CSS so the subject faces into the copy. */
  const mirror = image.mirrored ? "-scale-x-100" : "";

  if (panel) {
    return (
      <div
        className={cn(styles.heroMedia, "relative w-full", HEIGHT_CAP)}
        style={{ aspectRatio: image.aspect }}
      >
        <div
          className="absolute inset-x-0 bottom-0 top-[13%] rounded-[26px]"
          style={{ background: panel }}
        />
        {failed ? null : (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="eager"
            sizes="(max-width: 861px) 90vw, 46vw"
            onError={() => setFailedSrc(image.src)}
            className={`absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom ${mirror}`}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(styles.heroMedia, "relative w-full overflow-hidden rounded-[12px] bg-[linear-gradient(150deg,#f3e7e6,#e3d2d4)] shadow-pop", HEIGHT_CAP)}
      style={{ aspectRatio: image.aspect }}
    >
      {failed ? (
        <span
          role="img"
          aria-label={image.alt}
          className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_60%_40%,rgba(102,192,242,0.16),transparent_64%)] text-brand/25"
        >
          <Icon name={fallbackIcon} className="size-1/4" />
        </span>
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          loading="eager"
          sizes="(max-width: 861px) 90vw, 46vw"
          onError={() => setFailedSrc(image.src)}
          className={`object-cover ${mirror}`}
        />
      )}
    </div>
  );
}
