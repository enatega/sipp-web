import Image from "next/image";
import { Icon } from "@/components/shared/brand/Icon";
import type { Glyph as GlyphSpec } from "@/modules/home/data/hero-slides";

/**
 * A slide glyph is either a supplied illustration from `public/images` or one
 * of the drawn line icons, so artwork can be swapped per slide from the data
 * file without the components caring which kind it got.
 */
export function Glyph({
  glyph,
  className,
}: {
  glyph: GlyphSpec;
  className: string;
}) {
  if ("img" in glyph) {
    return (
      <Image
        src={glyph.img}
        alt={glyph.alt ?? ""}
        width={72}
        height={72}
        className={`flex-none object-contain ${className}`}
      />
    );
  }
  return <Icon name={glyph.name} className={`flex-none ${className}`} />;
}
