import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

export interface OrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  menu_item: MenuItem;
}

export interface Order {
  id: number;
  customer_name: string;
  address: string;
  phone: string;
  status: 'received' | 'preparing' | 'out_for_delivery' | 'delivered';
  items: OrderItem[];
}

export interface OrderCreate {
  customer_name: string;
  address: string;
  phone: string;
  items: { menu_item_id: number; quantity: number }[];
}

export const menuApi = {
  getAll: () => api.get<MenuItem[]>('/menu/').then(res => res.data),
};

export const ordersApi = {
  getAll: () => api.get<Order[]>('/orders/').then(res => res.data),
  getOne: (id: number) => api.get<Order>(`/orders/${id}`).then(res => res.data),
  create: (data: OrderCreate) => api.post<Order>('/orders/', data).then(res => res.data),
  updateStatus: (id: number, status: string) =>
    api.patch<Order>(`/orders/${id}`, { status }).then(res => res.data),
};

export const sseApi = {
  streamOrderStatus: (orderId: number) => {
    return new EventSource(`/api/sse/orders/${orderId}`);
  },
};