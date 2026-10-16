"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import type { RestaurantReview } from "../../types/restaurant";
import { getReviewerInitials } from "../../utils/reviewerInitials";

const AVATAR_TINTS = [
  "bg-brand/15 text-brand",
  "bg-[#f8c94f]/20 text-gold",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-secondary/12 text-secondary",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
];

function tintFor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

interface Props {
  review: RestaurantReview;
}

export function RestaurantReviewCard({ review }: Props) {
  const t = useTranslations("deliveries.restaurant");
  const format = useFormatter();
  const name = review.reviewer.name ?? t("reviewAnonymous");
  const date = review.createdAt ? new Date(review.createdAt) : null;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = review.reviewer.image;
  const shouldShowImage = Boolean(imageUrl && imageUrl !== failedImageUrl);

  return (
    <article className="relative overflow-hidden rounded-2xl border border-line bg-card p-4 sm:p-5">
      <Quote aria-hidden="true" className="pointer-events-none absolute -end-1 -top-1 size-16 rotate-180 text-brand/[0.07]" />
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-bold uppercase",
            tintFor(review.id),
          )}
        >
          {getReviewerInitials(name)}
          {shouldShowImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl ?? undefined}
              alt=""
              className="absolute inset-0 size-full object-cover"
              onError={() => setFailedImageUrl(imageUrl)}
            />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{name}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <StarRating rating={review.rating} starClassName="size-3.5" />
            <span className="sr-only">{t("reviewStarsAria", { rating: review.rating })}</span>
            {date && !Number.isNaN(date.getTime()) ? (
              <time dateTime={review.createdAt ?? undefined} className="text-[11px] text-muted">
                {format.relativeTime(date)}
              </time>
            ) : null}
          </div>
        </div>
      </div>
      {review.comment ? (
        <p className="relative mt-3 whitespace-pre-line break-words text-sm leading-6 text-body">{review.comment}</p>
      ) : (
        <p className="relative mt-3 text-xs italic text-muted">{t("reviewNoComment")}</p>
      )}
    </article>
  );
}
