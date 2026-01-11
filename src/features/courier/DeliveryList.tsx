import type { MouseEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Package, Phone, Navigation, User, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types';

import { useAuth } from '@/context/AuthContext';

export const DeliveryList = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const rawTab = searchParams.get('status') || 'pending';
    const activeTab =
        rawTab === 'pending' || rawTab === 'in_transit' || rawTab === 'completed' || rawTab === 'cancelled'
            ? rawTab
            : 'pending';

    const { data: deliveries, isLoading } = useQuery({
        queryKey: ['deliveries', activeTab, user?.id],
        queryFn: async () => {
            if (activeTab === 'pending') {
                const res = await api.get('/deliveries?available=true');
                return res.data as Order[];
            }
            if (activeTab === 'in_transit') {
                const res = await api.get(`/deliveries?courierId=${user?.id}&status=pending,in_transit`);
                return res.data as Order[];
            }
            // For completed and cancelled
            const res = await api.get(`/deliveries?courierId=${user?.id}&status=${activeTab}`);
            return res.data as Order[];
        },
        refetchInterval: activeTab === 'pending' || activeTab === 'in_transit' ? 5000 : false
    });

    const openMap = (e: MouseEvent, address: string) => {
        e.preventDefault();
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    const callPhone = (e: MouseEvent, phone: string) => {
        e.preventDefault();
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="flex flex-col h-full bg-muted/10">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 px-4 pt-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <h1 className="text-xl font-black tracking-tight">Deliveries</h1>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black leading-none text-primary">{deliveries?.length || 0}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Count</div>
                </div>
            </div>

            <Tabs
                value={activeTab}
                className="flex-1 flex flex-col px-4"
                onValueChange={(value) => {
                    setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set('status', value);
                        return next;
                    });
                }}
            >
                <TabsList className="grid w-full grid-cols-4 mb-4 bg-muted/50 p-1 h-12 rounded-xl">
                    <TabsTrigger value="pending" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Waitlist</TabsTrigger>
                    <TabsTrigger value="in_transit" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">On Route</TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Closed</TabsTrigger>
                    <TabsTrigger value="cancelled" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Cancelled</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto space-y-3 pb-20 -mx-4 px-4">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
                        ))
                    ) : (
                        deliveries?.map((order: any) => (
                            <Link to={`/courier/${order.id}`} key={order.id} className="block bg-card p-5 rounded-3xl border shadow-sm active:scale-[0.98] transition-all relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                
                                <div className="flex justify-between items-start mb-4 pl-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                            <span>#{order.number}</span>
                                            <span>•</span>
                                            <span>{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className="font-black text-xl">{order.total} TMT</div>
                                    </div>
                                    <Badge variant={order.status === 'pending' ? 'secondary' : 'outline'} className="rounded-full px-3 capitalize">
                                        {order.status.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="space-y-3 pl-2">
                                    {order.receiverName && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-sm">{order.receiverName}</span>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm leading-tight py-1.5">
                                            {order.deliveryAddress || "Local Pickup"}
                                        </span>
                                    </div>

                                    {order.note && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-sm leading-tight py-1.5 text-yellow-800 line-clamp-2">
                                                {order.note}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-5 pl-2">
                                    {order.customerPhone && (
                                        <Button 
                                            variant="outline" 
                                            size="lg" 
                                            className="rounded-xl h-12 font-bold gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                            onClick={(e) => callPhone(e, order.customerPhone)}
                                        >
                                            <Phone className="h-4 w-4" />
                                            Call
                                        </Button>
                                    )}
                                    {order.deliveryAddress && (
                                        <Button 
                                            variant="outline" 
                                            size="lg" 
                                            className="rounded-xl h-12 font-bold gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                            onClick={(e) => openMap(e, order.deliveryAddress)}
                                        >
                                            <Navigation className="h-4 w-4" />
                                            Map
                                        </Button>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}

                    {!isLoading && deliveries?.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">No deliveries found</p>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
};
