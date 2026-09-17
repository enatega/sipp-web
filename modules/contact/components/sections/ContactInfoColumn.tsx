import { getTranslations } from "next-intl/server";

export async function ContactInfoColumn() {
  const t = await getTranslations("contact.info");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-[26px] font-bold text-ink sm:text-[32px]">{t("title")}</h1>
        <p className="mt-3 text-[15px] font-semibold leading-[1.6] text-brand">{t("tagline")}</p>
        <p className="mt-2 max-w-md text-[15px] leading-[1.7] text-body">{t("body")}</p>
      </div>

      <div className="rounded-[16px] border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-[16px] font-bold text-ink">{t("whatsapp.title")}</h2>
        <p className="mt-1 text-sm leading-[1.6] text-body">{t("whatsapp.subtitle")}</p>
        <a
          href={`tel:${t("whatsapp.phoneHref")}`}
          className="mt-3 inline-flex items-center gap-2 text-[15px] font-semibold text-brand hover:underline"
        >
          {t("whatsapp.phoneDisplay")}
        </a>
      </div>

      <div className="rounded-[16px] border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-[16px] font-bold text-ink">{t("email.title")}</h2>
        <p className="mt-1 text-sm leading-[1.6] text-body">{t("email.subtitle")}</p>
        <a
          href={`mailto:${t("email.address")}`}
          className="mt-3 inline-flex items-center gap-2 text-[15px] font-semibold text-brand hover:underline"
        >
          {t("email.address")}
        </a>
      </div>
    </div>
  );
}
