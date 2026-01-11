export interface Category {
    id: string;
    name: string;
}

export interface Promotion {
    id: string;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    products?: Product[];
}

export interface Product {
    id: string;
    name: string;
    barcode: string;
    stock: number;
    buyPrice: number;
    sellPrice: number;
    categoryId: string;
    unit: string;
    unitType: 'piece' | 'weight';
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
    promotions?: Promotion[];
}

export interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    name?: string;
    product?: Product;
}

export interface Order {
    id: string;
    number: number;
    cashierId: string;
    cashier?: {
        id: string;
        name: string;
        username: string;
    };
    courierId?: string;
    courier?: User;
    total: number;
    type: 'local' | 'delivery';
    status: 'pending' | 'completed' | 'cancelled' | 'in_transit';
    cancelReason?: string;
    deliveryAddress?: string;
    deliveryFee?: number;
    customerPhone?: string;
    receiverName?: string;
    paymentMethod?: 'cash' | 'card';
    note?: string;
    items: OrderItem[];
    date: Date;
}

export interface User {
    id: string;
    username: string;
    role: 'admin' | 'manager' | 'cashier' | 'storage' | 'courier';
    name: string;
}
