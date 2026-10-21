import Link from "next/link";
import { SearchX } from "lucide-react";

interface Props {
  actionHref: string;
  actionLabel: string;
  message: string;
  title: string;
}

/** In-page "not found" state for a store or order link that cannot resolve. */
export function ResourceNotFound({ actionHref, actionLabel, message, title }: Props) {
  return (
    <div className="max-w-md text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/15 text-brand">
        <SearchX aria-hidden="true" className="size-6" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-body">{message}</p>
      <Link
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-ink transition-colors hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        href={actionHref}
      >
        {actionLabel}
      </Link>
    </div>
  );
}
