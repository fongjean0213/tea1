export interface Admin {
  id: string;
  email: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  priceM: number;
  priceL: number;
  isActive: boolean;
  createdAt: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  size: 'M' | 'L';
  price: number;
  sugar: string;
  ice: string;
  toppings?: string[];
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  items: OrderItem[];
  createdAt: number;
  updatedAt: number;
}
