import * as yup from "yup";
import { isValidPhoneNumber } from "libphonenumber-js/max";

export type AuthValidationMessages = {
  email: string;
  phone: string;
  name: string;
  password: string;
  passwordsMatch: string;
  otp: string;
};

export function createAuthSchemas(messages: AuthValidationMessages) {
  return {
    email: yup.string().trim().lowercase().email(messages.email).required(messages.email),
    password: yup.string().min(6, messages.password).required(messages.password),
    phone: yup.string().test("valid-phone", messages.phone, (value) => Boolean(value && isValidPhoneNumber(value))),
    signup: yup.object({
      name: yup.string().trim().min(2, messages.name).required(messages.name),
      email: yup.string().trim().email(messages.email).required(messages.email),
      phone: yup.string().test("valid-phone", messages.phone, (value) => Boolean(value && isValidPhoneNumber(value))),
      password: yup.string().min(6, messages.password).required(messages.password),
      confirmPassword: yup.string().oneOf([yup.ref("password")], messages.passwordsMatch),
    }),
    otp: yup.string().matches(/^\d{4}$/, messages.otp).required(messages.otp),
  };
}
