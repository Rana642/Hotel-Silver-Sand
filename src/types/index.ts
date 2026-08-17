export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show"
  | "unreachable";

export type Booking = {
  id: string;
  booking_ref: string;
  room_id: string | null;
  room_name: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  rooms_count: number;
  nights: number;
  unit_price: number;
  original_price: number | null;
  discount: number;
  coupon_code: string | null;
  total: number;
  special_request: string | null;
  admin_notes: string | null;
  status: BookingStatus;
  source: "website" | "walkin" | "phone";
  created_at: string;
};

export type RoomRow = {
  id: string;
  slug: string;
  name: string;
  capacity: string | null;
  max_adults: number;
  max_children: number;
  price_per_night: number;
  original_price: number | null;
  image: string | null;
  is_active: boolean;
  sort_order: number;
  total_units?: number;
};

export const statusMeta: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", cls: "bg-blue-100 text-blue-700" },
  checked_in: { label: "Checked In", cls: "bg-indigo-100 text-indigo-700" },
  completed: { label: "Completed", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  no_show: { label: "No Show", cls: "bg-gray-200 text-gray-700" },
  unreachable: { label: "Unreachable", cls: "bg-orange-100 text-orange-700" },
};
