import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  /** "row" is the header lockup, "stack" is the larger centred lockup. */
  layout?: "row" | "stack";
  href?: string | null;
  className?: string;
};

const LAYOUT = {
  row: "flex items-center gap-[9px]",
  stack: "flex flex-col items-center gap-1 text-center",
};

const MARK = {
  row: "h-10 md:h-14",
  stack: "h-14 md:h-16",
};

export function Logo({
  layout = "row",
  href = "/",
  className = "",
}: LogoProps) {
  const content = (
    <Image
      className={`w-auto flex-none object-contain ${MARK[layout]}`}
      src="/brand/sip-transparent-logo.png"
      alt="SIPP"
      width={394}
      height={266}
      priority
      sizes={layout === "row" ? "280px" : "267px"}
    />
  );

  const classes = `${LAYOUT[layout]} ${className}`.trim();

  if (!href) {
    return (
      <span className={classes} aria-label="SIPP">
        {content}
      </span>
    );
  }
  return (
    <Link href={href} className={classes} aria-label="SIPP home">
      {content}
    </Link>
  );
}
