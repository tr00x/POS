import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Printer } from 'lucide-react';
import type { Order } from '@/types';
import type { CartItem } from './CashierLayout';
import { toast } from 'sonner';
import { useSound } from '@/hooks/useSound';

interface OrderSuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order | null;
    cartItems: CartItem[]; // Pass cart items to show names
    change?: number;
    onClose: () => void;
}

export const OrderSuccessDialog = ({ open, onOpenChange, order, cartItems, change, onClose }: OrderSuccessDialogProps) => {
    const { playSound } = useSound();

    if (!order) return null;

    const handlePrint = () => {
        toast.info("Printing receipt...");
        playSound('success'); // Reusing success sound for feedback
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
            <DialogContent className="max-w-sm p-0 overflow-visible bg-transparent border-none shadow-none">
                <div className="flex flex-col items-center text-center max-h-[90vh] overflow-y-auto custom-scrollbar bg-background rounded-3xl border shadow-lg p-6">
                <DialogHeader className="sr-only">
                    <DialogTitle>Payment Successful</DialogTitle>
                </DialogHeader>
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                
                <h2 className="text-2xl font-bold mb-1">Payment Successful</h2>
                <p className="text-muted-foreground mb-6">Order #{order.number}</p>

                <div className="w-full bg-muted/30 p-4 rounded-xl mb-6 text-left space-y-3">
                    <div className="space-y-1 border-b border-dashed border-gray-300 pb-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                        {order.items.map((item) => {
                            const cartItem = cartItems.find(c => c.id === item.productId) || cartItems.find(c => c.id === item.id);
                            const name = item.name || cartItem?.name || 'Item';
                            const hasDiscount = !!(item.originalPrice && item.originalPrice > item.price);
                            
                            return (
                                <div key={item.id} className="grid grid-cols-[auto_1fr_auto] gap-3 text-sm py-2 border-b border-gray-50 last:border-0 items-center">
                                    <div className="font-medium text-muted-foreground min-w-[1.5rem] w-auto text-center bg-gray-100 rounded text-xs py-0.5 px-1 h-fit mt-0.5 whitespace-nowrap">
                                        {item.quantity} {cartItem?.unit || 'x'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate">{name}</span>
                                        {hasDiscount && (
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted-foreground line-through">
                                                    {(item.originalPrice! * item.quantity).toFixed(2)}
                                                </span>
                                                <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded-full">
                                                    -{((1 - item.price / item.originalPrice!) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-bold text-right whitespace-nowrap">
                                        {(item.price * item.quantity).toFixed(2)} TMT
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                            {order.deliveryFee !== undefined && order.deliveryFee > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className="font-bold">{order.deliveryFee.toFixed(2)} TMT</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{totalSavings > 0 ? "Subtotal (Original)" : "Subtotal"}</span>
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
                        </div>

                        <div className="flex justify-between text-lg font-black border-t border-dashed pt-3">
                            <span>{totalSavings > 0 ? "Total (After Discount)" : "Total"}</span>
                            <span>{order.total.toFixed(2)} TMT</span>
                        </div>

                        {(change !== undefined && change > 0 && order.type === 'local') || order.paymentMethod ? (
                            <div className="space-y-1 pt-1">
                                {change !== undefined && change > 0 && order.type === 'local' && (
                                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                                        <span>Change</span>
                                        <span>{change.toFixed(2)} TMT</span>
                                    </div>
                                )}
                                {order.paymentMethod && (
                                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                        <span>Payment Method</span>
                                        <span className="uppercase tracking-wider">{order.paymentMethod}</span>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {order.note && (
                            <div className="flex justify-between text-xs font-medium text-muted-foreground pt-2 border-t border-dashed">
                                <span>Note</span>
                                <span className="max-w-[150px] text-right truncate">{order.note}</span>
                            </div>
                        )}
                    </div>
                </div>

                {order.type === 'delivery' && (
                     <div className="w-full text-left mb-6 text-sm bg-blue-50 p-4 rounded-xl text-blue-900">
                        <p className="font-bold text-blue-400 text-xs uppercase tracking-wider mb-2">Delivery Details</p>
                        <p className="font-bold">{order.customerPhone}</p>
                        <p className="opacity-80 mt-1">{order.deliveryAddress}</p>
                     </div>
                )}

                <div className="grid grid-cols-4 gap-3 w-full">
                    <Button 
                        variant="outline" 
                        className="col-span-1 h-12 rounded-xl border-dashed border-2"
                        onClick={handlePrint}
                    >
                        <Printer className="h-5 w-5" />
                    </Button>
                    <Button className="col-span-3 h-12 text-lg rounded-xl font-bold" onClick={onClose}>
                        Done
                    </Button>
                </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
