import Image from "next/image";

export function AuthBrand({
  compact = false,
  centered = false,
}: {
  compact?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 text-brand ${
        centered ? "justify-center" : ""
      } ${compact ? "mb-0" : "mb-[clamp(16px,2.2vh,22px)]"}`}
    >
      <Image
        src="/images/Shaaeiol-logo-Vector.png"
        alt=""
        width={208}
        height={162}
        className="h-auto w-[clamp(48px,4.4vw,80px)] object-contain"
        priority
      />
      <span className="flex flex-col leading-none">
        <strong className="font-crest text-[clamp(20px,5.4vw,27px)] font-semibold tracking-[0.05em] md:text-[clamp(23px,2.4vw,36px)]">
          SHAANEIOL
        </strong>
        <small className="mt-[5px] text-center font-heading text-[clamp(10px,1.2vw,18px)] font-semibold tracking-[0.03em]">
          Makes Life Easier
        </small>
      </span>
    </div>
  );
}
