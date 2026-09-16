import * as Yup from "yup";

type Messages = {
  required: string;
  invalidName: string;
  invalidEmail: string;
};

export function createContactSchema(messages: Messages) {
  return Yup.object({
    name: Yup.string().trim().min(2, messages.invalidName).max(80, messages.invalidName).required(messages.required),
    email: Yup.string().trim().email(messages.invalidEmail).required(messages.required),
    subject: Yup.string().trim().min(2, messages.required).max(150, messages.required).required(messages.required),
    message: Yup.string().trim().min(5, messages.required).max(4000, messages.required).required(messages.required),
  });
}
