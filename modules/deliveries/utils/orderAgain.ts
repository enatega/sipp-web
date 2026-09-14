import type { AddCartItemInput, CartSelectionInput } from "../types/cart";
import type {
  OrderProduct,
  OrderProductOption,
} from "../types/orders";
import type {
  ProductCustomizationSection,
  ProductCustomizations,
} from "../types/restaurant";

function normalize(value?: string | null) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function findSection(
  sections: ProductCustomizationSection[],
  selection: OrderProductOption,
) {
  const groupName = normalize(selection.groupName);
  return sections.find((section) => normalize(section.name) === groupName);
}

function mapSelections(
  product: OrderProduct,
  customizations: ProductCustomizations,
): CartSelectionInput[] | undefined {
  const selections = product.selectedOptions ?? [];
  if (!selections.length) return undefined;
  const sections = [...customizations.variations, ...customizations.addons];

  return selections.map((selection) => {
    const section = findSection(sections, selection);
    if (!section) throw new Error("customization-not-found");
    if (section.options.length === 0) {
      return { groupId: section.groupId, optionId: section.groupId };
    }
    const optionName = normalize(selection.optionName);
    const option = section.options.find(
      (candidate) => normalize(candidate.title) === optionName,
    );
    if (!option) throw new Error("customization-not-found");
    return { groupId: section.groupId, optionId: option.optionId };
  });
}

export function buildOrderAgainInput(
  product: OrderProduct,
  customizations?: ProductCustomizations,
): AddCartItemInput {
  if (!product.productId) throw new Error("product-not-found");
  const selectedOptions = product.selectedOptions?.length
    ? mapSelections(product, customizations ?? { variations: [], addons: [] })
    : undefined;
  return {
    productId: product.productId,
    quantity: product.quantity > 0 ? product.quantity : 1,
    selectedOptions,
  };
}
