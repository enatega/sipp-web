import { Icon } from "@/components/shared/brand/Icon";
import { serviceStrip } from "@/modules/home/data/site-data";

export function ServiceStrip() {
  return (
    <nav className="bg-brand text-white" aria-label="Shaaneiol products">
      <div className="section-wrap flex flex-nowrap items-center justify-start gap-8 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:h-[46px] md:justify-between md:gap-5 md:overflow-visible md:py-0">
        {serviceStrip.map((label) => (
          <a
            key={label}
            href="#products"
            className="inline-flex items-center gap-2 whitespace-nowrap text-[10px] font-semibold tracking-[0.1em] opacity-[0.94] hover:opacity-100 md:text-[11px] md:tracking-[0.16em]"
          >
            {label}
            <Icon name="chevron" className="size-2.5 flex-none" />
          </a>
        ))}
      </div>
    </nav>
  );
}
