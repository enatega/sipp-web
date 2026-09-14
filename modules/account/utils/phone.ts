import {
  AsYouType,
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import mobileExamples from "libphonenumber-js/mobile/examples";
import type { Country } from "@/modules/account/data/countries";

// E.164 allows 15 digits. Keep one extra for national formats that include
// a trunk prefix (for example Pakistan's leading `0`).
const MAX_INPUT_DIGITS = 16;

function countryCode(country: Country) {
  return country.iso.toUpperCase() as CountryCode;
}

export function formatNationalPhoneInput(value: string, country: Country) {
  const normalized = value.trim();
  if (normalized.startsWith("+")) {
    const international = parsePhoneNumberFromString(normalized);
    if (international?.country === countryCode(country)) {
      return international.formatNational();
    }
  }

  const digits = value.replace(/\D/g, "").slice(0, MAX_INPUT_DIGITS);
  return new AsYouType(countryCode(country)).input(digits);
}

export function validateNationalPhone(value: string, country: Country) {
  const normalized = value.trim();
  const parsed = normalized
    ? parsePhoneNumberFromString(normalized, countryCode(country))
    : undefined;
  const isValid = Boolean(
    parsed?.isValid() && parsed.country === countryCode(country),
  );

  return {
    isValid,
    e164: isValid ? parsed!.number : null,
  };
}

export function phoneExample(country: Country) {
  const example = getExampleNumber(countryCode(country), mobileExamples);
  return example?.formatNational() ?? "";
}
