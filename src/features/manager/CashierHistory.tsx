import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import type { Order } from '@/types';

export const CashierHistory = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const { data: orders, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['cashier-orders', id],
        queryFn: async () => {
            const res = await api.get(`/cashiers/${id}/orders`);
            return res.data;
        }
    });

    const { data: cashier } = useQuery({
        queryKey: ['cashier', id],
        queryFn: async () => {
            const res = await api.get(`/cashiers/${id}`);
            return res.data;
        }
    });

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    if (isLoadingOrders) return <div className="p-4"><Skeleton className="h-40 w-full" /></div>;

    return (
        <div className="space-y-4 pb-10">
            <div className="flex items-center mb-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/manager/employees')}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-xl font-bold ml-2">Employee Sales History</h2>
            </div>

            {/* Header / Cashier Info */}
            <div className="bg-muted p-4 rounded-xl border mb-6">
                <h3 className="font-bold text-lg">{cashier?.name || cashier?.username || `Cashier #${id}`}</h3>
                <div className="text-sm text-muted-foreground">@{cashier?.username || 'unknown'}</div>
                <div className="mt-2 text-sm font-medium">
                    Total Sales: {cashier?.totalSales?.toFixed(2) || '0.00'} TMT
                </div>
            </div>

            <div className="space-y-4">
                {orders?.map((order: any) => (
                    <div 
                        key={order.id} 
                        className="bg-card p-4 rounded-xl border space-y-3 cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.99]"
                        onClick={() => handleOrderClick(order)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                {order.type === 'delivery' ? <MapPin className="h-4 w-4 text-primary" /> : <ShoppingBag className="h-4 w-4 text-primary" />}
                                <span className="font-bold text-sm capitalize">{order.type}</span>
                            </div>
                            <span className="font-bold">{order.total} TMT</span>
                        </div>

                        <div className="text-xs text-muted-foreground line-clamp-2">
                            {order.items.map((i: any) => `${i.quantity} ${i.product?.unit || 'x'} ${i.product?.name || 'Product'}`).join(', ')}
                        </div>

                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {new Date(order.date).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <OrderDetailsDialog 
                open={isDetailsOpen} 
                onOpenChange={setIsDetailsOpen} 
                order={selectedOrder} 
            />
        </div>
    );
};
