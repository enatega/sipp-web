import * as yup from "yup";

export function createProfileSchema(requiredNameMessage: string) {
  return yup.object({
    name: yup.string().trim().required(requiredNameMessage).max(120),
    dateOfBirth: yup.string().default(""),
    gender: yup.mixed<"MALE" | "FEMALE" | "OTHER">().oneOf(["MALE", "FEMALE", "OTHER"]).required(),
  });
}
