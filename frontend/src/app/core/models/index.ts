// User related interfaces
export interface User {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  cart?: Cart; // Optional cart returned on login/register
}

export interface LoginRequest {
  emailOrMobile: string;
  password: string;
  guestCart?: CartItem[];
}

export interface RegisterRequest {
  name: string;
  email?: string;
  mobile?: string;
  password: string;
}

// Address interfaces
export interface Address {
  _id: string;
  userId: string;
  label: 'Home' | 'Office' | 'Other';
  city: string;
  area: string;
  street: string;
  building: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressRequest {
  label?: 'Home' | 'Office' | 'Other';
  city: string;
  area: string;
  street: string;
  building: string;
  notes?: string;
  isDefault?: boolean;
}

// Category interfaces
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: string | Category;
  description?: string;
  image?: string;
  isActive: boolean;
}

// Product interfaces
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  isOnSale?: boolean;
  discountPercentage?: number;
  images: string[];
  categoryId: string | Category;
  subCategoryId: string | SubCategory;
  stock?: number | null;
  displayStock?: number | null;
  inStock: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isBestSeller: boolean;
  isNewArrival: boolean;
  gender: 'men' | 'women' | 'unisex';
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface FeaturedProducts {
  men: {
    bestSellers: Product[];
    newArrivals: Product[];
  };
  women: {
    bestSellers: Product[];
    newArrivals: Product[];
  };
}

// Cart interfaces
export interface CartItem {
  _id?: string;
  productId: string;
  productName: string;
  productImage?: string;
  priceAtAdd: number;
  quantity: number;
  priceChanged: boolean;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  hasChangedPrices: boolean;
}

export interface CheckoutData {
  validItems: CartItem[];
  invalidItems: CartItem[];
  subtotal: number;
  hasInvalidItems: boolean;
}

// Order interfaces
export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'shipped'
  | 'received'
  | 'refused'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CustomerSnapshot {
  name: string;
  email?: string;
  mobile?: string;
}

export interface AddressSnapshot {
  label?: string;
  city: string;
  area: string;
  street: string;
  building: string;
  notes?: string;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  customerSnapshot: CustomerSnapshot;
  addressSnapshot: AddressSnapshot;
  items: OrderItem[];
  subtotal: number;
  totalItems: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

// Review interfaces
export interface Review {
  _id: string;
  userId: string | { _id: string; firstName: string; lastName: string };
  productId: string | { _id: string; name: string; slug: string; images: string[] };
  orderId?: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isApproved: boolean;
  createdAt: string;
}

export interface ProductReviewStats {
  averageRating: number;
  totalReviews: number;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  stats: ProductReviewStats;
}

export interface CreateReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

// Testimonial interfaces
export interface Testimonial {
  _id: string;
  userId: string | { _id: string; firstName: string; lastName: string; email?: string };
  userName: string;
  rating: number;
  title: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export interface TestimonialRequest {
  rating: number;
  title: string;
  content: string;
}

// Return interfaces
export type ReturnStatus = 'requested' | 'approved' | 'rejected';

export interface ReturnRequest {
  _id: string;
  orderId: string | Order;
  userId: string;
  reason: string;
  status: ReturnStatus;
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Report interfaces
export interface SalesReport {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalItemsSold: number;
  };
  dailySales: { _id: string; orders: number; revenue: number }[];
  topProducts: { productName: string; totalQuantity: number; totalRevenue: number }[];
  dateRange: { from?: string; to?: string };
}

export interface DashboardStats {
  today: { count: number; revenue: number };
  thisMonth: { count: number; revenue: number };
  growth: { orders: number; revenue: number };
  totalUsers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingReviews: number;
  recentOrders: Order[];
}
