"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./discovery-cards.module.css";

interface Props {
  className: string;
  isPreloaded: boolean;
  src: StaticImageData;
}

/** Card artwork that eases in once decoded instead of popping in after the copy. */
export function ShopTypeArtwork({ className, isPreloaded, src }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      alt=""
      aria-hidden="true"
      className={cn(
        styles.browseArt,
        "pointer-events-none absolute w-auto object-contain object-right-bottom rtl:object-left-bottom",
        isLoaded ? styles.browseArtLoaded : styles.browseArtLoading,
        className,
      )}
      onLoad={() => setIsLoaded(true)}
      preload={isPreloaded}
      sizes="(max-width: 640px) 60vw, 450px"
      src={src}
    />
  );
}
