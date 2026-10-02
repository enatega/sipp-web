"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, SearchX, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/brand/Icon";
import { ProfileSidebar } from "./ProfileSidebar";
import { favouritesApi, type FavouriteStore } from "@/modules/account/api/favourites";

function StoreCard({ store }: { store: FavouriteStore }) {
  const client = useQueryClient();
  const router = useRouter();
  const [toggling, setToggling] = useState(false);
  const image = store.coverImage ?? store.logo;
  const openRestaurant = () => router.push(`/restaurants/${store.slug || store.storeId}`);
  return <article role="link" tabIndex={0} onClick={openRestaurant} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openRestaurant(); } }} className="cursor-pointer overflow-hidden rounded-2xl bg-card shadow-card transition-transform hover:-translate-y-0.5">
    <div className="relative aspect-[1.78] bg-soft-surface">{image ? <img src={image} alt="" className="size-full object-cover" /> : <Icon name="store" className="absolute inset-0 m-auto size-10 text-muted" />}<span className="absolute right-2 top-2 rounded-full bg-card px-2 py-1 text-[9px] font-bold text-brand">{store.isOpen === false ? "Closed" : "Open"}</span><button type="button" disabled={toggling} aria-label={`Remove ${store.name} from favourites`} onClick={async (event) => { event.stopPropagation(); setToggling(true); try { await favouritesApi.toggle(store.storeId); await client.invalidateQueries({ queryKey: ["favourites"] }); } finally { setToggling(false); } }} className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full bg-card text-brand shadow-sm disabled:cursor-not-allowed disabled:opacity-70">{toggling ? <span className="size-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand" /> : <Icon name="heart" className="size-4 fill-brand" />}</button></div>
    <div className="p-4"><h2 className="truncate text-sm font-bold">{store.name}</h2><p className="mt-1 truncate text-[10px] text-muted">{store.shopTypeName || "Restaurant"} · {store.distanceKm ? `${store.distanceKm} km` : "Nearby"}</p><div className="mt-4 flex items-center justify-between"><span className="text-sm font-bold text-brand">{store.deliveryTime ? `${store.deliveryTime} min` : "Fast delivery"}</span><span className="text-[10px] text-ink">★ {Number(store.averageRating ?? 0).toFixed(1)} ({store.reviewCount ?? 0})</span><Link href={`/restaurants/${store.slug || store.storeId}`} onClick={(event) => event.stopPropagation()} aria-label={`Open ${store.name}`} className="grid size-8 place-items-center rounded-lg bg-brand text-ink"><span className="text-lg leading-none">+</span></Link></div></div>
  </article>;
}

function FavouriteSkeleton() {
  return <article aria-hidden="true" className="animate-pulse overflow-hidden rounded-2xl bg-card shadow-card">
    <div className="aspect-[1.78] bg-soft-surface" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/5 rounded bg-soft-surface" />
      <div className="h-3 w-4/5 rounded bg-soft-surface" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-4 w-24 rounded bg-soft-surface" />
        <div className="h-3 w-16 rounded bg-soft-surface" />
        <div className="size-8 rounded-lg bg-soft-surface" />
      </div>
    </div>
  </article>;
}

export function FavouritesExperience() {
  const t = useTranslations("favouritesPage");
  const query = useQuery({ queryKey: ["favourites"], queryFn: favouritesApi.list });
  const stores = query.data?.items ?? [];
  return (
    <div className="min-[700px]:grid min-[700px]:grid-cols-[240px_1fr] min-[1100px]:h-[calc(100svh-4.75rem)] min-[1100px]:overflow-hidden">
      <ProfileSidebar />
      <main className="min-w-0 overflow-y-auto overflow-x-hidden bg-background px-4 py-6 min-[600px]:px-5 min-[900px]:px-10">
        <div className="mx-auto w-full max-w-[1400px]">
          <h1 className="text-2xl font-bold tracking-[-0.025em] text-ink">{t("title")}</h1>

          <section className="mt-5" aria-label={t("title")}>
            {query.isLoading ? (
              <div className="grid grid-cols-1 gap-5 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => <FavouriteSkeleton key={index} />)}
              </div>
            ) : query.isError ? (
              <div className="rounded-2xl border border-line bg-card p-8 text-center" role="alert">
                <SearchX className="mx-auto size-7 text-brand" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-ink">{t("loadError")}</p>
                <button type="button" onClick={() => void query.refetch()} className="mt-4 rounded-lg bg-brand px-5 py-2.5 text-xs font-bold text-ink">
                  {t("retry")}
                </button>
              </div>
            ) : !stores.length ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center sm:py-16">
                <div className="grid size-16 place-items-center rounded-full bg-brand/10 text-brand">
                  <Heart className="size-7" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-lg font-bold tracking-[-0.01em] text-ink">{t("emptyTitle")}</h2>
                <p className="mt-2 max-w-[44ch] text-sm leading-6 text-body">{t("emptyDescription")}</p>
                <Link
                  href="/discovery"
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-ink transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <Store className="size-4" aria-hidden="true" />
                  {t("explore")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
                {stores.map((store) => <StoreCard key={store.storeId} store={store} />)}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
