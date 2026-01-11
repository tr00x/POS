import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useScanDetection } from '@/hooks/useScanDetection';
import { Input } from '@/components/ui/input';
import { Search, Package, Filter, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductDetailsDialog } from './ProductDetailsDialog';
import { ManageCategoriesDialog } from './ManageCategoriesDialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const InventoryList = () => {
    const { products, isLoading } = useProducts();
    const { categories } = useCategories();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    useScanDetection({
        onScan: (code) => setSearch(code),
        minLength: 3
    });

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
        const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (isLoading) return (
        <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
    );

    return (
        <div className="space-y-4 pb-20">
            {/* Search & Filter */}
            <div className="sticky top-0 z-20 bg-muted/20 backdrop-blur-sm pb-2 pt-1">
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search product here..."
                        className="pl-10 h-12 text-lg rounded-xl shadow-sm border-muted-foreground/20 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 text-sm text-muted-foreground font-medium px-1 items-center">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 w-auto gap-2 px-2 shadow-none focus:ring-0 ring-0 focus:ring-offset-0">
                            <div className="flex items-center gap-2">
                                <span className="text-foreground">
                                    {selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.name}
                                </span>
                                <Filter className="h-3 w-3" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <div className="w-px h-4 bg-border mx-1" />

                    <ManageCategoriesDialog />

                    <div className="ml-auto flex gap-1 bg-muted/50 p-1 rounded-lg">
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                    <Package className="h-16 w-16 mb-4" />
                    <p>No products found</p>
                </div>
            ) : (
                <div className={cn(
                    viewMode === 'grid' 
                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" 
                        : "flex flex-col gap-2"
                )}>
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => setSelectedProductId(product.id)}
                            className={cn(
                                "bg-card border border-border/50 hover:border-primary/50 transition-all cursor-pointer shadow-sm active:scale-[0.98] group relative overflow-hidden",
                                viewMode === 'grid' 
                                    ? "rounded-2xl flex flex-col" 
                                    : "rounded-xl p-3 flex gap-4 items-center"
                            )}
                        >
                            {/* Image */}
                            <div className={cn(
                                "bg-muted relative overflow-hidden shrink-0",
                                viewMode === 'grid' 
                                    ? "aspect-[2/1] w-full" 
                                    : "h-16 w-16 rounded-lg border"
                            )}>
                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className={cn(
                                            "w-full h-full object-cover",
                                            viewMode === 'grid' && "transition-transform group-hover:scale-105"
                                        )} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                        <Package className={viewMode === 'grid' ? "h-12 w-12" : "h-8 w-8"} />
                                    </div>
                                )}
                                
                                {viewMode === 'grid' && (
                                    <>
                                        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm border">
                                            {product.sellPrice} TMT
                                        </div>
                                        {product.stock <= 0 && (
                                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                                                <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">Out of Stock</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {viewMode === 'list' && product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-destructive shadow-sm" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className={cn(
                                "flex-1 min-w-0 flex flex-col gap-1",
                                viewMode === 'grid' ? "p-4" : "justify-center"
                            )}>
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className={cn("font-bold leading-tight", viewMode === 'grid' ? "line-clamp-2 text-base" : "truncate text-base")}>
                                        {product.name}
                                    </h3>
                                    {viewMode === 'list' && (
                                        <div className="font-bold text-sm shrink-0 bg-muted/50 px-2 py-0.5 rounded text-foreground/80">
                                            {product.sellPrice} TMT
                                        </div>
                                    )}
                                </div>
                                
                                <div className={cn(
                                    "flex items-center justify-between text-muted-foreground",
                                    viewMode === 'grid' ? "pt-2 border-t mt-auto" : "text-sm"
                                )}>
                                    <span className={cn("font-mono", viewMode === 'grid' ? "text-xs" : "text-xs")}>
                                        {viewMode === 'grid' ? (product.unitType === 'piece' ? 'Pcs' : 'Kg') : product.barcode}
                                    </span>
                                    
                                    <div className={cn(
                                        "flex items-center gap-1.5",
                                        product.stock <= 0 ? "text-destructive" : (viewMode === 'grid' ? "text-primary" : "text-foreground/70"),
                                        viewMode === 'grid' ? "font-bold" : "font-medium"
                                    )}>
                                        <Package className={viewMode === 'grid' ? "h-4 w-4" : "h-3.5 w-3.5"} />
                                        <span>{product.stock}{viewMode === 'list' && ` ${product.unit}`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ProductDetailsDialog 
                product={products.find(p => p.id === selectedProductId) || null} 
                open={!!selectedProductId} 
                onOpenChange={(open) => !open && setSelectedProductId(null)} 
            />
        </div>
    );
};
