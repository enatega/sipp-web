import { SkeletonLine } from "./SkeletonLine";

interface Props {
  hasDescription?: boolean;
}

/** Mirrors `SectionHeading` for sections whose title is not known yet. */
export function SectionHeadingSkeleton({ hasDescription = false }: Props) {
  return (
    <div className="max-w-2xl">
      <SkeletonLine
        barClassName="w-40 sm:w-56"
        className="font-heading text-[1.35rem] font-extrabold sm:text-[1.7rem]"
      />
      {hasDescription ? (
        <SkeletonLine barClassName="w-64 sm:w-96" className="mt-1 text-xs leading-5 sm:text-sm" />
      ) : null}
    </div>
  );
}
