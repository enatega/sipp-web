import { BriefcaseBusiness, House, MapPin } from "lucide-react";
import type { AddressType } from "@/modules/account/types";

interface Props {
  type: AddressType;
  className?: string;
}

export function SavedAddressIcon({ type, className }: Props) {
  if (type === "HOME") return <House aria-hidden="true" className={className} />;
  if (type === "OFFICE") {
    return <BriefcaseBusiness aria-hidden="true" className={className} />;
  }
  return <MapPin aria-hidden="true" className={className} />;
}
