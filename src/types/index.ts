export type CartItemWithProduct = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    unit: string;
    slug: string;
  };
};

export type ProductWithCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  stock: number;
  unit: string;
  isActive: boolean;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export type OrderWithItems = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  gst: number;
  total: number;
  deliveryAddress: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  deliverySlot: string | null;
  createdAt: Date;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
  }[];
};
