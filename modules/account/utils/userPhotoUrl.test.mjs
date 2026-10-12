import assert from "node:assert/strict";
import test from "node:test";
import { userPhotoUrl } from "./userPhotoUrl.ts";

test("uses initials instead of legacy placeholder photos", () => {
  assert.equal(userPhotoUrl("https://placehold.co/400x400.png"), null);
  assert.equal(userPhotoUrl("http://via.placeholder.com/400x400"), null);
  assert.equal(userPhotoUrl(null), null);
});

test("preserves uploaded profile photos", () => {
  const photo = "https://cdn.example.com/profile/customer.jpg";
  assert.equal(userPhotoUrl(photo), photo);
  assert.equal(userPhotoUrl("  " + photo + "  "), photo);
});

test("rejects invalid or non-image-location values", () => {
  assert.equal(userPhotoUrl("not-a-url"), null);
  assert.equal(userPhotoUrl("javascript:alert(1)"), null);
});
