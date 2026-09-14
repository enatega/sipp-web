import { useEffect, useRef } from "react";
import { Flame, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RestaurantCategory } from "../../types/restaurant";

interface Props {
  activeCategoryId: string;
  categoryLabel: string;
  categories: RestaurantCategory[];
  onSelect: (categoryId: string) => void;
}

export function CategoryNavigation({
  activeCategoryId,
  categoryLabel,
  categories,
  onSelect,
}: Props) {
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = activeItemRef.current;
    const container = scrollContainerRef.current;
    if (!item || !container) return;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    if (
      itemTop < container.scrollTop + 12 ||
      itemBottom > container.scrollTop + container.clientHeight - 12
    ) {
      container.scrollTo({
        behavior: "smooth",
        top: Math.max(0, itemTop - 24),
      });
    }
  }, [activeCategoryId]);

  return (
    <aside className="hidden border-r border-line bg-surface lg:block">
      <div className="sticky top-[76px] max-h-[calc(100vh-76px)] overflow-y-auto px-4 py-7" ref={scrollContainerRef}>
        <nav aria-label={categoryLabel} className="space-y-1.5">
          {categories.map((category, index) => {
            const isActive = activeCategoryId === category.id;
            const CategoryIcon = index === 0 ? Flame : PackageOpen;
            return (
              <button
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold leading-5 transition-colors duration-200",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-body hover:bg-[var(--soft-surface)] hover:text-ink",
                )}
                key={category.id}
                onClick={() => onSelect(category.id)}
                ref={isActive ? activeItemRef : undefined}
                type="button"
              >
                <CategoryIcon aria-hidden="true" className="size-4 shrink-0" />
                <span className="min-w-0 break-words">{category.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function MobileCategoryNavigation({
  activeCategoryId,
  categoryLabel,
  categories,
  onSelect,
}: Pick<
  Props,
  "activeCategoryId" | "categoryLabel" | "categories" | "onSelect"
>) {
  return (
    <nav
      aria-label={categoryLabel}
      className="sticky top-16 z-30 flex gap-2 overflow-x-auto border-b border-line bg-surface/95 px-[18px] py-3 backdrop-blur-md lg:hidden md:top-[76px]"
    >
      {categories.map((category) => (
        <button
          aria-current={activeCategoryId === category.id ? "true" : undefined}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-xs font-bold transition",
            activeCategoryId === category.id
              ? "bg-brand text-white"
              : "bg-[var(--soft-surface)] text-body",
          )}
          key={category.id}
          onClick={() => onSelect(category.id)}
          type="button"
        >
          {category.name}
        </button>
      ))}
    </nav>
  );
}
