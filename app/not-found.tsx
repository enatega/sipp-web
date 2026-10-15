import Link from "next/link";
import { ArrowRight, Home, SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <>
      <Header />
      <main className="relative isolate grid min-h-[calc(100svh-4rem)] place-items-center overflow-hidden bg-background py-14 sm:py-20 md:min-h-[calc(100svh-4.75rem)]">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-72 bg-[linear-gradient(180deg,var(--color-brand-soft),transparent)]"
        />

        <section className="section-wrap grid items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16 lg:gap-24">
          <div className="relative mx-auto grid w-full max-w-md place-items-center md:max-w-none">
            <span
              aria-hidden="true"
              className="font-heading text-[clamp(8rem,28vw,17rem)] font-extrabold leading-none tracking-[-0.04em] text-brand/20"
            >
              404
            </span>
            <div className="absolute grid size-24 place-items-center rounded-2xl bg-brand text-ink shadow-[0_14px_36px_rgba(47,143,227,0.24)] sm:size-28">
              <SearchX aria-hidden="true" className="size-11 sm:size-12" strokeWidth={1.8} />
            </div>
          </div>

          <div className="max-w-xl text-center md:text-start">
            <p className="sr-only">{t("codeLabel")}</p>
            <h1 className="text-balance text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-[58ch] text-base leading-7 text-body md:mx-0">
              {t("description")}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink shadow-[0_8px_24px_rgba(47,143,227,0.18)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-[0_12px_30px_rgba(47,143,227,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <Home aria-hidden="true" className="size-4" />
                {t("homeAction")}
              </Link>
              <Link
                href="/discovery"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-bold text-ink transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {t("browseAction")}
                <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
