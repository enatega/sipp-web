import * as Yup from "yup";

type Messages = {
  required: string;
  invalidName: string;
  invalidEmail: string;
  invalidPhone: string;
  invalidPassword: string;
  passwordMismatch: string;
  invalidFile: string;
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function createVendorApplicationSchema(messages: Messages) {
  const document = Yup.mixed<File>()
    .required(messages.required)
    .test(
      "valid-image",
      messages.invalidFile,
      (file) =>
        file instanceof File &&
        file.size <= MAX_FILE_SIZE &&
        IMAGE_TYPES.includes(file.type),
    );

  return Yup.object({
    name: Yup.string()
      .trim()
      .min(3, messages.invalidName)
      .max(50, messages.invalidName)
      .required(messages.required),
    email: Yup.string()
      .trim()
      .email(messages.invalidEmail)
      .required(messages.required),
    phone: Yup.string()
      .trim()
      .matches(/^[0-9+\-\s()]{7,20}$/, messages.invalidPhone)
      .test(
        "digit-limit",
        messages.invalidPhone,
        (value) => !value || (value.match(/\d/g) ?? []).length <= 15,
      )
      .required(messages.required),
    city: Yup.string().trim().min(2, messages.required).required(messages.required),
    zone_id: Yup.string().uuid(messages.required).required(messages.required),
    password: Yup.string()
      .min(8, messages.invalidPassword)
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).+$/,
        messages.invalidPassword,
      )
      .required(messages.required),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], messages.passwordMismatch)
      .required(messages.required),
    vendorImage: document,
    business_liscence_front_file: document,
    business_liscence_back_file: document,
    national_id_front_file: document,
    national_id_back_file: document,
  });
}
