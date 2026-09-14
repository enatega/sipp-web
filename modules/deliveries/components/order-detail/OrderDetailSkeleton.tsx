export function OrderDetailSkeleton() {
  return (
    <div className="min-[700px]:grid min-[700px]:grid-cols-[240px_1fr]">
      <div className="hidden min-h-[calc(100svh-4.75rem)] bg-[var(--soft-surface)] min-[700px]:block" />
      <main className="min-h-[calc(100svh-4.75rem)] bg-background px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px] animate-pulse">
          <div className="h-5 w-28 rounded bg-[var(--soft-surface)]" />
          <div className="mt-6 h-60 rounded-2xl bg-[var(--soft-surface)]" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <div className="h-52 rounded-2xl bg-[var(--soft-surface)]" />
              <div className="h-72 rounded-2xl bg-[var(--soft-surface)]" />
            </div>
            <div className="h-80 rounded-2xl bg-[var(--soft-surface)]" />
          </div>
        </div>
      </main>
    </div>
  );
}
