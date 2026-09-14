import type { Ref } from "react";
import { DeliveryNotice } from "../feedback/DeliveryNotice";
import styles from "./checkout-transitions.module.css";

export interface CheckoutAlert {
  id: string;
  message: string;
  onDismiss: () => void;
  title: string;
}

interface Props {
  dismissLabel: string;
  notices: CheckoutAlert[];
  regionRef: Ref<HTMLDivElement>;
}

export function CheckoutAlertStack({
  dismissLabel,
  notices,
  regionRef,
}: Props) {
  if (!notices.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 px-3 pt-3 md:top-[76px] sm:px-6">
      <div
        className="mx-auto max-h-[calc(100dvh-5.5rem)] max-w-2xl space-y-2 overflow-y-auto outline-none"
        ref={regionRef}
        tabIndex={-1}
      >
        {notices.map((notice) => (
          <DeliveryNotice
            className={`pointer-events-auto shadow-pop ${styles.alertEnter}`}
            dismissLabel={dismissLabel}
            key={notice.id}
            message={notice.message}
            onDismiss={notice.onDismiss}
            title={notice.title}
            tone="error"
          />
        ))}
      </div>
    </div>
  );
}
