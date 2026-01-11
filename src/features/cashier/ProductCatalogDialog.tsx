import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Tag, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

interface ProductCatalogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectProduct: (product: Product) => void;
    getDiscountedPrice?: (product: Product) => number;
}

export const ProductCatalogDialog = ({ open, onOpenChange, onSelectProduct, getDiscountedPrice }: ProductCatalogDialogProps) => {
    const { products } = useProducts();
    const { categories } = useCategories();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 300);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
        const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl w-full h-[80vh] p-0 overflow-visible bg-transparent border-none shadow-none">
                <div className="flex flex-col w-full h-full bg-background rounded-xl overflow-hidden shadow-lg border">
                    <DialogHeader className="px-6 py-4 border-b space-y-4">
                    <DialogTitle>Product Catalog</DialogTitle>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or barcode..." 
                            className="pl-9 bg-muted/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative border-b pb-2">
                        <div 
                            ref={scrollContainerRef}
                            onScroll={checkScroll}
                            className="w-full overflow-x-auto px-4 scrollbar-hide mask-fade"
                        >
                            <style>{`
                                .scrollbar-hide::-webkit-scrollbar {
                                    display: none;
                                }
                                .scrollbar-hide {
                                    -ms-overflow-style: none;
                                    scrollbar-width: none;
                                }
                                .mask-fade {
                                    mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent);
                                }
                            `}</style>
                            <div className="flex gap-2 min-w-max items-center">
                                <div className={cn("sticky left-0 z-20 transition-opacity duration-200", showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none")}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm shadow-md border hover:bg-background"
                                        onClick={() => scroll('left')}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Button 
                                    variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                                    className={cn(
                                        "rounded-md px-4 h-8 flex items-center gap-2 transition-all border shrink-0",
                                        selectedCategory === 'all' 
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                            : "hover:border-primary/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground bg-background"
                                    )}
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    <Package className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">All</span>
                                </Button>
                                {categories.map(c => (
                                    <Button
                                        key={c.id}
                                        variant={selectedCategory === c.id ? 'default' : 'outline'}
                                        className={cn(
                                            "rounded-md px-4 h-8 flex items-center gap-2 transition-all border shrink-0",
                                            selectedCategory === c.id 
                                                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                                : "hover:border-primary/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground bg-background"
                                        )}
                                        onClick={() => setSelectedCategory(c.id)}
                                    >
                                        <span className="text-xs font-medium whitespace-nowrap">
                                            {c.name}
                                        </span>
                                    </Button>
                                ))}

                                <div className={cn("sticky right-0 z-20 transition-opacity duration-200", showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none")}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm shadow-md border hover:bg-background"
                                        onClick={() => scroll('right')}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                
                <ScrollArea className="flex-1">
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => {
                            const isOutOfStock = product.stock <= 0;
                            const currentPrice = getDiscountedPrice ? getDiscountedPrice(product) : product.sellPrice;
                            const hasDiscount = getDiscountedPrice && currentPrice < product.sellPrice;
                            const discountPercent = hasDiscount ? Math.round((1 - currentPrice / product.sellPrice) * 100) : 0;

                            return (
                                <div 
                                    key={product.id} 
                                    className={cn(
                                        "bg-card border rounded-xl p-3 flex flex-col gap-3 transition-colors relative overflow-hidden shadow-sm",
                                        isOutOfStock 
                                            ? "opacity-60 cursor-not-allowed bg-muted/30" 
                                            : "hover:border-primary/50 cursor-pointer group"
                                    )}
                                    onClick={() => {
                                        if (isOutOfStock) return;
                                        onSelectProduct(product);
                                        onOpenChange(false);
                                    }}
                                >
                                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-4xl text-muted-foreground/20 font-bold select-none">
                                                {product.name.charAt(0)}
                                            </div>
                                        )}
                                        
                                        {hasDiscount && !isOutOfStock && (
                                            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
                                                -{discountPercent}%
                                            </div>
                                        )}

                                        {!isOutOfStock && (
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Plus className="h-8 w-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <h3 className="font-medium text-sm leading-tight line-clamp-3 mb-2" title={product.name}>{product.name}</h3>
                                        
                                        <div className="mt-auto flex items-end justify-between">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-muted-foreground/70" />
                                                <div className="flex flex-col">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-xs text-muted-foreground line-through decoration-red-400/50 decoration-1">{product.sellPrice} TMT</span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-lg font-bold text-red-600">
                                                                    {currentPrice}
                                                                </span>
                                                                <span className="text-xs text-red-600 font-medium">TMT</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-lg font-bold">
                                                                {currentPrice}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">TMT</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex items-center justify-end text-xs text-muted-foreground border-t pt-2 gap-1.5">
                                            <Package className="h-3.5 w-3.5 text-muted-foreground/70" />
                                            <span className={isOutOfStock ? "text-destructive font-medium" : "text-green-600 font-medium"}>
                                                {isOutOfStock ? "Out of Stock" : `${product.stock} ${product.unit}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                No products found
                            </div>
                        )}
                    </div>
                </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
