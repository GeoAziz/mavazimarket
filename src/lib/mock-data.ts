import type { Product, Category, User, Order, Review, CartItem } from './types';

export const mockCategories: Category[] = [
  {
    id: 'men',
    name: 'Men',
    slug: 'men',
    image: 'https://placehold.co/400x300.png',
    dataAiHint: 'mens fashion',
    subcategories: [
      { id: 'men-tshirts', name: 'T-Shirts', slug: 't-shirts', priceRange: 'KSh 1,000 - KSh 4,500' },
      { id: 'men-shirts', name: 'Shirts', slug: 'shirts', priceRange: 'KSh 2,000 - KSh 7,500' },
      { id: 'men-pants', name: 'Pants', slug: 'pants', priceRange: 'KSh 2,500 - KSh 10,000' },
      { id: 'men-jeans', name: 'Jeans', slug: 'jeans', priceRange: 'KSh 3,000 - KSh 12,000' },
      { id: 'men-jackets', name: 'Jackets', slug: 'jackets', priceRange: 'KSh 4,500 - KSh 20,000' },
      { id: 'men-shoes', name: 'Shoes', slug: 'shoes', priceRange: 'KSh 3,500 - KSh 15,000' },
      { id: 'men-accessories', name: 'Accessories', slug: 'accessories', priceRange: 'KSh 500 - KSh 4,000' },
    ],
  },
  {
    id: 'women',
    name: 'Women',
    slug: 'women',
    image: 'https://placehold.co/400x300.png',
    dataAiHint: 'womens fashion',
    subcategories: [
      { id: 'women-dresses', name: 'Dresses', slug: 'dresses', priceRange: 'KSh 2,500 - KSh 15,000' },
      { id: 'women-tops', name: 'Tops', slug: 'tops', priceRange: 'KSh 1,500 - KSh 7,000' },
      { id: 'women-skirts', name: 'Skirts', slug: 'skirts', priceRange: 'KSh 1,800 - KSh 6,000' },
      { id: 'women-pants', name: 'Pants', slug: 'pants', priceRange: 'KSh 2,000 - KSh 8,000' },
      { id: 'women-shoes', name: 'Shoes', slug: 'shoes', priceRange: 'KSh 3,000 - KSh 12,000' },
      { id: 'women-accessories', name: 'Accessories', slug: 'accessories', priceRange: 'KSh 500 - KSh 5,000' },
    ],
  },
  {
    id: 'kids',
    name: 'Kids',
    slug: 'kids',
    image: 'https://placehold.co/400x300.png',
    dataAiHint: 'kids fashion',
    subcategories: [
      { id: 'kids-tshirts', name: 'T-Shirts', slug: 't-shirts', priceRange: 'KSh 600 - KSh 2,500' },
      { id: 'kids-dresses', name: 'Dresses', slug: 'dresses', priceRange: 'KSh 1,000 - KSh 4,000' },
      { id: 'kids-shorts', name: 'Shorts', slug: 'shorts', priceRange: 'KSh 800 - KSh 2,500' },
      { id: 'kids-pants', name: 'Pants', slug: 'pants', priceRange: 'KSh 1,500 - KSh 5,000' },
      { id: 'kids-outerwear', name: 'Outerwear', slug: 'outerwear', priceRange: 'KSh 2,500 - KSh 7,000' },
      { id: 'kids-shoes', name: 'Shoes', slug: 'shoes', priceRange: 'KSh 1,500 - KSh 6,000' },
      { id: 'kids-accessories', name: 'Accessories', slug: 'accessories', priceRange: 'KSh 300 - KSh 2,000' },
    ],
  },
];

