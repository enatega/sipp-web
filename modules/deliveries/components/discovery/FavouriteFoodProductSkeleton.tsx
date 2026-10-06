export function FavouriteFoodProductSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-3xl border border-line bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-brand-soft ring-1 ring-line" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-28 animate-pulse rounded-full bg-line" />
          <div className="h-2.5 w-20 animate-pulse rounded-full bg-brand-soft" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-full bg-brand-soft" />
      </div>
      <div className="flex min-h-40 gap-4 p-4 sm:p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 py-1">
          <div className="h-4 w-4/5 animate-pulse rounded-full bg-line" />
          <div className="h-4 w-3/5 animate-pulse rounded-full bg-line" />
          <div className="h-3 w-full animate-pulse rounded-full bg-brand-soft" />
          <div className="mt-auto h-8 w-24 animate-pulse rounded-full bg-brand-soft" />
        </div>
        <div className="size-28 shrink-0 animate-pulse rounded-2xl bg-brand-soft ring-1 ring-line sm:size-32" />
      </div>
    </div>
  );
}
