"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Search, UtensilsCrossed } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Header } from "@/components/shared/app-shell/Header";
import { useSessionQuery } from "@/modules/account";
import { openAuthRequiredDialog } from "@/components/shared/authRequiredEvent";
import { useActionToast } from "@/components/shared/useActionToast";
import { ApiError } from "@/services/api/client";
import { CategoryNavigation, MobileCategoryNavigation } from "./CategoryNavigation";
import { ProductConfigurator } from "./ProductConfigurator";
import { RestaurantHero } from "./RestaurantHero";
import { RestaurantInfo } from "./RestaurantInfo";
import { StoreClosedNotice } from "./StoreClosedNotice";
import { RestaurantProductCard } from "./RestaurantProductCard";
import { useCategoryScrollSpy } from "../../hooks/useCategoryScrollSpy";
import {
  useCartMutations,
  useCartQuery,
  useRestaurantLocation,
  useRestaurantProductsQuery,
  useRestaurantQuery,
  useRestaurantSlug,
  useToggleRestaurantFavourite,
} from "../../hooks/useRestaurantQueries";
import { restaurantApi } from "../../api/restaurant";
import { deliveryQueryKeys } from "../../queries/queryKeys";
import { quickAddSelections } from "../../utils/productCustomization";
import { getLocalizedProductName } from "../../utils/productTranslation";
import type { RestaurantCategory, RestaurantProduct } from "../../types/restaurant";

interface Props {
  slug: string;
}