export const mockProducts: Product[] = [
  // Men
  {
    id: 'men-basic-tshirt-01', name: 'Men\'s Basic T-Shirt', slug: 'mens-basic-tshirt-01',
    description: 'A comfortable and stylish basic t-shirt for everyday wear.', price: 1200,
    images: ['https://placehold.co/600x800.png', 'https://placehold.co/600x800.png'], dataAiHint: 'mens t-shirt',
    category: 'men', subcategory: 'T-Shirts', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Navy'],
    stockQuantity: 50, averageRating: 4.5, brand: 'Mavazi Basics', material: 'Cotton', tags: ['best-seller']
  },
  {
    id: 'men-slim-fit-jeans-02', name: 'Slim Fit Jeans', slug: 'slim-fit-jeans-02',
    description: 'Modern slim fit jeans, perfect for a casual or smart-casual look.', price: 5500,
    images: ['https://placehold.co/600x800.png', 'https://placehold.co/600x800.png'], dataAiHint: 'mens jeans',
    category: 'men', subcategory: 'Jeans', sizes: ['30W', '32W', '34W', '36W'], colors: ['Dark Blue', 'Black'],
    stockQuantity: 30, averageRating: 4.2, brand: 'Denim Co.', material: 'Denim', tags: ['new-arrival']
  },
  {
    id: 'men-leather-jacket-03', name: 'Leather Jacket', slug: 'leather-jacket-03',
    description: 'Classic leather jacket for a cool and timeless style.', price: 9800,
    images: ['https://placehold.co/600x800.png'], dataAiHint: 'mens jacket',
    category: 'men', subcategory: 'Jackets', sizes: ['M', 'L', 'XL'], colors: ['Black'],
    stockQuantity: 15, averageRating: 4.8, brand: 'Urban Riders', material: 'Leather'
  },
  {
    id: 'men-sneakers-04', name: 'Casual Sneakers', slug: 'casual-sneakers-04',
    description: 'Comfortable and versatile sneakers for everyday use.', price: 4800,
    images: ['https://placehold.co/600x800.png'], dataAiHint: 'mens sneakers',
    category: 'men', subcategory: 'Shoes', sizes: ['8', '9', '10', '11'], colors: ['White', 'Grey'],
    stockQuantity: 40, averageRating: 4.0, brand: 'StepUp', material: 'Canvas'
  },
  // Women
  {
    id: 'women-casual-dress-05', name: 'Casual Floral Dress', slug: 'casual-floral-dress-05',
    description: 'A light and airy casual dress perfect for sunny days.', price: 3000,
    images: ['https://placehold.co/600x800.png', 'https://placehold.co/600x800.png'], dataAiHint: 'womens dress',
    category: 'women', subcategory: 'Dresses', sizes: ['S', 'M', 'L'], colors: ['Floral Print', 'Blue'],
    stockQuantity: 25, averageRating: 4.6, brand: 'Summer Vibes', material: 'Cotton', tags: ['new-arrival']
  },
  {
    id: 'women-silk-blouse-06', name: 'Silk Blouse', slug: 'silk-blouse-06',
    description: 'Elegant silk blouse for a sophisticated look.', price: 4500,
    images: ['https://placehold.co/600x800.png'], dataAiHint: 'womens blouse',
    category: 'women', subcategory: 'Tops', sizes: ['XS', 'S', 'M'], colors: ['Cream', 'Rose'],
    stockQuantity: 20, averageRating: 4.3, brand: 'Elegance', material: 'Silk'
  },
  // Kids
  {
    id: 'kids-graphic-tshirt-07', name: 'Kids\' Graphic T-Shirt', slug: 'kids-graphic-tshirt-07',
    description: 'Fun graphic t-shirt for kids, made with soft cotton.', price: 1000,
    images: ['https://placehold.co/600x800.png'], dataAiHint: 'kids t-shirt',
    category: 'kids', subcategory: 'T-Shirts', sizes: ['2T', '3T', '4T', '5'], colors: ['Yellow', 'Green'],
    stockQuantity: 60, averageRating: 4.7, brand: 'Little Champs', material: 'Cotton', tags: ['best-seller']
  },
  {
    id: 'kids-cotton-dress-08', name: 'Cotton Dress (Girls)', slug: 'cotton-dress-girls-08',
    description: 'Adorable and comfortable cotton dress for little girls.', price: 2000,
    images: ['https://placehold.co/600x800.png'], dataAiHint: 'girls dress',
    category: 'kids', subcategory: 'Dresses', sizes: ['1Y', '2Y', '3Y'], colors: ['Pink', 'Polka Dot'],
    stockQuantity: 35, averageRating: 4.9, brand: 'Tiny Tots', material: 'Cotton'
  },
];

export const mockReviews: Review[] = [
  { id: 'review1', userId: 'user123', userName: 'Aisha K.', rating: 5, comment: 'Love this t-shirt! Great quality and fits perfectly.', date: '2023-10-15' },
  { id: 'review2', userId: 'user456', userName: 'John M.', rating: 4, comment: 'Good jeans, very comfortable. Color is slightly different than pictured.', date: '2023-10-20' },
  { id: 'review3', userId: 'user789', userName: 'Wanjiku N.', rating: 5, comment: 'This dress is so beautiful, my daughter loves it!', date: '2023-09-05' },
];

// Assign reviews to products
mockProducts.forEach(p => {
  if (p.id === 'men-basic-tshirt-01') p.reviews = [mockReviews[0]];
  if (p.id === 'men-slim-fit-jeans-02') p.reviews = [mockReviews[1]];
  if (p.id === 'kids-cotton-dress-08') p.reviews = [mockReviews[2]];
});

export const mockUser: User = {
  id: 'mockuser01',
  name: 'Test User',
  email: 'testuser@example.com',
  profilePictureUrl: 'https://placehold.co/100x100.png',
  dataAiHint: 'profile picture',
  shippingAddress: {
    street: '123 Fashion Ave',
    city: 'Nairobi',
    postalCode: '00100',
    country: 'Kenya',
  },
  wishlist: [mockProducts[2], mockProducts[4]],
};

export const mockOrders: Order[] = [
  {
    id: 'order001',
    orderDate: '2023-10-01T10:30:00Z',
    status: 'Delivered',
    items: [
      { id: 'men-basic-tshirt-01', name: 'Men\'s Basic T-Shirt', price: 1200, quantity: 1, image: 'https://placehold.co/80x80.png' },
      { id: 'men-sneakers-04', name: 'Casual Sneakers', price: 4800, quantity: 1, image: 'https://placehold.co/80x80.png' },
    ],
    totalAmount: 6000,
    shippingAddress: mockUser.shippingAddress!,
    paymentMethod: 'M-Pesa',
  },
  {
    id: 'order002',
    orderDate: '2023-10-15T14:00:00Z',
    status: 'Shipped',
    items: [
      { id: 'women-casual-dress-05', name: 'Casual Floral Dress', price: 3000, quantity: 1, image: 'https://placehold.co/80x80.png' },
    ],
    totalAmount: 3000,
    shippingAddress: mockUser.shippingAddress!,
    paymentMethod: 'Credit Card',
  },
];
mockUser.orderHistory = mockOrders;

export const mockCartItems: CartItem[] = [
    { id: 'men-basic-tshirt-01', name: 'Men\'s Basic T-Shirt', price: 1200, quantity: 2, image: 'https://placehold.co/100x120.png', size: 'M', color: 'Black' },
    { id: 'women-casual-dress-05', name: 'Casual Floral Dress', price: 3000, quantity: 1, image: 'https://placehold.co/100x120.png', size: 'S', color: 'Floral Print' },
];
