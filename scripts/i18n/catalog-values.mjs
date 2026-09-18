// Terms sections are read with t.raw(); isPart is layout metadata, not text.
export function isTermsPartFlag(key) {
  return /^terms\.sections\.\d+\.isPart$/.test(key);
}

export function isValidCatalogValue(key, value) {
  return isTermsPartFlag(key)
    ? typeof value === 'boolean'
    : typeof value === 'string';
}
