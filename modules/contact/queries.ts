import { useMutation } from "@tanstack/react-query";
import { submitContactMessage } from "./api";

export function useSubmitContactMessage() {
  return useMutation({ mutationFn: submitContactMessage });
}
