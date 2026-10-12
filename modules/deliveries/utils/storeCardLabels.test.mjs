import assert from "node:assert/strict";
import test from "node:test";
import { storeDeliveryTimeLabel } from "./storeCardLabels.ts";

const minutes = (count) => `${count} min`;

test("formats backend time durations as delivery minutes", () => {
  assert.equal(storeDeliveryTimeLabel("00:10:00", minutes), "10 min");
  assert.equal(storeDeliveryTimeLabel("01:05:30", minutes), "66 min");
});

test("retains human-readable estimates and hides empty durations", () => {
  assert.equal(storeDeliveryTimeLabel("30 mins", minutes), "30 mins");
  assert.equal(storeDeliveryTimeLabel(25, minutes), "25 min");
  assert.equal(storeDeliveryTimeLabel("00:00:00", minutes), null);
});
