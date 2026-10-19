import * as yup from "yup";

export function addressDetailsSchema(t: (key: string) => string) {
  return yup.object({
    type: yup.mixed<"HOME" | "OFFICE" | "APARTMENT" | "OTHER">().oneOf(["HOME", "OFFICE", "OTHER"], t("chooseType")).required(t("chooseType")),
    placeName: yup.string().trim().max(255, t("tooLong")).defined(),
    howToFindYou: yup.string().trim().max(1000, t("tooLong")).required(t("directionsRequired")),
    deliveryInstructions: yup.string().trim().max(1000, t("tooLong")).defined(),
  });
}
export function deliveryAddressSchema(t: (key: string) => string) {
  return yup.object({
    shouldSave: yup.boolean().required(),
    type: yup.mixed<"HOME" | "OFFICE" | "APARTMENT" | "OTHER">().defined().when("shouldSave", { is: true, then: schema => schema.oneOf(["HOME", "OFFICE", "OTHER"], t("chooseType")) }),
    placeName: yup.string().trim().max(255, t("tooLong")).defined(),
    howToFindYou: yup.string().trim().max(1000, t("tooLong")).defined().when("shouldSave", { is: true, then: schema => schema.required(t("directionsRequired")) }),
    deliveryInstructions: yup.string().trim().max(1000, t("tooLong")).defined(),
  });
}
