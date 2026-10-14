import assert from "node:assert/strict";
import test from "node:test";

import { getReviewerInitials } from "./reviewerInitials.ts";

test("uses the capitalized first-name initial for a single name", () => {
  assert.equal(getReviewerInitials("tayyaba"), "T");
});

test("uses capitalized first and last initials for a full name", () => {
  assert.equal(getReviewerInitials("tayyaba bano saleem"), "TS");
});

test("ignores whitespace and punctuation before name letters", () => {
  assert.equal(getReviewerInitials("  .marisool   -adam  "), "MA");
});
