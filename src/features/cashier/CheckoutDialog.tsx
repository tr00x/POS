import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Numpad } from '@/components/shared/Numpad';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import type { CartItem } from './CashierLayout';
import { ChevronLeft, Pencil, Phone, MapPin, CreditCard, Banknote, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';
import { toast } from 'sonner';
import { OrderSuccessDialog } from './OrderSuccessDialog';
import type { Order } from '@/types';

interface CheckoutProps {
    cart: CartItem[];
    total: number;
    clearCart: () => void;
    children?: React.ReactNode;
    getDiscountedPrice?: (product: CartItem) => number;
}

type OrderType = 'local' | 'delivery_free' | 'delivery_paid';

export const CheckoutDialog = ({ cart, total, clearCart, children, getDiscountedPrice }: CheckoutProps) => {
    const { createOrder, isCreating } = useOrders();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [payment, setPayment] = useState('');
    const [orderType, setOrderType] = useState<OrderType>('local');
    const [note, setNote] = useState('');
    const [address, setAddress] = useState('');
    const [deliveryPrice, setDeliveryPrice] = useState('15');
    const [customerPhone, setCustomerPhone] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    
    // Success Dialog State
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
    const { playSound } = useSound();

    const handleInput = (val: string) => {
        setPayment(prev => {
            if (val === '.' && prev.includes('.')) return prev;
            if (prev === '0' && val !== '.') return val;
            if (prev.length > 8) return prev; // Limit length
            return prev + val;
        });
    };

    const handleDelete = () => {
        setPayment(prev => prev.slice(0, -1));
    };

    const deliveryFee = orderType === 'delivery_paid' ? (parseFloat(deliveryPrice) || 0) : 0;
    const finalTotal = total + deliveryFee;
    
    const savings = cart.reduce((acc, item) => {
        const original = item.sellPrice * item.quantity;
        const discounted = (getDiscountedPrice ? getDiscountedPrice(item) : item.sellPrice) * item.quantity;
        return acc + (original - discounted);
    }, 0);

    const grossSubtotal = cart.reduce((acc, item) => {
        return acc + item.sellPrice * item.quantity;
    }, 0);

    const paymentAmount = parseFloat(payment || '0');
    const change = paymentAmount - finalTotal;
    const isPaymentSufficient = paymentAmount >= finalTotal;

    const handleCheckout = async () => {
        if (!isPaymentSufficient && orderType === 'local') return;
        if (!user?.id) {
            toast.error('User not authenticated');
            return;
        }
        
        if (orderType !== 'local') {
            if (!customerPhone || !address) {
                 toast.error('Please fill in all delivery details');
                 playSound('error');
                 return;
            }
        }

        try {
            const order = await createOrder({
                items: cart.map(i => ({
                    productId: i.id,
                    quantity: i.quantity,
                    price: getDiscountedPrice ? getDiscountedPrice(i) : i.sellPrice
                })),
                cashierId: user.id,
                type: orderType === 'local' ? 'local' : 'delivery',
                deliveryAddress: orderType !== 'local' ? address : undefined,
                deliveryFee: deliveryFee > 0 ? deliveryFee : undefined,
                customerPhone: orderType !== 'local' ? customerPhone : undefined,
                receiverName: orderType !== 'local' ? receiverName : undefined,
                paymentMethod: orderType === 'local' ? paymentMethod : 'cash',
                note: note || undefined,
            });
            
            setCreatedOrder(order);
            playSound('success');
            toast.success('Order completed successfully');
            setOpen(false);
            setShowSuccess(true);
        } catch (error) {
            console.error(error);
            playSound('error');
            toast.error('Failed to create order');
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        setCreatedOrder(null);
        clearCart();
    };

    return (
        <>
            <OrderSuccessDialog 
                open={showSuccess} 
                onOpenChange={(val) => !val && handleSuccessClose()} 
                order={createdOrder}
                cartItems={cart}
                change={change}
                onClose={handleSuccessClose}
            />
            
            <Dialog open={open} onOpenChange={(val) => {
                setOpen(val);
                if (val) {
                    setPayment('');
                    setOrderType('local');
                    setNote('');
                    setAddress('');
                    setCustomerPhone('');
                    setReceiverName('');
                    setDeliveryPrice('15');
                    setPaymentMethod('cash');
                }
            }}>
                <DialogTrigger asChild>
                    {children || (
                        <Button
                            className="w-full text-lg font-bold h-14 rounded-xl shadow-lg animate-in slide-in-from-bottom duration-500"
                            size="lg"
                            disabled={cart.length === 0}
                        >
                            Pay {total.toFixed(2)} TMT
                        </Button>
                    )}
                </DialogTrigger>

                <DialogContent className="max-w-md w-full h-[100dvh] md:h-auto p-0 overflow-visible bg-transparent border-none shadow-none">
                    <div className="flex flex-col w-full h-full overflow-hidden bg-background/95 backdrop-blur-md md:rounded-3xl border-0 md:border shadow-lg">
                    <div className="sr-only">
                        <DialogTitle>Checkout</DialogTitle>
                        <DialogDescription>Complete your purchase</DialogDescription>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-background/50">
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground pl-0" onClick={() => setOpen(false)}>
                            <ChevronLeft className="h-5 w-5" />
                            Checkout
                        </Button>
                        <div className="flex flex-col items-end text-right">
                            <div className="text-xs text-muted-foreground">
                                {savings > 0 && (
                                    <span className="line-through mr-2">
                                        {grossSubtotal.toFixed(2)}
                                    </span>
                                )}
                                Subtotal
                            </div>
                            {savings > 0 && (
                                <div className="text-xs font-bold text-red-600">
                                    Discount -{savings.toFixed(2)}
                                </div>
                            )}
                            <div className="text-2xl font-black">{finalTotal.toFixed(2)} TMT</div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-auto p-4 space-y-4">
                        
                        {/* Input Area */}
                        {orderType === 'local' ? (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border relative group min-h-[120px] flex flex-col">
                                <div className="absolute top-4 left-4 p-2 bg-muted rounded-full">
                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <textarea 
                                    className="w-full h-full bg-transparent resize-none outline-none text-lg p-2 pl-12 placeholder:text-muted-foreground/50"
                                    placeholder="Optional comment..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border space-y-3 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-3 border-b pb-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <Input 
                                        className="border-0 p-0 h-auto focus-visible:ring-0 font-semibold placeholder:font-normal text-base"
                                        placeholder="Receiver Name"
                                        value={receiverName}
                                        onChange={e => setReceiverName(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-3 border-b pb-2">
                                    <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <Input 
                                        className="border-0 p-0 h-auto focus-visible:ring-0 font-semibold placeholder:font-normal text-base"
                                        placeholder="Phone Number"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-start gap-3 border-b pb-2">
                                    <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <textarea 
                                        className="w-full resize-none outline-none text-base min-h-[60px] placeholder:text-muted-foreground/50 py-1"
                                        placeholder="Delivery Address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-start gap-3 pt-1">
                                    <div className="h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500 shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <textarea 
                                        className="w-full resize-none outline-none text-base min-h-[40px] placeholder:text-muted-foreground/50 py-1"
                                        placeholder="Delivery Note (e.g. Code, Floor)"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'local', label: 'Local sale' },
                                { id: 'delivery_free', label: 'Free Delivery' },
                                { id: 'delivery_paid', label: 'Paid Delivery' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setOrderType(tab.id as OrderType)}
                                    className={cn(
                                        "py-3 px-2 rounded-xl text-xs font-bold transition-all shadow-sm border",
                                        orderType === tab.id 
                                            ? "bg-white border-transparent text-foreground shadow-md transform scale-[1.02]" 
                                            : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Delivery Price Input */}
                        {orderType === 'delivery_paid' && (
                            <div className="bg-white rounded-xl p-3 shadow-sm border flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                                <span className="text-sm font-bold whitespace-nowrap">Delivery Price:</span>
                                <Input
                                    type="number"
                                    value={deliveryPrice}
                                    onChange={(e) => setDeliveryPrice(e.target.value)}
                                    className="h-10 text-lg font-bold"
                                    placeholder="0"
                                />
                                <span className="text-sm font-bold text-muted-foreground">TMT</span>
                            </div>
                        )}

                        {/* Payment Info */}
                        {orderType === 'local' ? (
                            <>
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <Button 
                                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                                        onClick={() => { 
                                            setPaymentMethod('cash'); 
                                            setPayment(''); 
                                        }}
                                        className={cn(
                                            "h-12 gap-2 text-base font-bold transition-all",
                                            paymentMethod === 'cash' ? "shadow-md scale-[1.02]" : "text-muted-foreground"
                                        )}
                                    >
                                        <Banknote className="h-5 w-5" /> Cash
                                    </Button>
                                    <Button 
                                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                                        onClick={() => { 
                                            setPaymentMethod('card'); 
                                            setPayment(finalTotal.toString()); 
                                        }}
                                        className={cn(
                                            "h-12 gap-2 text-base font-bold transition-all",
                                            paymentMethod === 'card' ? "shadow-md scale-[1.02]" : "text-muted-foreground"
                                        )}
                                    >
                                        <CreditCard className="h-5 w-5" /> Card
                                    </Button>
                                </div>

                                <div className="flex justify-between items-end px-2">
                                    <div>
                                        <div className="text-4xl font-bold tracking-tighter">{payment || '0'} <span className="text-lg text-muted-foreground">TMT</span></div>
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Received</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-lg font-bold transition-colors",
                                            change < 0 ? "text-destructive" : "text-emerald-600"
                                        )}>
                                            {change.toFixed(2)} TMT
                                        </div>
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Charge</div>
                                    </div>
                                </div>

                                {/* Numpad & Action */}
                                <div className="grid grid-cols-4 gap-3 h-64">
                                    <div className="col-span-3 h-full">
                                        {paymentMethod === 'card' ? (
                                            <div className="h-full w-full rounded-3xl bg-blue-50/50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center p-6 gap-4 animate-in fade-in zoom-in-95 duration-300">
                                                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                                                    <CreditCard className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-blue-900 text-lg">Card Payment</h3>
                                                    <p className="text-blue-600/80 text-sm font-medium">Process payment via terminal</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <Numpad
                                                onInput={handleInput}
                                                onDelete={handleDelete}
                                                disabled={isCreating}
                                                className="h-full"
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-1 h-full">
                                        {!isPaymentSufficient ? (
                                            <div className="h-full w-full rounded-2xl bg-destructive/10 border-2 border-destructive/20 flex flex-col items-center justify-center text-center p-1 gap-2 animate-pulse">
                                                <span className="text-destructive font-bold text-xs leading-tight">Not enough cash received</span>
                                                <span className="text-destructive font-black text-sm">({Math.abs(change).toFixed(0)} TMT)</span>
                                            </div>
                                        ) : (
                                            <Button
                                                className="h-full w-full rounded-2xl flex flex-col gap-1 items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-none border-0"
                                                onClick={handleCheckout}
                                                disabled={isCreating}
                                            >
                                                <span className="text-xs font-bold uppercase opacity-80">Checkout</span>
                                                <span className="text-sm font-black">({finalTotal.toFixed(2)} TMT)</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="mt-auto pt-4">
                                <Button
                                    className="w-full h-14 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                    onClick={handleCheckout}
                                    disabled={isCreating}
                                >
                                    Confirm Order ({finalTotal.toFixed(2)} TMT)
                                </Button>
                            </div>
                        )}
                    </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