export function RestaurantPage({ slug }: Props) {
  const t = useTranslations("deliveries.restaurant");
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const { location, isReady } = useRestaurantLocation();
  const isLegacyId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
  const slugQuery = useRestaurantSlug(isLegacyId ? "" : slug);
  const storeId = isLegacyId ? slug : (slugQuery.data?.storeId ?? "");
  const restaurant = useRestaurantQuery(storeId, location);
  const cart = useCartQuery(authenticated);
  const { addItem } = useCartMutations();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const quickAddLock = useRef(false);
  const [quickAddingProductId, setQuickAddingProductId] = useState<string | null>(null);
  const [detailsSection, setDetailsSection] = useState<"overview" | "opening-hours" | null>(null);
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string | null>>({});
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    searchParams.get("productId"),
  );

  const productsQuery = useRestaurantProductsQuery(storeId, location, search);
  const favourite = useToggleRestaurantFavourite(storeId, location);
  const notify = useActionToast();
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = productsQuery;

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const products = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [productsQuery.data?.pages],
  );
  const categories = useMemo(() => {
    const storeCategories = restaurant.data?.categories ?? [];
    const knownIds = new Set(storeCategories.map((category) => category.id));
    const uncategorized = products.some((product) => !knownIds.has(product.categoryId));
    return uncategorized
      ? [
        ...storeCategories,
        { id: "uncategorized", name: t("otherCategory"), imageUrl: null, subcategoryIds: [] },
      ]
      : storeCategories;
  }, [products, restaurant.data?.categories, t]);
  const categoryIds = useMemo(() => categories.map((category) => category.id), [categories]);
  const { activeCategoryId, scrollToCategory, setSectionRef } =
    useCategoryScrollSpy(categoryIds);

  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, RestaurantProduct[]>();
    categories.forEach((category) => grouped.set(category.id, []));
    products.forEach((product) => {
      const key = grouped.has(product.categoryId) ? product.categoryId : "uncategorized";
      grouped.get(key)?.push(product);
    });
    return grouped;
  }, [categories, products]);
  const cartQuantityByProduct = useMemo(() => {
    const quantities = new Map<string, number>();
    cart.data?.items.forEach((item) => {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    });
    return quantities;
  }, [cart.data]);

  async function shareRestaurant() {
    const shareData = { title: restaurant.data?.name ?? t("restaurantFallback"), url: window.location.href };
    if (navigator.share) await navigator.share(shareData).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.href);
  }

  function requireSignIn() {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    openAuthRequiredDialog(returnTo);
  }

  async function quickAddProduct(product: RestaurantProduct) {
    if (quickAddLock.current) return;
    if (!authenticated) return requireSignIn();
    if (!cart.data || cart.isPending || cart.isError) return setSelectedProductId(product.id);
    quickAddLock.current = true;
    setQuickAddingProductId(product.id);
    try {
      const [info, customizations] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: deliveryQueryKeys.productInfo(product.id),
          queryFn: ({ signal }) => restaurantApi.productInfo(product.id, signal),
          staleTime: 2 * 60_000,
        }),
        queryClient.fetchQuery({
          queryKey: deliveryQueryKeys.productCustomizations(product.id),
          queryFn: ({ signal }) => restaurantApi.productCustomizations(product.id, signal),
          staleTime: 2 * 60_000,
        }),
      ]);
      const selections = quickAddSelections(customizations);
      if (!info.inStock || !selections || (cart.data.storeId && cart.data.storeId !== info.storeId)) {
        setSelectedProductId(product.id);
        return;
      }
      const previousQuantity = cartQuantityByProduct.get(product.id) ?? 0;
      const updatedCart = await addItem.mutateAsync({
        productId: product.id,
        quantity: 1,
        selectedOptions: selections,
      });
      const updatedQuantity = updatedCart.items.reduce(
        (total, item) => total + (item.productId === product.id ? item.quantity : 0),
        0,
      );
      if (updatedQuantity < previousQuantity + 1) throw new ApiError("Cart item was not added.", 422);
      notify.success("addedToCart", { product: getLocalizedProductName(product, locale) });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) requireSignIn();
      else if (error instanceof ApiError && error.status === 409) setSelectedProductId(product.id);
      else toast.error(t("cartError"));
    } finally {
      quickAddLock.current = false;
      setQuickAddingProductId(null);
    }
  }

  if (!isReady || (!isLegacyId && slugQuery.isPending)) {
    return (
      <><Header cartCount={cart.data?.totalItems ?? 0} /><main className="grid min-h-[60vh] place-items-center bg-background text-brand"><LoaderCircle aria-hidden="true" className="size-8 animate-spin" /><span className="sr-only">{t("loading")}</span></main></>
    );
  }

  // Without a location the store request never runs (it stays "pending"),
  // so ask for a location before treating the page as loading (BUG-006).
  if (!location) {
    return (
      <><Header cartCount={cart.data?.totalItems ?? 0} /><main className="section-wrap grid min-h-[60vh] place-items-center py-16 text-center"><div><UtensilsCrossed aria-hidden="true" className="mx-auto size-10 text-brand" /><h1 className="mt-4 text-xl font-bold text-ink">{t("chooseLocationTitle")}</h1><p className="mt-2 text-sm text-body">{t("chooseLocationMessage")}</p></div></main></>
    );
  }

  // Wait for the first page of products too, so opening a store shows one
  // loading state instead of a page spinner followed by a menu spinner.
  // (Later searches keep the in-page spinner.)
  // No storeId means the link did not resolve; fall through to the error state.
  if (storeId && (restaurant.isPending || (productsQuery.isPending && !search))) {
    return (
      <><Header cartCount={cart.data?.totalItems ?? 0} /><main className="grid min-h-[60vh] place-items-center bg-background text-brand"><LoaderCircle aria-hidden="true" className="size-8 animate-spin" /><span className="sr-only">{t("loading")}</span></main></>
    );
  }

  if ((!isLegacyId && slugQuery.isError) || restaurant.isError || !restaurant.data) {
    return (
      <><Header cartCount={cart.data?.totalItems ?? 0} /><main className="section-wrap grid min-h-[60vh] place-items-center py-16 text-center"><div><h1 className="text-xl font-bold text-ink">{t("loadErrorTitle")}</h1><p className="mt-2 text-sm text-body">{t("loadErrorMessage")}</p><button className="mt-5 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-ink" onClick={() => void restaurant.refetch()} type="button">{t("retry")}</button></div></main></>
    );
  }

  const store = restaurant.data;
  const toggleFavourite = () => {
    favourite.mutate(undefined, {
      onSuccess: (result) => notify.success(result.isFavorite ? "addedToFavourites" : "removedFromFavourites"),
      onError: (caught) => notify.error(caught, "favouriteUpdateFailed"),
    });
  };
  return (
    <>
      <Header cartCount={cart.data?.totalItems ?? 0} />
      <main className="min-w-0 bg-background">
        <RestaurantHero isFavouritePending={authenticated && favourite.isPending} onOpenDetails={() => setDetailsSection("overview")} onShare={() => void shareRestaurant()} onToggleFavourite={() => authenticated ? toggleFavourite() : requireSignIn()} store={store} />
        <MobileCategoryNavigation activeCategoryId={activeCategoryId} categories={categories} categoryLabel={t("categories")} onSelect={scrollToCategory} />

        <div className="mx-auto grid min-h-[700px] max-w-[1540px] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
          <CategoryNavigation activeCategoryId={activeCategoryId} categories={categories} categoryLabel={t("categories")} onSelect={scrollToCategory} />
          <section className="min-w-0 px-[18px] py-6 sm:px-7 lg:px-7 xl:px-9">
            {!store.isAvailable ? <StoreClosedNotice onViewOpeningHours={() => setDetailsSection("opening-hours")} /> : null}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-ink">{t("menu")}</h2>
              <div className="flex items-center gap-2">
                <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-card px-3.5 sm:w-72">
                  <Search aria-hidden="true" className="size-4 shrink-0 text-muted" />
                  <span className="sr-only">{t("searchLabel")}</span>
                  <input className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none" onChange={(event) => setSearchInput(event.target.value)} placeholder={t("searchPlaceholder")} value={searchInput} />
                </label>
              </div>
            </div>

            {productsQuery.isPending ? (
              <div className="grid min-h-80 place-items-center text-brand"><LoaderCircle aria-hidden="true" className="size-8 animate-spin" /><span className="sr-only">{t("loadingProducts")}</span></div>
            ) : productsQuery.isError ? (
              <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8 text-center"><h3 className="font-bold text-ink">{t("productsErrorTitle")}</h3><p className="mt-2 text-sm text-body">{t("productsErrorMessage")}</p><button className="mt-4 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-ink" onClick={() => void productsQuery.refetch()} type="button">{t("retry")}</button></div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-line bg-card p-10 text-center"><h3 className="font-bold text-ink">{t("noProductsTitle")}</h3><p className="mt-2 text-sm text-body">{search ? t("noSearchResults") : t("noProductsMessage")}</p></div>
            ) : (
              <div className="space-y-10">
                {categories.map((category: RestaurantCategory) => {
                  const categoryProducts = productsByCategory.get(category.id) ?? [];
                  if (!categoryProducts.length) return null;
                  const categorySubcategories = store.subcategories.filter((subcategory) =>
                    category.subcategoryIds.includes(subcategory.id) &&
                    categoryProducts.some((product) => product.subcategoryId === subcategory.id),
                  );
                  const selectedSubcategoryId = selectedSubcategories[category.id] ?? null;
                  const visibleProducts = selectedSubcategoryId
                    ? categoryProducts.filter((product) => product.subcategoryId === selectedSubcategoryId)
                    : categoryProducts;
                  return (
                    <section className="scroll-mt-40" data-category-id={category.id} key={category.id} ref={setSectionRef(category.id)}>
                      <div className="mb-4 flex items-baseline gap-2"><h3 className="text-xl font-bold text-ink">{category.name}</h3><span className="text-xs text-muted">{t("itemCount", { count: visibleProducts.length })}</span></div>
                      {categorySubcategories.length > 0 ? (
                        <div aria-label={t("subcategoryFilter", { category: category.name })} className="-mx-1 mb-5 flex snap-x gap-2 overflow-x-auto px-1 pb-1" role="group">
                          <button
                            aria-pressed={selectedSubcategoryId === null}
                            className={`min-h-10 shrink-0 snap-start rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${selectedSubcategoryId === null ? "border-brand bg-brand text-ink" : "border-line bg-card text-body hover:border-brand/40 hover:text-ink"}`}
                            onClick={() => setSelectedSubcategories((current) => ({ ...current, [category.id]: null }))}
                            type="button"
                          >
                            {t("allSubcategories")}
                          </button>
                          {categorySubcategories.map((subcategory) => {
                            const isSelected = selectedSubcategoryId === subcategory.id;
                            return (
                              <button
                                aria-pressed={isSelected}
                                className={`min-h-10 shrink-0 snap-start rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${isSelected ? "border-brand bg-brand text-ink" : "border-line bg-card text-body hover:border-brand/40 hover:text-ink"}`}
                                key={subcategory.id}
                                onClick={() => setSelectedSubcategories((current) => ({ ...current, [category.id]: subcategory.id }))}
                                type="button"
                              >
                                {subcategory.name}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {visibleProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                          {visibleProducts.map((product) => <RestaurantProductCard cartQuantity={cartQuantityByProduct.get(product.id) ?? 0} isQuickAddBlocked={quickAddingProductId !== null} isQuickAdding={quickAddingProductId === product.id} isStoreAvailable={store.isAvailable} key={product.id} onQuickAdd={quickAddProduct} onSelect={setSelectedProductId} product={product} />)}
                        </div>
                      ) : (
                        <p className="rounded-xl bg-soft-surface px-4 py-5 text-sm text-body">{t("noSubcategoryProducts")}</p>
                      )}
                    </section>
                  );
                })}
                {productsQuery.isFetchingNextPage ? <div className="flex justify-center py-4 text-brand"><LoaderCircle aria-hidden="true" className="size-6 animate-spin" /></div> : null}
              </div>
            )}
          </section>

          {selectedProductId ? <ProductConfigurator isStoreAvailable={store.isAvailable} isAuthenticated={authenticated} key={selectedProductId} onClose={() => setSelectedProductId(null)} onRequireSignIn={requireSignIn} previewProduct={products.find((product) => product.id === selectedProductId)} productId={selectedProductId} storeName={store.name} /> : null}
        </div>
        {detailsSection ? <RestaurantInfo focusOpeningHours={detailsSection === "opening-hours"} onClose={() => setDetailsSection(null)} store={store} /> : null}
      </main>
    </>
  );
}
