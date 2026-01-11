import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, LogOut } from 'lucide-react';
import { CashierSettingsDialog } from './CashierSettingsDialog';
import { toast } from 'sonner';
import { usePromotions } from '@/hooks/usePromotions';
import { useAuth } from '@/context/AuthContext';

export interface CartItem extends Product {
    quantity: number;
}

export const CashierLayout = () => {
    const { user, logout } = useAuth();
    const { promotions } = usePromotions();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [focusTrigger, setFocusTrigger] = useState(0);

    const getDiscountedPrice = useCallback((product: Product) => {
        const activePromotions = promotions.filter(p => 
            p.products?.some(prod => prod.id === product.id) &&
            new Date() >= new Date(p.startDate) &&
            new Date() <= new Date(p.endDate)
        );
    
        if (activePromotions.length === 0) return product.sellPrice;
    
        let bestPrice = product.sellPrice;
        
        activePromotions.forEach(promo => {
            let price = product.sellPrice;
            if (promo.type === 'percentage') {
                price = price * (1 - promo.value / 100);
            } else {
                price = Math.max(0, price - promo.value);
            }
            if (price < bestPrice) bestPrice = price;
        });
    
        return Number(bestPrice.toFixed(2));
    }, [promotions]);

    const onFocusSearch = useCallback(() => {
        setFocusTrigger(prev => prev + 1);
    }, []);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast.error(`"${product.name}" is out of stock`);
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast.error(`Max stock reached for "${product.name}"`);
                    return prev;
                }
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) => {
            return prev.map((item) => {
                if (item.id === productId) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return item;
                    
                    if (delta > 0 && newQty > item.stock) {
                        toast.error(`Max stock reached for "${item.name}"`);
                        return item;
                    }

                    return { ...item, quantity: newQty };
                }
                return item;
            });
        });
    };

    const setCartItemQuantity = (productId: string, quantity: number) => {
        setCart((prev) => {
            return prev.map((item) => {
                if (item.id === productId) {
                    if (quantity > item.stock) {
                         toast.error(`Max stock reached for "${item.name}"`);
                         return { ...item, quantity: item.stock };
                    }
                    return { ...item, quantity };
                }
                return item;
            });
        });
    };

    const addWithQuantity = (product: Product, quantity: number) => {
        if (product.stock <= 0) {
             toast.error(`"${product.name}" is out of stock`);
             return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            const currentQty = existing ? existing.quantity : 0;
            
            if (currentQty + quantity > product.stock) {
                 toast.error(`Not enough stock for "${product.name}"`);
                 return prev;
            }

            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const clearCart = () => setCart([]);

    return (
        <div className="flex flex-col h-[100dvh] bg-muted/20">
            {/* Header */}
            <header className="h-14 md:h-16 bg-background border-b flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold leading-none">{user?.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 mt-1 w-fit border-primary/20 text-primary">{user?.role}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                    <div className="flex-1"></div>
                    <CashierSettingsDialog 
                        soundEnabled={soundEnabled} 
                        setSoundEnabled={setSoundEnabled}
                        onFocusSearch={onFocusSearch}
                    >
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </CashierSettingsDialog>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet context={{ addToCart, cart, updateQuantity, removeFromCart, setCartItemQuantity, addWithQuantity, clearCart, soundEnabled, focusTrigger, getDiscountedPrice }} />
            </main>
        </div>
    );
};
