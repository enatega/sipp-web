"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/brand/Icon";
import { LocationModal } from "@/modules/account/components/location/LocationModal";
import { readStoredPlace } from "@/modules/account/api/location";
import { useSessionQuery } from "@/modules/account/queries/useAccountQueries";
import type { ChosenPlace } from "@/modules/account/types";

/**
 * Header entry point for the location picker. Signed-in visitors continue
 * into the save-address step after confirming; guests just keep the pick
 * for this browser.
 */
export function LocationTrigger() {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<ChosenPlace | null>(null);
  const session = useSessionQuery();

  useEffect(() => {
    const sync = () => setPlace(readStoredPlace());
    sync();
    window.addEventListener("shaaneiol-location-change", sync);
    return () => window.removeEventListener("shaaneiol-location-change", sync);
  }, []);

  const summary = place?.label ?? place?.address.split(",")[0] ?? "Location";

  return (
    <>
      <button
        id="delivery-location-trigger"
        className="flex min-h-11 min-w-0 max-w-[120px] items-center gap-1 whitespace-nowrap text-[11px] text-ink sm:max-w-[180px] sm:text-[13px]"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Icon name="pin" className="size-3 flex-none sm:size-3.5" />
        <b className="truncate font-semibold">{summary}</b>
        <Icon name="chevron" className="size-3 flex-none" />
      </button>

      <LocationModal
        open={open}
        onClose={() => setOpen(false)}
        canSaveAddress={session.data?.authenticated === true}
      />
    </>
  );
}
