import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Box, CheckCircle2, User, Phone, MapPin, Navigation, ClipboardCopy, FileText, Check, Truck, Package, XCircle, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const DeliveryDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    
    // Cancellation state
    const [cancelStep, setCancelStep] = useState<'initial' | 'reason' | 'final'>('initial');
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const { data: order, isLoading } = useQuery({
        queryKey: ['delivery', id],
        enabled: !!id,
        queryFn: async () => {
            if (!id) return null;
            try {
                const res = await api.get(`/deliveries/${id}`);
                return res.data;
            } catch {
                const res = await api.get(`/deliveries`);
                return res.data.find((o: any) => o.id === id) ?? null;
            }
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ status, cancelReason }: { status: string, cancelReason?: string }) => {
            await api.put(`/orders/${id}/status`, { status, cancelReason });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['delivery', id] });
            if (variables.status === 'completed' || variables.status === 'cancelled') {
                navigate('/courier');
            }
        }
    });

    const assignMutation = useMutation({
        mutationFn: async () => {
            await api.put(`/orders/${id}/assign`, { courierId: user?.id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['delivery', id] });
        }
    });

    const openMap = () => {
        if (order?.deliveryAddress) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`, '_blank');
        }
    };

    const callPhone = () => {
        if (order?.customerPhone) {
            window.location.href = `tel:${order.customerPhone}`;
        }
    };

    const handleStatusClick = (status: string) => {
        if (status === 'cancelled') {
            setIsCancelling(true);
            setCancelStep('initial');
            setCancelReason('');
            setConfirmOpen(true);
        } else {
            setIsCancelling(false);
            setPendingStatus(status);
            setConfirmOpen(true);
        }
    };

    const confirmStatusChange = (e: MouseEvent<HTMLButtonElement>) => {
        if (isCancelling) {
            // Cancellation logic flow
            if (cancelStep === 'initial') {
                e.preventDefault();
                setCancelStep('reason');
                return; // Don't close dialog
            }
            if (cancelStep === 'reason') {
                e.preventDefault();
                if (!cancelReason.trim()) return; // Require reason
                setCancelStep('final');
                return; // Don't close dialog
            }
            if (cancelStep === 'final') {
                updateStatusMutation.mutate({ status: 'cancelled', cancelReason });
                setConfirmOpen(false);
            }
        } else if (pendingStatus) {
            updateStatusMutation.mutate({ status: pendingStatus });
            setConfirmOpen(false);
        }
    };

    const getConfirmTitle = () => {
        if (isCancelling) {
            switch (cancelStep) {
                case 'initial': return 'Cancel Order?';
                case 'reason': return 'Why are you cancelling?';
                case 'final': return 'Final Confirmation';
            }
        }
        switch (pendingStatus) {
            case 'in_transit': return 'Start Delivery?';
            case 'completed': return 'Complete Order?';
            case 'pending': return 'Return to Pending?';
            default: return 'Confirmation';
        }
    };

    const getConfirmDescription = () => {
        if (isCancelling) {
            switch (cancelStep) {
                case 'initial': return 'This action cannot be undone. Are you sure you want to proceed?';
                case 'reason': return 'Please provide a valid reason for cancelling this order.';
                case 'final': return 'Are you absolutely sure? This will be recorded.';
            }
        }
        switch (pendingStatus) {
            case 'in_transit': return 'Have you checked the address and order items? Is everything correct?';
            case 'completed': return 'Did you hand over the order and receive payment?';
            case 'pending': return 'The order will become available for other couriers again.';
            default: return 'Are you sure?';
        }
    };

    if (isLoading) return <div className="p-4"><Skeleton className="h-[400px] w-full rounded-3xl" /></div>;
    if (!order) return <div className="p-4 text-center mt-10">Order not found</div>;

    const isPending = order.status === 'pending';
    const isInTransit = order.status === 'in_transit';
    const isCompleted = order.status === 'completed';

    const statusLabel =
        order.status === 'pending' ? 'Pending' :
        order.status === 'in_transit' ? 'In Transit' :
        order.status === 'completed' ? 'Completed' :
        order.status === 'cancelled' ? 'Cancelled' :
        order.status;

    const copyText = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            window.prompt('Copy:', text);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="h-14 border-b flex items-center px-2 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <Button variant="ghost" size="icon" onClick={() => navigate('/courier')}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex-1 text-center pr-10 font-bold">
                    Order #{order.number}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-6 pb-32">
                <div className="bg-muted/30 p-5 rounded-3xl space-y-4 border">
                    <div className="flex items-center justify-between">
                        <Badge className={cn(
                            "px-4 py-1.5 text-sm rounded-full",
                            isPending && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                            isInTransit && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                            isCompleted && "bg-green-100 text-green-800 hover:bg-green-100"
                        )}>
                            {statusLabel}
                        </Badge>
                        <div className="text-right">
                            <div className="text-3xl font-black text-primary tracking-tight leading-none">
                                {Number(order.total).toFixed(2)}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">TMT</div>
                        </div>
                    </div>

                    {/* Visual Progress Steps */}
                    <div className="bg-background/60 rounded-3xl p-5 border shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
                        
                        <div className="flex justify-between items-center relative mb-6">
                            {/* Connecting Lines */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 transform -translate-y-1/2"></div>
                            <div className={cn(
                                "absolute top-1/2 left-0 h-0.5 bg-primary -z-10 transform -translate-y-1/2 transition-all duration-500",
                                isPending ? "w-[0%]" : isInTransit ? "w-[50%]" : "w-[100%]"
                            )}></div>

                            {/* Step 1: Base */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10",
                                    isPending ? "bg-primary border-primary/20 text-white shadow-lg shadow-primary/20 scale-110" : 
                                    (isInTransit || isCompleted) ? "bg-primary text-white border-transparent" : "bg-slate-100 text-slate-400 border-white"
                                )}>
                                    {isInTransit || isCompleted ? <Check className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                                </div>
                                <div className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors", isPending ? "text-primary" : "text-muted-foreground")}>Base</div>
                            </div>

                            {/* Step 2: Transit */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10",
                                    isInTransit ? "bg-blue-500 border-blue-500/20 text-white shadow-lg shadow-blue-500/20 scale-110" : 
                                    isCompleted ? "bg-primary text-white border-transparent" : "bg-white text-slate-300 border-slate-100"
                                )}>
                                    {isCompleted ? <Check className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                                </div>
                                <div className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors", isInTransit ? "text-blue-600" : "text-muted-foreground")}>Route</div>
                            </div>

                            {/* Step 3: Client */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10",
                                    isCompleted ? "bg-green-500 border-green-500/20 text-white shadow-lg shadow-green-500/20 scale-110" : "bg-white text-slate-300 border-slate-100"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                <div className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors", isCompleted ? "text-green-600" : "text-muted-foreground")}>Customer</div>
                            </div>
                        </div>

                        {/* Current Action Prompt */}
                        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                            <div className="text-xs font-medium text-slate-600 flex items-center justify-center gap-2">
                                {isPending && <><Package className="h-4 w-4 text-primary" /> Check order, address and note</>}
                                {isInTransit && <><Navigation className="h-4 w-4 text-blue-500" /> Follow map. Call only if address not found</>}
                                {isCompleted && <><CheckCircle2 className="h-4 w-4 text-green-500" /> Order delivered successfully</>}
                                {order.status === 'cancelled' && <><XCircle className="h-4 w-4 text-destructive" /> Order was cancelled</>}
                            </div>
                        </div>
                    </div>

                    {order.note && (
                        <div className="bg-yellow-100 rounded-2xl p-4 border border-yellow-200 shadow-sm">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-yellow-800 mb-1 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Important Note
                            </div>
                            <div className="font-bold text-lg leading-snug text-yellow-950">{order.note}</div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</div>
                                <div className="font-black text-base leading-tight line-clamp-2">
                                    {order.receiverName || '—'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Address</div>
                                <div className="font-black text-base leading-tight line-clamp-3">
                                    {order.deliveryAddress || 'Pickup'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone</div>
                                <div className="font-black text-base leading-tight">
                                    {order.customerPhone || '—'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {(order.customerPhone || order.deliveryAddress) && (
                    <div className="bg-card p-4 rounded-3xl border shadow-sm space-y-3">
                        <div className="font-black text-base">Quick Actions</div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-14 rounded-2xl font-black gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                onClick={callPhone}
                                disabled={!order.customerPhone}
                            >
                                <Phone className="h-5 w-5" />
                                Call
                            </Button>
                            <Button
                                variant="outline"
                                className="h-14 rounded-2xl font-black gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                onClick={openMap}
                                disabled={!order.deliveryAddress}
                            >
                                <Navigation className="h-5 w-5" />
                                Map
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="secondary"
                                className="h-12 rounded-2xl font-bold gap-2"
                                onClick={() => order.customerPhone && copyText(order.customerPhone)}
                                disabled={!order.customerPhone}
                            >
                                <ClipboardCopy className="h-4 w-4" />
                                Copy Phone
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-12 rounded-2xl font-bold gap-2"
                                onClick={() => order.deliveryAddress && copyText(order.deliveryAddress)}
                                disabled={!order.deliveryAddress}
                            >
                                <ClipboardCopy className="h-4 w-4" />
                                Copy Address
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-end justify-between px-1">
                        <div className="font-black text-lg">Items</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {order.items?.length || 0} pcs
                        </div>
                    </div>

                    <div className="space-y-2">
                        {order.items?.map((item: any) => (
                            <div key={item.id} className="flex items-start gap-3 bg-card p-3 rounded-2xl border shadow-sm">
                                <div className="h-12 w-12 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                                    <Box className="h-5 w-5 text-muted-foreground opacity-60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-sm leading-snug line-clamp-2">
                                        {item.product?.name || item.name || 'Product'}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-medium">
                                        <span className="px-2 py-0.5 rounded-full bg-muted/60 font-black text-foreground">
                                            {item.quantity} pcs
                                        </span>
                                        <span>{Number(item.price).toFixed(2)} TMT / pc</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-sm">
                                        {(Number(item.quantity) * Number(item.price)).toFixed(2)}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">TMT</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card p-4 rounded-3xl border shadow-sm space-y-3">
                    <div className="font-black text-base">Payment</div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Subtotal</span>
                            <span className="font-bold">{(Number(order.total) - Number(order.deliveryFee || 0)).toFixed(2)} TMT</span>
                        </div>
                        {order.deliveryFee ? (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground font-medium">Delivery Fee</span>
                                <span className="font-bold">{Number(order.deliveryFee).toFixed(2)} TMT</span>
                            </div>
                        ) : null}
                        {order.paymentMethod ? (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground font-medium">Method</span>
                                <span className="font-bold">{order.paymentMethod}</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between font-black text-base pt-2 border-t">
                            <span>Total</span>
                            <span>{Number(order.total).toFixed(2)} TMT</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-20 pb-8">
                {order.courierId && order.courierId !== user?.id ? (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl font-medium text-center">
                         Assigned to another courier
                    </div>
                ) : !order.courierId ? (
                    <Button 
                         className="w-full h-14 text-lg font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                         onClick={() => assignMutation.mutate()}
                         disabled={assignMutation.isPending}
                     >
                         Accept Order
                     </Button>
                ) : (
                    <>
                        {isPending && (
                            <div className="grid gap-3">
                                <Button
                                    className="w-full h-14 text-lg font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                                    onClick={() => handleStatusClick('in_transit')}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    <Box className="mr-2 h-5 w-5" />
                                    Start Delivery
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 font-bold text-destructive border-destructive/20 hover:bg-destructive/10"
                                    onClick={() => handleStatusClick('cancelled')}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    Cancel Order
                                </Button>
                            </div>
                        )}

                        {isInTransit && (
                            <div className="grid grid-cols-[1fr,2fr] gap-3">
                                <Button
                                    variant="outline"
                                    className="h-14 rounded-2xl font-bold border-destructive/20 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleStatusClick('pending')}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="h-14 text-lg font-bold rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                                    onClick={() => handleStatusClick('completed')}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Completed
                                </Button>
                            </div>
                        )}

                        {isCompleted && (
                            <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-2xl bg-muted/50" disabled>
                                Done
                            </Button>
                        )}
                    </>
                )}
            </div>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className="rounded-3xl max-w-[90vw] w-[400px]">
                    <AlertDialogHeader className={cn(isCancelling && "bg-red-50 -mx-6 -mt-6 p-6 rounded-t-3xl border-b border-red-100")}>
                        <AlertDialogTitle className={cn("text-xl", isCancelling && "text-red-600 flex items-center gap-2")}>
                            {isCancelling && <AlertTriangle className="h-6 w-6 fill-red-100" />}
                            {getConfirmTitle()}
                        </AlertDialogTitle>
                        <AlertDialogDescription className={cn("text-base pt-2", isCancelling && "text-red-900 font-medium")}>
                            {getConfirmDescription()}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {isCancelling && cancelStep === 'reason' && (
                        <div className="py-2">
                            <Label htmlFor="reason" className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Reason for cancellation</Label>
                            <Input 
                                id="reason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="E.g., Client refused, wrong address..."
                                className="h-12 rounded-xl"
                                autoFocus
                            />
                        </div>
                    )}

                    <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
                        <AlertDialogCancel className="flex-1 rounded-xl h-12 mt-0">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmStatusChange} 
                            className={cn(
                                "flex-1 rounded-xl h-12 font-bold",
                                isCancelling 
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                                    : "bg-primary text-primary-foreground"
                            )}
                            disabled={isCancelling && cancelStep === 'reason' && !cancelReason.trim()}
                        >
                            {isCancelling ? (cancelStep === 'final' ? 'Yes, Cancel Order' : 'Next') : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
