import * as yup from "yup";

export interface CheckoutFormValues {
  orderType: "delivery" | "pickup";
  deliveryLocationKey: string;
  paymentMethod: "cod" | "stripe";
  deliveryTime: "standard" | "scheduled";
  scheduledAt: string;
  restaurantNote: string;
  courierNote: string;
  leaveAtDoor: boolean;
  riderTip: number;
}

export function checkoutSchema(messages: {
  addressRequired: string;
  scheduleRequired: string;
  noteTooLong: string;
  invalidTip: string;
}) {
  return yup.object({
    orderType: yup.mixed<CheckoutFormValues["orderType"]>().oneOf(["delivery", "pickup"]).required(),
    deliveryLocationKey: yup.string().when("orderType", {
      is: "delivery",
      then: (schema) => schema.required(messages.addressRequired),
      otherwise: (schema) => schema.default(""),
    }),
    paymentMethod: yup.mixed<CheckoutFormValues["paymentMethod"]>().oneOf(["cod", "stripe"]).required(),
    deliveryTime: yup.mixed<CheckoutFormValues["deliveryTime"]>().oneOf(["standard", "scheduled"]).required(),
    scheduledAt: yup.string().when("deliveryTime", {
      is: "scheduled",
      then: (schema) => schema.required(messages.scheduleRequired),
      otherwise: (schema) => schema.default(""),
    }),
    restaurantNote: yup.string().trim().max(250, messages.noteTooLong).defined().default(""),
    courierNote: yup.string().trim().max(250, messages.noteTooLong).defined().default(""),
    leaveAtDoor: yup.boolean().required().default(false),
    riderTip: yup.number().typeError(messages.invalidTip).min(0, messages.invalidTip).max(10_000, messages.invalidTip).required(),
  });
}
