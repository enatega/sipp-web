"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes: string;
  contain?: boolean;
}

function passthroughLoader({ src }: ImageLoaderProps) {
  return src;
}

function isSupportedSource(src?: string | null) {
  return Boolean(
    src &&
      (src.startsWith("/") ||
        src.startsWith("https://") ||
        src.startsWith("http://")),
  );
}

export function DeliveryImage({
  src,
  alt,
  className,
  imageClassName,
  sizes,
  contain = false,
}: Props) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[var(--soft-surface)]",
        className,
      )}
    >
      {isSupportedSource(src) && failedSource !== src ? (
        <Image
          alt={alt}
          className={cn(
            contain ? "object-contain p-3" : "object-cover",
            imageClassName,
          )}
          fill
          loader={passthroughLoader}
          onError={() => setFailedSource(src ?? null)}
          sizes={sizes}
          src={src!}
          unoptimized
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-muted/55">
          <ImageOff aria-hidden="true" className="size-7" />
        </span>
      )}
    </div>
  );
}
