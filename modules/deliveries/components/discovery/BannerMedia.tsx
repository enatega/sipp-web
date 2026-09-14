"use client";

import { useState } from "react";
import { DeliveryImage } from "@/modules/deliveries/components/discovery/DeliveryImage";
import type { DeliveryBanner } from "@/modules/deliveries/types/discovery";

interface Props {
  banner: DeliveryBanner;
}

export function BannerMedia({ banner }: Props) {
  const videoUrl = banner.bannerVideoLink?.trim();
  const [hasVideoFailed, setHasVideoFailed] = useState(false);

  if (videoUrl && !hasVideoFailed) {
    return (
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        loop
        muted
        onError={() => setHasVideoFailed(true)}
        playsInline
        poster={banner.bannerImageLink?.trim() || undefined}
        preload="metadata"
        src={videoUrl}
      />
    );
  }

  return (
    <DeliveryImage
      alt={banner.title}
      className="absolute inset-0 size-full bg-brand"
      imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.035]"
      sizes="(max-width: 1100px) 100vw, 600px"
      src={banner.bannerImageLink}
    />
  );
}
