import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isValidCatalogValue } from './catalog-values.mjs';

test('allows boolean terms layout flags, including false', () => {
  assert.equal(isValidCatalogValue('terms.sections.4.isPart', true), true);
  assert.equal(isValidCatalogValue('terms.sections.4.isPart', false), true);
});

test('does not allow boolean translation text or unrelated metadata', () => {
  for (const key of ['terms.sections.4.heading', 'checkout.isPart', 'terms.sections.other.isPart']) {
    assert.equal(isValidCatalogValue(key, true), false);
  }
});

test('requires actual booleans for part flags and actual strings for text', () => {
  assert.equal(isValidCatalogValue('terms.sections.4.isPart', 'false'), false);
  assert.equal(isValidCatalogValue('terms.sections.4.heading', 'Terms'), true);
  assert.equal(isValidCatalogValue('terms.sections.4.heading', null), false);
  assert.equal(isValidCatalogValue('terms.sections.4.heading', 4), false);
});
