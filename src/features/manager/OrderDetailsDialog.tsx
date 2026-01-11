import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Printer, MapPin, ShoppingBag, Clock, Calendar, Pencil, Save, X, User, Phone, FileText, AlertTriangle, Bike } from 'lucide-react';
import type { Order } from '@/types';
import { toast } from 'sonner';

interface OrderDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order | null;
    onStatusChange?: (status: string) => void;
    onOrderUpdated?: (order: Order) => void;
}

export const OrderDetailsDialog = ({ open, onOpenChange, order, onStatusChange, onOrderUpdated }: OrderDetailsDialogProps) => {
    const queryClient = useQueryClient();
    const [isEditingDelivery, setIsEditingDelivery] = useState(false);
    const deliveryNoteText = useMemo(() => {
        if (!order) return '';
        if (order.note && order.note.startsWith('CANCELLED:')) return '';
        return order.note || '';
    }, [order]);

    const cancelReasonText = useMemo(() => {
        if (!order) return '';
        if (order.cancelReason) return order.cancelReason;
        if (order.status === 'cancelled' && order.note?.startsWith('CANCELLED:')) {
            const parsed = order.note.slice('CANCELLED:'.length).trim();
            return parsed || '';
        }
        return '';
    }, [order]);

    const [deliveryDraft, setDeliveryDraft] = useState({
        receiverName: order?.receiverName || '',
        customerPhone: order?.customerPhone || '',
        deliveryAddress: order?.deliveryAddress || '',
        note: deliveryNoteText
    });

    useEffect(() => {
        if (!order) return;
        setIsEditingDelivery(false);
        setDeliveryDraft({
            receiverName: order.receiverName || '',
            customerPhone: order.customerPhone || '',
            deliveryAddress: order.deliveryAddress || '',
            note: order.note && order.note.startsWith('CANCELLED:') ? '' : (order.note || '')
        });
    }, [order?.id]);

    const updateDeliveryMutation = useMutation({
        mutationFn: async () => {
            if (!order) throw new Error('Order not found');
            const res = await api.put(`/orders/${order.id}/delivery`, {
                receiverName: deliveryDraft.receiverName.trim(),
                customerPhone: deliveryDraft.customerPhone.trim(),
                deliveryAddress: deliveryDraft.deliveryAddress.trim(),
                note: deliveryDraft.note.trim()
            });
            return res.data as Order;
        },
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            onOrderUpdated?.(updated);
            toast.success('Delivery info updated');
            setIsEditingDelivery(false);
        },
        onError: () => {
            toast.error('Failed to update delivery info');
        }
    });

    if (!order) return null;

    const handlePrint = () => {
        toast.info("Printing receipt...");
        // Implement actual printing logic here if needed
    };

    const totalSavings = order.items.reduce((acc, item) => {
        if (item.originalPrice && item.originalPrice > item.price) {
            return acc + (item.originalPrice - item.price) * item.quantity;
        }
        return acc;
    }, 0);

    const grossTotal = order.items.reduce((acc, item) => {
        const originalPrice = item.originalPrice && item.originalPrice > item.price 
            ? item.originalPrice 
            : item.price;
        return acc + originalPrice * item.quantity;
    }, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-visible bg-transparent border-none shadow-none">
                <div className="flex flex-col w-full h-full max-h-[85vh] bg-card rounded-3xl overflow-hidden shadow-lg border">
                    <DialogHeader className="p-6 pb-4 border-b shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold">Order #{order.number}</DialogTitle>
                                <p className="text-sm text-muted-foreground">Order Details</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full font-semibold text-sm capitalize border shadow-sm ${
                                order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                                {order.status.replace('_', ' ')}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Info Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center justify-center p-2 bg-muted/40 rounded-lg border border-transparent hover:border-border hover:bg-muted transition-all duration-200">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Type</span>
                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                    {order.type === 'delivery' ? <MapPin className="h-3.5 w-3.5 text-primary/70" /> : <ShoppingBag className="h-3.5 w-3.5 text-primary/70" />}
                                    <span className="capitalize">{order.type}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 bg-muted/40 rounded-lg border border-transparent hover:border-border hover:bg-muted transition-all duration-200">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Date</span>
                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                    <Calendar className="h-3.5 w-3.5 text-primary/70" />
                                    <span>{new Date(order.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 bg-muted/40 rounded-lg border border-transparent hover:border-border hover:bg-muted transition-all duration-200">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Time</span>
                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                                    <span>{new Date(order.date).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>

                    {order.status === 'cancelled' && cancelReasonText ? (
                        <div className="bg-red-50/60 p-4 rounded-2xl border border-red-100">
                            <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                Cancellation Reason
                            </div>
                            <div className="text-sm font-medium text-red-950 leading-snug">{cancelReasonText}</div>
                        </div>
                    ) : null}

                    {/* Customer Info (if delivery) */}
                    {order.type === 'delivery' && (
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Delivery Info</div>
                                {!isEditingDelivery ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => setIsEditingDelivery(true)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => {
                                                setIsEditingDelivery(false);
                                                setDeliveryDraft({
                                                    receiverName: order.receiverName || '',
                                                    customerPhone: order.customerPhone || '',
                                                    deliveryAddress: order.deliveryAddress || '',
                                                    note: deliveryNoteText
                                                });
                                            }}
                                            disabled={updateDeliveryMutation.isPending}
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => updateDeliveryMutation.mutate()}
                                            disabled={updateDeliveryMutation.isPending}
                                        >
                                            <Save className="h-4 w-4" />
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {isEditingDelivery ? (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9 bg-white"
                                            placeholder="Receiver name"
                                            value={deliveryDraft.receiverName}
                                            onChange={(e) => setDeliveryDraft((s) => ({ ...s, receiverName: e.target.value }))}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9 bg-white"
                                            placeholder="Phone number"
                                            value={deliveryDraft.customerPhone}
                                            onChange={(e) => setDeliveryDraft((s) => ({ ...s, customerPhone: e.target.value }))}
                                        />
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <textarea
                                            className="w-full min-h-[72px] resize-none rounded-md border border-input bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Delivery address"
                                            value={deliveryDraft.deliveryAddress}
                                            onChange={(e) => setDeliveryDraft((s) => ({ ...s, deliveryAddress: e.target.value }))}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <textarea
                                            className="w-full min-h-[72px] resize-none rounded-md border border-input bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Delivery comment"
                                            value={deliveryDraft.note}
                                            onChange={(e) => setDeliveryDraft((s) => ({ ...s, note: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {order.courier && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 shrink-0 border border-purple-100">
                                                <Bike className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    {order.status === 'cancelled' ? 'Cancelled By' : 'Courier'}
                                                </div>
                                                <div className="font-medium leading-snug">{order.courier.name}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-white/70 flex items-center justify-center text-blue-700 shrink-0 border border-blue-100">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Receiver</div>
                                            <div className="font-medium leading-snug">{order.receiverName || '—'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-white/70 flex items-center justify-center text-blue-700 shrink-0 border border-blue-100">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone</div>
                                            <div className="font-medium leading-snug">{order.customerPhone || '—'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-white/70 flex items-center justify-center text-blue-700 shrink-0 border border-blue-100">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Address</div>
                                            <div className="font-medium leading-snug whitespace-pre-wrap">{order.deliveryAddress || '—'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-white/70 flex items-center justify-center text-blue-700 shrink-0 border border-blue-100">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Comment</div>
                                            <div className="font-medium leading-snug whitespace-pre-wrap">{deliveryNoteText || '—'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Items</p>
                        <div className="space-y-2">
                            {order.items.map((item) => {
                                const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                                return (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-transparent hover:border-border transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-auto min-w-[2.5rem] px-1 bg-background rounded-lg border flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0 relative">
                                            {item.quantity} {item.product?.unit || 'x'}
                                            {hasDiscount && (
                                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full font-bold">
                                                    %
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium leading-snug">
                                                {item.name || item.product?.name || `Product #${item.productId.slice(0, 8)}...`}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs text-muted-foreground">
                                                    {item.price.toFixed(2)} TMT / unit
                                                </p>
                                                {hasDiscount && (
                                                     <p className="text-xs text-muted-foreground line-through">
                                                        {item.originalPrice!.toFixed(2)} TMT
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {hasDiscount && (
                                            <div className="text-xs text-muted-foreground line-through mb-0.5">
                                                {(item.originalPrice! * item.quantity).toFixed(2)} TMT
                                            </div>
                                        )}
                                        <div className="font-bold text-sm">
                                            {(item.price * item.quantity).toFixed(2)} TMT
                                        </div>
                                        {hasDiscount && (
                                            <div className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded-full mt-1">
                                                Discount {((item.originalPrice! - item.price) * item.quantity).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-muted p-4 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{totalSavings > 0 ? "Subtotal (Original Price)" : "Subtotal"}</span>
                            <span className={totalSavings > 0 ? "line-through text-muted-foreground" : ""}>
                                {grossTotal.toFixed(2)} TMT
                            </span>
                        </div>
                        
                        {totalSavings > 0 && (
                            <div className="flex justify-between text-sm font-bold text-red-600">
                                <span>Discount</span>
                                <span>-{totalSavings.toFixed(2)} TMT</span>
                            </div>
                        )}

                        {order.deliveryFee ? (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Delivery Fee</span>
                                <span>{order.deliveryFee.toFixed(2)} TMT</span>
                            </div>
                        ) : null}

                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>{totalSavings > 0 ? "Total (After Discount)" : "Total"}</span>
                            <span>{order.total.toFixed(2)} TMT</span>
                        </div>
                    </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-4 border-t bg-muted/10 shrink-0 flex flex-col gap-3">
                        {onStatusChange && (
                            <div className="flex gap-3">
                                {order.status !== 'cancelled' && (
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => onStatusChange('cancelled')}
                                        className="flex-1"
                                    >
                                        Cancel Order
                                    </Button>
                                )}
                                
                                {order.status === 'pending' && (
                                    <Button 
                                        className="bg-green-600 hover:bg-green-700 flex-1" 
                                        onClick={() => onStatusChange('completed')}
                                    >
                                        Mark Completed
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
                                <Printer className="h-4 w-4" />
                                Print Receipt
                            </Button>
                            
                            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                    </div>
            </DialogContent>
        </Dialog>
    );
};
