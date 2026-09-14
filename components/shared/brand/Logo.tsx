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
  row: "h-[42px] md:h-12",
  stack: "h-16",
};

export function Logo({
  layout = "row",
  href = "/",
  className = "",
}: LogoProps) {
  const content = (
    <Image
      className={`w-auto flex-none object-contain ${MARK[layout]}`}
      src="/brand/shaaneiol-logo.png"
      alt="Shaaneiol — Makes Life Easier"
      width={228}
      height={220}
      priority
      sizes="120px"
    />
  );

  const classes = `${LAYOUT[layout]} ${className}`.trim();

  if (!href) {
    return (
      <span className={classes} aria-label="Shaaneiol">
        {content}
      </span>
    );
  }
  return (
    <Link href={href} className={classes} aria-label="Shaaneiol home">
      {content}
    </Link>
  );
}
