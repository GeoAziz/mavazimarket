
import type { Timestamp } from "firebase/firestore";

export type Product = {
  id: string; // Firestore document ID
  name: string;
  description: string;
  price: number;
  images: string[]; // Array of image URLs
  category: string; // Refers to Category ID (slug)
  subcategory: string; // Subcategory slug, e.g., "t-shirts"
  sizes: string[];
  colors: string[];
  material?: string;
  brand?: string;
  stockQuantity: number;
  averageRating?: number;
  slug: string;
  tags?: string[]; 
  dataAiHint?: string; 
  isPublished?: boolean;
  createdAt?: Timestamp | string; 
  updatedAt?: Timestamp | string; 
};

export type Category = {
  id: string; // Firestore document ID (usually the slug)
  name: string; 
  slug: string;
  image: string;
  dataAiHint?: string;
  subcategories: Subcategory[];
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
};

export type Subcategory = {
  id:string; 
  name: string;
  slug: string;
  priceRange: string; 
};

export type CartItem = {
  id: string; 
  productId?: string; 
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  slug?: string; 
};

export type User = {
  id: string; 
  name: string;
  email: string;
  phone?: string; // Added phone
  profilePictureUrl?: string;
  shippingAddress?: Address;
  wishlist?: string[]; 
  role?: 'user' | 'admin'; 
  disabled?: boolean; // For account status
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  dataAiHint?: string;
};

export type Address = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string; // Optional phone for shipping address
};

export type Order = {
  id: string; 
  userId: string; 
  orderDate: Timestamp | string; 
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  updatedAt?: Timestamp | string;
};

export type Review = {
  id: string; 
  productId: string;
  userId: string;
  userName: string;
  rating: number; 
  comment: string;
  date: Timestamp | string; 
  updatedAt?: Timestamp | string;
};

export type NavItem = {
  label: string;
  href: string;
  sublinks?: NavItem[];
};

export type SiteSettings = {
  siteName?: string;
  siteTagline?: string;
  siteDescription?: string;
  publicEmail?: string;
  publicPhone?: string;
  storeAddress?: string;
  themeAppearance?: { 
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    showHeroBanner?: boolean;
    showFeaturedProducts?: boolean;
  };
  updatedAt?: Timestamp;
};
