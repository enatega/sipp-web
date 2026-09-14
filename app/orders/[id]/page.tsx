import { OrderDetailExperience } from "@/modules/deliveries/components/OrderDetailExperience";
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) { return <OrderDetailExperience orderId={(await params).id} />; }
