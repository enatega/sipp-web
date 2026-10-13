import assert from "node:assert/strict";
import test from "node:test";
import { quickAddSelections, toggleCustomizationOption } from "./productCustomization.ts";

const choice = (optionId) => ({ optionId, title: optionId, description: null, price: 100 });
const variation = (options) => ({
  groupId: "size", name: "Size", description: null, type: "variation",
  minSelect: 1, maxSelect: 1, required: true, selectionType: "single",
  helperText: null, options: options.map(choice),
});

test("quick add needs no selection for a plain product", () => {
  assert.deepEqual(quickAddSelections({ variations: [], addons: [] }), []);
});

test("quick add includes the sole variation", () => {
  assert.deepEqual(
    quickAddSelections({ variations: [variation(["small"])], addons: [] }),
    [{ groupId: "size", optionId: "small" }],
  );
});

test("multiple variations and add-ons require the details sheet", () => {
  assert.equal(quickAddSelections({ variations: [variation(["small", "large"])], addons: [] }), null);
  assert.equal(quickAddSelections({ variations: [variation(["small"])], addons: [variation(["ice"])] }), null);
});

test("a selected single-choice add-on can be removed", () => {
  const removeIngredient = {
    ...variation(["no-onion", "no-tomato"]),
    required: false,
    minSelect: 0,
  };

  assert.deepEqual(
    toggleCustomizationOption(removeIngredient, ["no-onion"], "no-onion"),
    [],
  );
  assert.deepEqual(
    toggleCustomizationOption(removeIngredient, ["no-onion"], "no-tomato"),
    ["no-tomato"],
  );
});
