import * as Yup from "yup";

interface Messages {
  ratingRequired: string;
  reviewTooLong: string;
}

export function orderReviewSchema(messages: Messages) {
  return Yup.object({
    rating: Yup.number().min(1, messages.ratingRequired).max(5).required(messages.ratingRequired),
    description: Yup.string().trim().max(500, messages.reviewTooLong),
  });
}
