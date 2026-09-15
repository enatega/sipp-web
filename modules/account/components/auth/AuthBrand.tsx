import { Logo } from "@/components/shared/brand/Logo";

export function AuthBrand({
  compact = false,
  centered = false,
}: {
  compact?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={`flex items-center ${
        centered ? "justify-center" : ""
      } ${compact ? "mb-0" : "mb-[clamp(16px,2.2vh,22px)]"}`}
    >
      <Logo
        href={null}
        className={
          compact
            ? "[&_img]:h-10"
            : "[&_img]:h-[clamp(48px,5.2vw,64px)]"
        }
      />
    </div>
  );
}
