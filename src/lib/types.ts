
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string; // e.g., "men", "women", "kids"
  subcategory: string; // e.g., "T-Shirts", "Dresses"
  sizes: string[];
  colors: string[];
  material?: string;
  brand?: string;
  stockQuantity: number;
  averageRating?: number;
  reviews?: Review[];
  slug: string;
  tags?: string[]; // e.g., "new-arrival", "best-seller", "sale"
  dataAiHint?: string; // For placeholder images
};

export type Category = {
  id: string;
  name: string; // "Men", "Women", "Kids"
  slug: string;
  image: string;
  dataAiHint?: string;
  subcategories: Subcategory[];
};

export type Subcategory = {
  id:string;
  name: string;
  slug: string;
  priceRange: string; // e.g., "KSH 1,000 - KSH 4,500"
};

export type CartItem = {
  id: string; // This would be the product ID
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  shippingAddress?: Address;
  orderHistory?: Order[];
  wishlist?: Product[];
};

export type Address = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  orderDate: string; // ISO date string
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO date string
};

export type NavItem = {
  label: string;
  href: string;
  sublinks?: NavItem[];
};
