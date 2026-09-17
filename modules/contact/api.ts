import { apiRoutes } from "@/config/api";
import { postJson } from "@/services/api/client";
import type { ContactFormValues, ContactSubmissionResult } from "./types";

export function submitContactMessage(values: ContactFormValues) {
  return postJson<ContactSubmissionResult>(apiRoutes.contact, values);
}
