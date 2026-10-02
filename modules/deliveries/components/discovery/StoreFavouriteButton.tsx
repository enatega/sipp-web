"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { openAuthRequiredDialog } from "@/components/shared/authRequiredEvent";
import { useActionToast } from "@/components/shared/useActionToast";
import { cn } from "@/lib/utils";
import { useSessionQuery } from "@/modules/account";
import { useToggleStoreFavourite } from "@/modules/deliveries/hooks/useDiscoveryQueries";

interface Props {
  storeId: string;
  name: string;
  isFavorite: boolean;
  className?: string;
}

export function StoreFavouriteButton({ storeId, name, isFavorite, className }: Props) {
  const t = useTranslations("deliveries.discovery");
  const session = useSessionQuery();
  const notify = useActionToast();
  const favourite = useToggleStoreFavourite(storeId);
  // Show the next state while the toggle and its refetch are in flight.
  const isShownFavorite = favourite.isPending ? !isFavorite : isFavorite;

  function toggle() {
    if (session.data?.authenticated !== true) {
      openAuthRequiredDialog(`${window.location.pathname}${window.location.search}`);
      return;
    }
    favourite.mutate(undefined, {
      onSuccess: () => notify.success(isFavorite ? "removedFromFavourites" : "addedToFavourites"),
      onError: (caught) => notify.error(caught, "favouriteUpdateFailed"),
    });
  }

  return (
    <button
      aria-label={t(isShownFavorite ? "unfavouriteStore" : "favouriteStore", { name })}
      aria-pressed={isShownFavorite}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-card/95 text-ink shadow-sm backdrop-blur-sm transition duration-200 hover:scale-110 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait",
        className,
      )}
      disabled={favourite.isPending}
      onClick={(event) => {
        event.stopPropagation();
        toggle();
      }}
      type="button"
    >
      <Heart
        aria-hidden="true"
        className={cn("size-[18px] transition-colors", isShownFavorite && "fill-secondary text-secondary")}
        strokeWidth={2.25}
      />
    </button>
  );
}
