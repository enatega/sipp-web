import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import type {
  VendorApplicationOptions,
  VendorApplicationResult,
  VendorApplicationValues,
} from "./types";

export function getVendorApplicationOptions() {
  return requestJson<VendorApplicationOptions>(
    `${apiRoutes.vendorApplications}/options`,
  );
}

export function submitVendorApplication(values: VendorApplicationValues) {
  const form = new FormData();
  form.set("name", values.name);
  form.set("email", values.email);
  form.set("phone", values.phone);
  form.set("city", values.city);
  form.set("zone_id", values.zone_id);
  form.set("password", values.password);
  form.set("vendorImage", values.vendorImage!);
  form.set(
    "business_liscence_front_file",
    values.business_liscence_front_file!,
  );
  form.set(
    "business_liscence_back_file",
    values.business_liscence_back_file!,
  );
  form.set("national_id_front_file", values.national_id_front_file!);
  form.set("national_id_back_file", values.national_id_back_file!);

  return requestJson<VendorApplicationResult>(apiRoutes.vendorApplications, {
    method: "POST",
    body: form,
    timeoutMs: 60_000,
  });
}
