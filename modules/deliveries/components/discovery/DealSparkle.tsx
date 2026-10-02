import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/** Three short "burst" strokes used to accent deal badges. */
export function DealSparkle({ className }: Props) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2.4}
      viewBox="0 0 20 20"
    >
      <path d="M3 9 7.5 6.5" />
      <path d="M5 15.5 10 15" />
      <path d="M3.5 3 6 1.5" />
    </svg>
  );
}
