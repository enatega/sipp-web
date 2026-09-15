"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SessionExpiredModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const show = () => setOpen(true);
    const hide = () => setOpen(false);
    window.addEventListener("shaanieol:session-expired", show);
    window.addEventListener("shaanieol:intentional-logout", hide);
    return () => {
      window.removeEventListener("shaanieol:session-expired", show);
      window.removeEventListener("shaanieol:intentional-logout", hide);
    };
  }, []);
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="session-expired-title">
    <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-2xl">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">!</div>
      <h2 id="session-expired-title" className="mt-4 text-lg font-semibold">Your session has expired</h2>
      <p className="mt-2 text-sm text-muted">For your security, please log in again to continue.</p>
      <button type="button" onClick={() => { setOpen(false); router.replace("/login"); }} className="mt-6 w-full rounded-full bg-brand px-4 py-3 text-sm font-semibold text-ink">Login Again</button>
      <button type="button" onClick={() => setOpen(false)} className="mt-2 w-full py-2 text-sm text-muted">Close</button>
    </div>
  </div>;
}
