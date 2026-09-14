import styles from "@/modules/home/styles/home.module.css";

/** Shared iPhone shell bits: dynamic island plus the status bar row. */
export function PhoneStatus({ left = "9:41" }: { left?: string }) {
  return (
    <>
      <span className={styles.phoneIsland} aria-hidden="true" />
      <div className={styles.phoneStatus}>
        <b>{left}</b>
        <span className={styles.phoneSignal} aria-hidden="true">
          <svg viewBox="0 0 18 12">
            <rect x="0" y="7" width="2.4" height="5" rx="0.8" />
            <rect x="3.6" y="5" width="2.4" height="7" rx="0.8" />
            <rect x="7.2" y="2.6" width="2.4" height="9.4" rx="0.8" />
            <rect x="10.8" y="0" width="2.4" height="12" rx="0.8" />
          </svg>
          <svg viewBox="0 0 14 11">
            <path d="M7 9.6 5.2 7.7a2.6 2.6 0 0 1 3.6 0zM7 6a5 5 0 0 0-3.5 1.4L2.2 6.1a6.8 6.8 0 0 1 9.6 0l-1.3 1.3A5 5 0 0 0 7 6zM7 2.4c-2.2 0-4.3.9-5.9 2.4L0 3.6a10.4 10.4 0 0 1 14 0l-1.1 1.2A8.5 8.5 0 0 0 7 2.4z" />
          </svg>
          <svg viewBox="0 0 22 11">
            <rect x="0.5" y="0.5" width="17" height="10" rx="3" fill="none" strokeWidth="1" />
            <rect x="2" y="2" width="12" height="7" rx="1.6" />
            <path d="M19 4v3a2 2 0 0 0 0-3z" />
          </svg>
        </span>
      </div>
    </>
  );
}
