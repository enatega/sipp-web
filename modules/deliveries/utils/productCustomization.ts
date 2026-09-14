import type { CartSelectionInput } from "../types/cart";
import type { ProductCustomizationSection, ProductCustomizations } from "../types/restaurant";

export interface VariationChoice {
  groupId: string;
  optionId: string;
  title: string;
  price: number;
}

export function buildVariationChoices(
  sections: ProductCustomizationSection[],
): VariationChoice[] {
  if (!sections.length) return [];
  const isOptionlessMode = sections.every(
    (section) =>
      section.options.length === 1 &&
      section.options[0]?.optionId === section.groupId,
  );
  if (isOptionlessMode) {
    return sections.flatMap((section) => {
      const option = section.options[0];
      return option
        ? [{ groupId: section.groupId, optionId: option.optionId, title: section.name, price: option.price }]
        : [];
    });
  }
  const section = sections[0];
  return (section?.options ?? []).map((option) => ({
    groupId: section.groupId,
    optionId: option.optionId,
    title: option.title,
    price: option.price,
  }));
}

export function missingCustomizationGroups(
  customizations: ProductCustomizations,
  selectedVariation: VariationChoice | null,
  selectedByGroup: Record<string, string[]>,
) {
  const missing: string[] = [];
  if (
    customizations.variations.some((section) => section.required || section.minSelect > 0) &&
    !selectedVariation
  ) {
    missing.push("__variation__");
  }
  customizations.addons.forEach((section) => {
    const minimum = section.required ? Math.max(1, section.minSelect) : section.minSelect;
    if ((selectedByGroup[section.groupId]?.length ?? 0) < minimum) {
      missing.push(section.groupId);
    }
  });
  return missing;
}

export function cartSelections(
  selectedVariation: VariationChoice | null,
  selectedByGroup: Record<string, string[]>,
): CartSelectionInput[] {
  return [
    ...(selectedVariation
      ? [{ groupId: selectedVariation.groupId, optionId: selectedVariation.optionId }]
      : []),
    ...Object.entries(selectedByGroup).flatMap(([groupId, optionIds]) =>
      optionIds.map((optionId) => ({ groupId, optionId })),
    ),
  ];
}
