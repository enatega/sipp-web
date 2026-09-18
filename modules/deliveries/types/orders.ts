export type OrderStatus = string;

export interface OrderCard {
  orderId: string;
  orderCode?: string;
  status?: OrderStatus;
  orderStatus?: OrderStatus;
  totalAmount?: number;
  orderPrice?: number;
  orderedAt: string;
  store?: {
    id?: string;
    name?: string;
    image?: string | null;
    logo?: string | null;
    address?: string | null;
  };
  storeName?: string;
  storeId?: string;
  storeImage?: string | null;
  storeLogo?: string | null;
  deliveryDetails?: { label?: string | null; address?: string };
  deliveryAddress?: string | null;
  deliveryLabel?: string | null;
  itemsSummary?: string | null;
}

export interface OrdersResponse {
  items: OrderCard[];
  total: number;
  offset: number;
  limit: number;
  nextOffset: number | null;
  isEnd: boolean;
}

export interface OrderProductOption {
  groupName?: string | null;
  optionName?: string | null;
  price?: number | null;
}

export interface OrderProduct {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string | null;
  selectedOptions?: OrderProductOption[];
}

export interface OrderEta {
  phase: "pre_pickup" | "post_pickup" | "arrived" | "unavailable";
  estimatedMinutes: number | null;
  remainingSeconds: number | null;
  distanceKm: number | null;
  riderLocation: {
    latitude: number | null;
    longitude: number | null;
    updatedAt: string | null;
  } | null;
  source: string;
  calculatedAt: string;
}

export interface OrderDetail {
  orderId: string;
  orderCode?: string | null;
  status: OrderStatus;
  statusTitle?: string;
  statusMessage?: string;
  orderType?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderedAt: string;
  scheduledAt?: string | null;
  eta?: OrderEta | null;
  restaurantNote?: string | null;
  courierNote?: string | null;
  rejectionReason?: string | null;
  chatBoxId?: string | null;
  store?: {
    id?: string;
    name?: string;
    image?: string | null;
    logo?: string | null;
    address?: string | null;
    estimatedDeliveryTime?: string | number | null;
  };
  deliveryDetails?: {
    label?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    storeLatitude?: number | null;
    storeLongitude?: number | null;
  };
  rider?: {
    id?: string;
    userId?: string | null;
    name?: string | null;
    phone?: string | null;
    image?: string | null;
    profile?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    currentLocation?: {
      latitude?: number | null;
      longitude?: number | null;
    } | null;
  } | null;
  orderItems?: {
    summaryLabel?: string;
    additionalItemsCount?: number;
    previewImages?: string[];
    products: OrderProduct[];
  };
  summary?: {
    orderNumber?: string;
    totalAmount: number;
    subtotal?: number;
    itemSubtotal?: number;
    discountAmount?: number;
    taxAmount?: number;
    deliveryFee?: number;
    packingCharges?: number;
    courierTip?: number;
    deliveryDistanceKm?: number | null;
    couponCode?: string | null;
    note?: string | null;
  };
  timeline?: Array<{
    key: string;
    title: string;
    completedAt: string | null;
    completed: boolean;
    active: boolean;
  }>;
  orderLogs?: Array<{
    status: string;
    actor?: string | null;
    timestamp: string;
    message?: string | null;
  }>;
}

export interface ReviewInput {
  orderId: string;
  rating: number;
  description?: string;
}

export interface OrderReview {
  is_reviewed?: boolean;
  review_detail?: {
    rating?: number;
    description?: string;
  } | null;
}
