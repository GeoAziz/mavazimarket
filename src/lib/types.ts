
import type { Timestamp } from "firebase/firestore";

export type Product = {
  id: string; // Firestore document ID
  name: string;
  description: string;
  price: number;
  images: string[]; // Array of image URLs
  category: string; // Refers to Category ID
  subcategory: string; // Subcategory slug, e.g., "t-shirts"
  sizes: string[];
  colors: string[];
  material?: string;
  brand?: string;
  stockQuantity: number;
  averageRating?: number;
  // reviews?: Review[]; // Reviews will be a subcollection
  slug: string;
  tags?: string[]; 
  dataAiHint?: string; 
  isPublished?: boolean;
  createdAt?: Timestamp | string; // Store as Firestore Timestamp, allow string for mock
  updatedAt?: Timestamp | string; // Store as Firestore Timestamp, allow string for mock
};

export type Category = {
  id: string; // Firestore document ID
  name: string; 
  slug: string;
  image: string;
  dataAiHint?: string;
  subcategories: Subcategory[];
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
};

export type Subcategory = {
  id:string; // Often same as slug for simplicity within the array
  name: string;
  slug: string;
  priceRange: string; 
};

export type CartItem = {
  id: string; 
  productId?: string; // To ensure we always have the product's original ID
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  slug?: string; // For linking back to product page from cart/order
};

export type User = {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  profilePictureUrl?: string;
  shippingAddress?: Address;
  // orderHistory will be fetched via query against Orders collection
  wishlist?: string[]; // Array of product IDs
  role?: 'user' | 'admin'; // For Firestore profile, custom claims handle Auth rules
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  dataAiHint?: string;
};

export type Address = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string; // Firestore document ID
  userId: string; // Firebase Auth UID of the customer
  orderDate: Timestamp | string; 
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  // paymentDetails?: any; // e.g., transaction ID
  // trackingNumber?: string;
  updatedAt?: Timestamp | string;
};

export type Review = {
  id: string; // Firestore document ID
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

// For general site settings document in Firestore
export type SiteSettings = {
  siteName?: string;
  siteTagline?: string;
  siteDescription?: string;
  publicEmail?: string;
  publicPhone?: string;
  storeAddress?: string;
  themeAppearance?: { // For values from /admin/appearance/customize
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    showHeroBanner?: boolean;
    showFeaturedProducts?: boolean;
  };
  // Potentially other settings groups like 'paymentGateways', 'shippingOptions'
  updatedAt?: Timestamp;
};
