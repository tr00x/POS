import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Trash2, Package, Search, ScanBarcode, ShoppingBag, X } from 'lucide-react';
import type { Product } from '@/types';
import type { CartItem } from './CashierLayout';
import { useScanDetection } from '@/hooks/useScanDetection';
import { useSound } from '@/hooks/useSound';
import { toast } from 'sonner';
import { BarcodeScannerDialog } from './BarcodeScannerDialog';
import { ProductCatalogDialog } from './ProductCatalogDialog';
import { CheckoutDialog } from './CheckoutDialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const QuantityInput = ({ 
    value, 
    onCommit 
}: { 
    value: number; 
    onCommit: (val: number) => void;
}) => {
    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const handleBlur = () => {
        const val = parseFloat(localValue);
        if (!isNaN(val) && val > 0) {
            onCommit(val);
            setLocalValue(val.toString());
        } else {
            setLocalValue(value.toString());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.currentTarget as HTMLInputElement).blur();
        }
    };

    return (
        <Input
            className="w-16 text-center font-black text-lg p-0 h-8 border-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            type="number"
            step="any"
        />
    );
};

interface ContextType {
    addToCart: (product: Product) => void;
    cart: CartItem[];
    updateQuantity: (id: string, delta: number) => void;
    removeFromCart: (id: string) => void;
    setCartItemQuantity: (id: string, qty: number) => void;
    addWithQuantity: (product: Product, quantity: number) => void;
    clearCart: () => void;
    soundEnabled: boolean;
    focusTrigger: number;
    getDiscountedPrice: (product: Product) => number;
}

export const ProductList = () => {
    const { products } = useProducts();
    const { 
        addToCart, 
        cart, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        soundEnabled, 
        focusTrigger,
        getDiscountedPrice,
        setCartItemQuantity
    } = useOutletContext<ContextType>();
    
    const [manualBarcode, setManualBarcode] = useState('');
    const { playSound } = useSound();
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);

    // Focus search when trigger changes or on mount
    useEffect(() => {
        searchInputRef.current?.focus();
    }, [focusTrigger]);

    const handleScan = useCallback((barcode: string) => {
        const product = products.find(p => p.barcode === barcode);
        if (product) {
            if (product.stock <= 0) {
                if (soundEnabled) playSound('error');
                toast.error(`Out of stock`, {
                    description: `${product.name} is currently out of stock`,
                    duration: 3000,
                });
                return;
            }

            addToCart(product);
            if (soundEnabled) playSound('beep');
            toast.success(`Added ${product.name}`, {
                description: `Barcode: ${barcode}`,
                duration: 2000,
            });
        } else {
            if (soundEnabled) playSound('error');
            toast.error(`Product not found`, {
                description: `Barcode: ${barcode}`,
                duration: 3000,
            });
        }
    }, [products, addToCart, soundEnabled, playSound]);

    useScanDetection({
        onScan: handleScan
    });

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualBarcode.trim()) return;
        handleScan(manualBarcode.trim());
        setManualBarcode('');
    };

    const total = cart.reduce((sum, item) => sum + (getDiscountedPrice(item) * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex flex-col h-full bg-background max-w-5xl mx-auto shadow-xl border-x">
            {/* Top Bar: Scan Focus */}
            <div className="p-4 sm:p-6 border-b bg-card space-y-4">
                <form onSubmit={handleManualSubmit} className="relative flex gap-3">
                    <div className="relative flex-1 group">
                        <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            ref={searchInputRef}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            placeholder="Scan barcode or type manually..." 
                            className="pl-12 h-14 text-lg bg-muted/50 border-2 focus-visible:ring-primary/20 transition-all"
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (manualBarcode.trim()) {
                                        handleScan(manualBarcode.trim());
                                        setManualBarcode('');
                                    }
                                }
                            }}
                        />
                    </div>
                    <Button 
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-14 w-14 shrink-0 rounded-xl border-2 hover:bg-primary/5 hover:border-primary/50"
                        onClick={() => setIsScannerOpen(true)}
                    >
                        <ScanBarcode className="h-6 w-6" />
                    </Button>
                </form>
            </div>

            {/* Main Content: Cart Items */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="px-6 py-4 border-b bg-muted/30 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        <h2 className="font-bold text-lg">Current Order</h2>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                            {totalItems} items
                        </span>
                    </div>
                    {cart.length > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearCart}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    )}
                </div>

                <ScrollArea className="flex-1">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 opacity-50">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ShoppingBag className="h-12 w-12" />
                            </div>
                            <p className="text-xl font-medium">Cart is empty</p>
                            <p className="text-sm mt-1 text-center">Scan a product or use manual search to start</p>
                            <Button 
                                variant="outline" 
                                className="mt-6 rounded-full px-6"
                                onClick={() => setIsCatalogOpen(true)}
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Browse Catalog
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {cart.map((item) => (
                                <div key={item.id} className="p-4 sm:p-6 flex items-center gap-4 group hover:bg-muted/30 transition-colors">
                                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-muted border overflow-hidden shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
                                                <Package className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="font-bold text-base sm:text-lg leading-tight truncate">{item.name}</h3>
                                                <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                                                    <ScanBarcode className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-mono">{item.barcode}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-lg sm:text-xl tabular-nums">
                                                    {(getDiscountedPrice(item) * item.quantity).toFixed(2)} TMT
                                                </p>
                                                {getDiscountedPrice(item) < item.sellPrice && (
                                                    <p className="text-xs text-muted-foreground line-through">
                                                        {(item.sellPrice * item.quantity).toFixed(2)} TMT
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {item.quantity} {item.unit} x {getDiscountedPrice(item).toFixed(2)} TMT
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center bg-background rounded-xl border-2 p-1 shadow-sm">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-lg"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <QuantityInput
                                                    value={item.quantity}
                                                    onCommit={(val) => setCartItemQuantity(item.id, val)}
                                                />
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-lg"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Bottom Bar: Summary & Checkout */}
            <div className="p-6 border-t bg-card shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-muted-foreground text-sm font-medium">Subtotal</p>
                        <p className="text-2xl font-black tabular-nums">{total.toFixed(2)} <span className="text-sm font-normal text-muted-foreground uppercase">TMT</span></p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="rounded-xl h-12 px-6 border-2 font-bold"
                        onClick={() => setIsCatalogOpen(true)}
                    >
                        <Search className="h-5 w-5 mr-2" />
                        Find Product
                    </Button>
                </div>

                <CheckoutDialog cart={cart} total={total} clearCart={clearCart} getDiscountedPrice={getDiscountedPrice}>
                    <Button 
                        className="w-full h-16 rounded-2xl text-xl font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                        disabled={cart.length === 0}
                    >
                        Complete Order
                    </Button>
                </CheckoutDialog>
            </div>

            {/* Modals */}
            <BarcodeScannerDialog 
                open={isScannerOpen} 
                onOpenChange={setIsScannerOpen}
                onScan={handleScan}
            />
            
            <ProductCatalogDialog 
                open={isCatalogOpen}
                onOpenChange={setIsCatalogOpen}
                onSelectProduct={addToCart}
                getDiscountedPrice={getDiscountedPrice}
            />
        </div>
    );
};
