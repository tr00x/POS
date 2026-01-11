import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useOrders } from '@/hooks/useOrders';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ShoppingBag, MapPin, XCircle, CheckCircle, Clock, User, Bike } from 'lucide-react';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import type { Order } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const OrdersManagement = () => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    
    const queryClient = useQueryClient();
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { 
        orders, 
        isLoading, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useOrders({ limit: 20 });

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        });
        
        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }
        
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await api.put(`/orders/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order status updated');
            setIsDetailsOpen(false);
        },
        onError: () => {
            toast.error('Failed to update status');
        }
    });

    const filteredOrders = orders?.filter((order: Order) => {
        const matchesSearch = 
            order.number.toString().includes(search) ||
            order.cashier?.name.toLowerCase().includes(search.toLowerCase()) ||
            order.total.toString().includes(search);
        
        const matchesType = typeFilter === 'all' || order.type === typeFilter;
        
        return matchesSearch && matchesType;
    });

    const totalRevenue = filteredOrders?.reduce((acc: number, order: Order) => acc + order.total, 0) || 0;
    const totalOrdersCount = filteredOrders?.length || 0;

    const handleStatusChange = (status: string) => {
        if (!selectedOrder) return;
        updateStatusMutation.mutate({ id: selectedOrder.id, status });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'in_transit': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-card p-4 rounded-xl border shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                    <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} TMT</div>
                </div>
                 <div className="bg-card p-4 rounded-xl border shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
                    <div className="text-2xl font-bold">{totalOrdersCount}</div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h1 className="text-2xl font-bold">Orders Management</h1>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by ID, Cashier..." 
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px]">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                <SelectValue placeholder="Order Type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="local">Local</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders?.map((order: Order) => (
                        <div 
                            key={order.id}
                            className="bg-card p-4 rounded-xl border hover:shadow-sm transition-all cursor-pointer group"
                            onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                        order.type === 'delivery' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                    )}>
                                        {order.type === 'delivery' ? <MapPin className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg">#{order.number}</span>
                                            <Badge variant="secondary" className={cn("capitalize gap-1", getStatusColor(order.status))}>
                                                {getStatusIcon(order.status)}
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>{new Date(order.date).toLocaleString()}</span>
                                            <span>•</span>
                                            <span>{order.items.length} items</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1 text-foreground font-medium">
                                                <User className="h-3 w-3" />
                                                {order.cashier?.name || 'Unknown Cashier'}
                                            </div>
                                        </div>
                                        {order.receiverName && (
                                            <div className="flex items-center gap-2 mt-1 text-sm text-blue-600 font-medium">
                                                <User className="h-3 w-3" />
                                                Receiver: {order.receiverName}
                                            </div>
                                        )}
                                        {order.courier && (
                                            <div className="flex items-center gap-2 mt-1 text-sm text-purple-600 font-medium">
                                                <Bike className="h-3 w-3" />
                                                {order.status === 'cancelled' ? 'Cancelled by: ' : 'Courier: '}
                                                {order.courier.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xl font-bold">{order.total.toFixed(2)} TMT</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">
                                        {order.paymentMethod}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredOrders?.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            No orders found matching your filters.
                        </div>
                    )}

                    {/* Infinite Scroll Trigger */}
                    <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                        {isFetchingNextPage && (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        )}
                    </div>
                </div>
            )}

            <OrderDetailsDialog 
                order={selectedOrder}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                onStatusChange={handleStatusChange}
                onOrderUpdated={(updated) => setSelectedOrder(updated)}
            />
        </div>
    );
};
