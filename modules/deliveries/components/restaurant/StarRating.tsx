import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const STAR_FILL = "fill-[#f8c94f] text-[#f8c94f]";

interface Props {
  rating: number;
  /** Size class for each star, e.g. `size-4`. */
  starClassName: string;
}

/** Decorative five-star row with fractional fill; pair it with an sr-only label. */
export function StarRating({ rating, starClassName }: Props) {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => {
        const fill = Math.max(0, Math.min(1, rating - value + 1));
        return (
          <span key={value} className={cn("relative inline-block", starClassName)}>
            <Star className={cn("absolute inset-0 text-line", starClassName)} />
            <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn(STAR_FILL, starClassName)} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
