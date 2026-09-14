import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getVendorApplicationOptions,
  submitVendorApplication,
} from "./api";

export function useVendorApplicationOptions() {
  return useQuery({
    queryKey: ["vendor-application-options"],
    queryFn: getVendorApplicationOptions,
    staleTime: 15 * 60 * 1000,
  });
}

export function useSubmitVendorApplication() {
  return useMutation({ mutationFn: submitVendorApplication });
}
