import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const localeFiles = ["en", "de"];

function flatten(value, prefix = "", output = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flatten(child, path, output);
    } else {
      output.set(path, child);
    }
  }
  return output;
}

const catalogs = new Map();
for (const locale of localeFiles) {
  const raw = await readFile(resolve(root, "messages", `${locale}.json`), "utf8");
  catalogs.set(locale, flatten(JSON.parse(raw)));
}

const reference = catalogs.get("en");
let failed = false;
for (const [locale, catalog] of catalogs) {
  const missing = [...reference.keys()].filter((key) => !catalog.has(key));
  const extra = [...catalog.keys()].filter((key) => !reference.has(key));
  const invalid = [...catalog].filter(([, value]) => typeof value !== "string");
  if (missing.length || extra.length || invalid.length) {
    failed = true;
    if (missing.length) console.error(`${locale}: missing ${missing.join(", ")}`);
    if (extra.length) console.error(`${locale}: extra ${extra.join(", ")}`);
    if (invalid.length) console.error(`${locale}: non-string ${invalid.map(([key]) => key).join(", ")}`);
  }
}

if (failed) process.exit(1);
console.log(`i18n audit passed: ${reference.size} keys across ${localeFiles.length} locales`);
