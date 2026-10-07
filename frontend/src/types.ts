export type Audience = 'MEN' | 'WOMEN';

export type Category =
  | 'SHALWAR_KAMEEZ'
  | 'KURTA'
  | 'WAISTCOAT'
  | 'KAMEEZ_SHALWAR'
  | 'SUIT'
  | 'TROUSER'
  | 'OTHER';

export type GarmentType =
  | 'MEN_SHALWAR_KAMEEZ'
  | 'MEN_KURTA'
  | 'MEN_TROUSER'
  | 'WOMEN_KAMEEZ'
  | 'WOMEN_BOTTOM';

export type OptionType =
  | 'COLLAR'
  | 'CUFF'
  | 'FRONT'
  | 'POCKET'
  | 'TROUSER_STYLE'
  | 'NECKLINE'
  | 'SLEEVE'
  | 'SHAPE'
  | 'BOTTOM_STYLE'
  | 'EXTRA';

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'MEASUREMENTS_CONFIRMED'
  | 'STITCHING'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export type DeliveryType = 'DELIVERY' | 'PICKUP';
export type PaymentMethod = 'COD' | 'PAY_AT_PICKUP';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type Role = 'CUSTOMER' | 'TAILOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface DesignSummary {
  id: string;
  tailorId: string;
  name: string;
  audience: Audience;
  category: Category;
  basePrice: number;
  images: string[];
  active: boolean;
  tailorName?: string;
}

export interface Fabric {
  id: string;
  name: string;
  pricePerMeter: number;
  extraCharge: number;
  image?: string;
}

export interface StyleOption {
  id: string;
  type: OptionType;
  name: string;
  extraPrice: number;
}

export interface DesignDetail extends DesignSummary {
  description?: string;
  fabrics: Fabric[];
  styleOptions: StyleOption[];
}

export interface DesignListResponse {
  designs: DesignSummary[];
  page: number;
  limit: number;
  total: number;
}

export interface Tailor {
  id: string;
  userId: string;
  shopName: string;
  address: string;
  city: string;
  area: string;
  whatsapp: string;
  bio: string;
  rating: number;
  servesWomen: boolean;
  femaleStaff: boolean;
  portfolioImages: string[];
}

export interface Measurement {
  id: string;
  customerId: string;
  label: string;
  garmentType: GarmentType;
  values: Record<string, number>;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  totalPrice: number;
  finalPrice?: number;
  offeredPrice?: number | null;
  deliveryType: DeliveryType;
  dueDate?: string;
  createdAt: string;
  customerName?: string;
  tailorShopName?: string;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  designName: string;
  fabricName?: string;
  quantity: number;
  price: number;
  selectedOptions: { name: string; extraPrice: number }[];
  measurementId?: string;
}

export interface StatusEvent {
  id: string;
  from: OrderStatus | null;
  to: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  notes: string;
  referencePhotoUrl?: string;
  quotedAt?: string;
  cancelReason?: string;
  items: OrderItem[];
  payment: { method: PaymentMethod; amount: number; status: PaymentStatus };
  review?: { id: string; rating: number; comment?: string | null; createdAt: string } | null;
  statusEvents: StatusEvent[];
}

export interface OrderCreatePayload {
  designId: string;
  fabricId?: string;
  optionIds: string[];
  measurementId?: string;
  quantity: number;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  notes?: string;
  referencePhotoUrl?: string;
  dueDate?: string;
  offeredPrice?: number;
}

export interface DashboardSummary {
  newToday: number;
  activeOrders: number;
  readyOrders: number;
  deliveredThisMonth: number;
  expectedRevenue: number;
  ordersByStatus: Record<string, number>;
}
