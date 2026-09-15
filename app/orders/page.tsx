import type { Metadata } from "next";
import { OrdersExperience } from "@/modules/deliveries/components/OrdersExperience";
export const metadata: Metadata = { title: "Orders | SIPP" };
export default function OrdersPage() { return <OrdersExperience />; }
