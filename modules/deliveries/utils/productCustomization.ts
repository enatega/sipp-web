import type { CartSelectionInput } from "../types/cart";
import type { ProductCustomizationSection, ProductCustomizations } from "../types/restaurant";

export interface VariationChoice {
  groupId: string;
  optionId: string;
  title: string;
  price: number;
}

/**
 * Add-on groups may allow only one choice while still permitting customers to
 * remove that choice. Variations use a separate, required radio selection.
 */
export function toggleCustomizationOption(
  section: ProductCustomizationSection,
  selectedOptionIds: string[],
  optionId: string,
): string[] {
  if (selectedOptionIds.includes(optionId)) {
    return selectedOptionIds.filter((id) => id !== optionId);
  }
  if (section.selectionType === "single") {
    return [optionId];
  }
  if (section.maxSelect && selectedOptionIds.length >= section.maxSelect) {
    return selectedOptionIds;
  }
  return [...selectedOptionIds, optionId];
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

/** A quick add is safe only when the customer has no choices to make. */
export function quickAddSelections(
  customizations: ProductCustomizations,
): CartSelectionInput[] | null {
  if (customizations.addons.length || customizations.variations.length > 1) return null;
  const choices = buildVariationChoices(customizations.variations);
  if (choices.length > 1) return null;
  if (customizations.variations.length && choices.length !== 1) return null;
  return cartSelections(choices[0] ?? null, {});
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
