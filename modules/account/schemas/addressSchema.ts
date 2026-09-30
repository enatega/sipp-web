import * as yup from "yup";

export const addressDetailsSchema = yup.object({
  type: yup.mixed<"HOME" | "OFFICE" | "OTHER">().oneOf(["HOME", "OFFICE", "OTHER"]).required(),
  houseNo: yup.string().trim().max(100),
  building: yup.string().trim().max(150),
  landmark: yup.string().trim().max(255),
});

export type AddressDetailsValues = yup.InferType<typeof addressDetailsSchema>;

/** Delivery confirmation: saving is optional, details only matter when saving. */
export const deliveryAddressSchema = addressDetailsSchema.shape({
  shouldSave: yup.boolean().required(),
  locationName: yup.string().trim().max(100),
});
