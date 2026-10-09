import { getTranslations } from "next-intl/server";

const SANTA_TERESA_COORDS = "9.6467,-85.1670";

function staticMapSrc(width: number, height: number, scale: 1 | 2) {
  const params = new URLSearchParams({
    center: SANTA_TERESA_COORDS,
    zoom: "13",
    size: `${width}x${height}`,
    scale: String(scale),
    markers: `color:red|${SANTA_TERESA_COORDS}`,
    markerStyles: "color:red|label:S|size:small",
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export async function ContactMapBanner() {
  const t = await getTranslations("contact.map");

  return (
    <section id="top" className="relative h-[220px] w-full overflow-hidden bg-[var(--soft-surface)] sm:h-[380px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- above-the-fold Google Static Maps image, kept eager */}
      <img
        src={staticMapSrc(1500, 500, 2)}
        alt={t("alt")}
        width={1500}
        height={500}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full select-none object-cover"
      />
    </section>
  );
}
