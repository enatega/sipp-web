"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [confirmedFavorite, setConfirmedFavorite] = useState<boolean | null>(null);
  useEffect(() => { setConfirmedFavorite(null); }, [isFavorite, storeId]);
  const isShownFavorite = favourite.isPending ? !(confirmedFavorite ?? isFavorite) : (confirmedFavorite ?? isFavorite);

  function toggle() {
    if (session.data?.authenticated !== true) {
      openAuthRequiredDialog(`${window.location.pathname}${window.location.search}`);
      return;
    }
    favourite.mutate(undefined, {
      onSuccess: (result) => {
        setConfirmedFavorite(result.isFavorite);
        notify.success(result.isFavorite ? "addedToFavourites" : "removedFromFavourites");
      },
      onError: (caught) => {
        setConfirmedFavorite(null);
        notify.error(caught, "favouriteUpdateFailed");
      },
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
