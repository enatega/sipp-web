import { Icon } from "@/components/shared/brand/Icon";
import { AppPhone } from "@/modules/home/components/visuals/AppPhone";
import { benefits } from "@/modules/home/data/site-data";

const BENEFIT_TONE: Record<string, string> = {
  mint: "bg-[#3ddba0] text-white",
  peach: "bg-[#ffc79a] text-[#a4571c]",
  forest: "bg-[#0f3d2e] text-[#5fe0a6]",
  periwinkle: "bg-[#dbe2fb] text-[#4054c0]",
  sky: "bg-[#dbe8fb] text-[#2f6ec4]",
};

export function EverythingSection() {
  return (
    <section id="services" className="bg-blush py-16 md:py-[88px]">
      <div className="section-wrap grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,38%)_minmax(0,62%)] md:gap-8 lg:grid-cols-[minmax(0,34%)_minmax(0,66%)] lg:gap-14">
        <div className="flex justify-center">
          <AppPhone />
        </div>
        <div>
          <h2 className="mb-5 text-[clamp(28px,3vw,42px)] font-extrabold leading-[1.08] tracking-[-0.025em]">
            Everything You Need,
            <br />
            <span className="text-brand">All in One Place.</span>
          </h2>
          <p className="mb-[30px] max-w-[560px] text-body">
            SIPP makes everyday ordering easier for coastal communities,
            bringing local restaurants, supermarkets, drinks, and essentials
            into one clear delivery experience.
          </p>
          <div className="grid grid-cols-1 gap-x-[22px] gap-y-4 md:grid-cols-2">
            {benefits.map(({ icon, tone, title, copy, toggle }) => (
              <div
                className="flex items-center gap-3.5 rounded-[18px] border border-line bg-card px-5 py-4 shadow-card"
                key={title}
              >
                <i
                  className={`grid size-9 flex-none place-items-center rounded-full ${BENEFIT_TONE[tone]}`}
                >
                  <Icon name={icon} className="size-4 flex-none" />
                </i>
                <span className="flex flex-col">
                  <b className="flex items-center gap-2 font-heading text-sm font-semibold">
                    {title}
                    {/* Green Choice reads as an opt-in the customer switched on */}
                    {toggle ? (
                      <em
                        className="relative h-3.5 w-[26px] flex-none rounded-full bg-[#1db954] after:absolute after:right-0.5 after:top-0.5 after:size-2.5 after:rounded-full after:bg-white after:content-['']"
                        aria-hidden="true"
                      />
                    ) : null}
                  </b>
                  <small className="mt-[3px] text-[11px] leading-[1.4] text-muted">
                    {copy}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
