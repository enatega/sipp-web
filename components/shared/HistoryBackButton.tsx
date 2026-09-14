"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface HistoryBackButtonProps {
  className?: string;
  href?: string;
  variant?: "default" | "inverse";
}

export function HistoryBackButton({
  className = "",
  href,
  variant = "default",
}: HistoryBackButtonProps) {
  const router = useRouter();
  const t = useTranslations("common");
  const inverse = variant === "inverse";
  const styles = `inline-flex min-h-10 items-center gap-2 rounded-full px-1 pr-3 text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
    inverse
      ? "border border-white/35 bg-black/30 text-white backdrop-blur-sm hover:border-white/60 hover:bg-black/50 focus-visible:outline-white"
      : "text-body hover:bg-[var(--soft-surface)] hover:text-brand focus-visible:outline-brand"
  } ${className}`;
  const content = (
    <>
      <span
        className={`grid size-8 place-items-center rounded-full ${
          inverse ? "bg-white/15 text-white" : "bg-danger-soft text-brand"
        }`}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
      </span>
      {t("back")}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={styles}
    >
      {content}
    </button>
  );
}
