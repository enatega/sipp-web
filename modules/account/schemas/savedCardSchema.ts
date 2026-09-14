import * as Yup from "yup";

export function createSavedCardSchema(cardholderRequired: string) {
  return Yup.object({
    cardholderName: Yup.string()
      .trim()
      .max(120)
      .required(cardholderRequired),
  });
}
