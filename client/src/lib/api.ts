export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "/api";

export type Role = "CUSTOMER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  role: Role;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  price: string | number;
  imageUrl?: string | null;
  stock: number;
  isActive: boolean;
  isFlashSale: boolean;
  categoryId: string;
  category?: Category;
  flashSaleItems?: Array<{
    id: string;
    discountPercentage: number;
    campaign: FlashSaleCampaign;
  }>;
};

export type Blog = {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FlashSaleItem = {
  id: string;
  campaignId: string;
  productId: string;
  product: Product;
  discountPercentage: number;
  stockLimit: number;
  soldCount: number;
};

export type FlashSaleCampaign = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isFeatured: boolean;
  items?: FlashSaleItem[];
  _count?: {
    items: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice?: string | number;
  lineTotal?: string | number;
  product: Product;
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  product: Product;
};

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "COMPLETED"
  | "REFUNDED";

export type Order = {
  id: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  totalAmount: string | number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  userName: string;
  user: Pick<User, "id" | "email" | "fullName">;
  createdAt: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export const tokenStore = {
  get() {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("auth_token");
  },

  set(token: string) {
    window.localStorage.setItem("auth_token", token);
  },

  clear() {
    window.localStorage.removeItem("auth_token");
  }
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  const token = tokenStore.get();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body
    });
  } catch {
    throw new ApiError(
      `Cannot connect to API server at ${API_BASE_URL}. Please start the backend.`,
      0
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message ?? "Request failed", response.status);
  }

  return data as T;
}

const toQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const api = {
  login(body: { email: string; password: string }) {
    return apiRequest<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body
    });
  },

  register(body: {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }) {
    return apiRequest<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body
    });
  },

  registerWithGoogle(body: { googleToken: string }) {
    return apiRequest<{ user: User; token: string }>("/auth/register/google", {
      method: "POST",
      body
    });
  },

  getCategories() {
    return apiRequest<Category[]>("/categories");
  },

  createCategory(body: Partial<Category>) {
    return apiRequest<Category>("/categories", { method: "POST", body });
  },

  updateCategory(id: string, body: Partial<Category>) {
    return apiRequest<Category>(`/categories/${id}`, {
      method: "PUT",
      body
    });
  },

  deleteCategory(id: string) {
    return apiRequest<void>(`/categories/${id}`, { method: "DELETE" });
  },

  getProducts(params: Record<string, string | number | boolean | undefined> = {}) {
    return apiRequest<Paginated<Product>>(`/products${toQueryString(params)}`);
  },

  getProduct(id: string) {
    return apiRequest<Product>(`/products/${id}`);
  },

  createProduct(body: Partial<Product>) {
    return apiRequest<Product>("/products", { method: "POST", body });
  },

  updateProduct(id: string, body: Partial<Product>) {
    return apiRequest<Product>(`/products/${id}`, { method: "PUT", body });
  },

  deleteProduct(id: string) {
    return apiRequest<void>(`/products/${id}`, { method: "DELETE" });
  },

  getProductReviews(productId: string) {
    return apiRequest<{
      data: Review[];
      meta: { averageRating: number; totalReviews: number };
    }>(`/products/${productId}/reviews`);
  },

  createProductReview(productId: string, body: { rating: number; comment?: string }) {
    return apiRequest(`/products/${productId}/reviews`, {
      method: "POST",
      body
    });
  },

  getCart() {
    return apiRequest<Cart>("/cart");
  },

  addCartItem(body: { productId: string; quantity: number }) {
    return apiRequest<Cart>("/cart/items", { method: "POST", body });
  },

  updateCartItem(itemId: string, body: { quantity: number }) {
    return apiRequest<Cart>(`/cart/items/${itemId}`, {
      method: "PUT",
      body
    });
  },

  deleteCartItem(itemId: string) {
    return apiRequest<Cart>(`/cart/items/${itemId}`, { method: "DELETE" });
  },

  checkout(body: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
  }) {
    return apiRequest("/checkout", { method: "POST", body });
  },

  getOrders() {
    return apiRequest<Order[]>("/orders");
  },

  getAdminDashboard() {
    return apiRequest<{
      totalRevenue: string;
      totalOrders: number;
      totalProducts: number;
      totalCustomers: number;
      topProducts: Array<{
        product: Product | null;
        totalSold: number;
        orderItemCount: number;
      }>;
      recentOrders: Order[];
    }>("/admin/dashboard");
  },

  getAdminOrders(params: Record<string, string | number | undefined> = {}) {
    return apiRequest<Paginated<Order>>(
      `/admin/orders${toQueryString(params)}`
    );
  },

  updateAdminOrderStatus(id: string, status: OrderStatus) {
    return apiRequest<Order>(`/admin/orders/${id}/status`, {
      method: "PUT",
      body: { status }
    });
  },

  getBlogs(params: Record<string, string | number | boolean | undefined> = {}) {
    return apiRequest<Paginated<Blog>>(`/blogs${toQueryString(params)}`);
  },

  getBlog(id: string) {
    return apiRequest<Blog>(`/blogs/${id}`);
  },

  createBlog(body: Partial<Blog>) {
    return apiRequest<Blog>("/blogs", { method: "POST", body });
  },

  updateBlog(id: string, body: Partial<Blog>) {
    return apiRequest<Blog>(`/blogs/${id}`, { method: "PUT", body });
  },

  deleteBlog(id: string) {
    return apiRequest<void>(`/blogs/${id}`, { method: "DELETE" });
  },

  getFeaturedFlashSale() {
    return apiRequest<FlashSaleCampaign | null>("/flash-sales/featured");
  },

  getAdminFlashSales() {
    return apiRequest<FlashSaleCampaign[]>("/flash-sales");
  },

  getAdminFlashSale(id: string) {
    return apiRequest<FlashSaleCampaign>(`/flash-sales/${id}`);
  },

  createFlashSale(body: Partial<FlashSaleCampaign>) {
    return apiRequest<FlashSaleCampaign>("/flash-sales", {
      method: "POST",
      body
    });
  },

  updateFlashSale(id: string, body: Partial<FlashSaleCampaign>) {
    return apiRequest<FlashSaleCampaign>(`/flash-sales/${id}`, {
      method: "PUT",
      body
    });
  },

  deleteFlashSale(id: string) {
    return apiRequest<void>(`/flash-sales/${id}`, { method: "DELETE" });
  },

  addFlashSaleItem(campaignId: string, body: { productId: string; discountPercentage: number; stockLimit?: number }) {
    return apiRequest<FlashSaleItem>(`/flash-sales/${campaignId}/items`, {
      method: "POST",
      body
    });
  },

  removeFlashSaleItem(campaignId: string, productId: string) {
    return apiRequest<void>(`/flash-sales/${campaignId}/items/${productId}`, {
      method: "DELETE"
    });
  }
};

export const formatPrice = (value: string | number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value));
