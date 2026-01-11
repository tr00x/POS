import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { usePromotions } from '@/hooks/usePromotions';
import { useCategories } from '@/hooks/useCategories';
import { useScanDetection } from '@/hooks/useScanDetection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Filter, Tag, Package, Trash2, Edit2, Calendar, LayoutGrid, List } from 'lucide-react';
import { ProductDetailsDialog } from '@/features/storage/ProductDetailsDialog';
import { PromotionDialog } from './PromotionDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Promotion } from '@/types';

export const InventoryScreen = () => {
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div className="container mx-auto max-w-7xl p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Manage products, stock levels, and promotional campaigns</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="products" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Package className="mr-2 h-4 w-4" />
                        Products & Stock
                    </TabsTrigger>
                    <TabsTrigger value="promotions" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Tag className="mr-2 h-4 w-4" />
                        Promotions & Discounts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                    <ProductsManager />
                </TabsContent>

                <TabsContent value="promotions" className="space-y-4">
                    <PromotionsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const ProductsManager = () => {
    const { products, isLoading } = useProducts();
    const { categories } = useCategories();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<any>(null); // Using any to avoid type complexity with Product vs null
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useScanDetection({
        onScan: (code) => setSearch(code),
        minLength: 3
    });

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
        const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCreate = () => {
        setSelectedProduct(null);
        setIsCreating(true);
        setIsDetailsOpen(true);
    };

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setIsCreating(false);
        setIsDetailsOpen(true);
    };

    if (isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-[400px] w-full" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or barcode..."
                        className="pl-9 bg-background/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto items-center">
                    <div className="flex items-center border rounded-lg p-1 bg-muted/20">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Category" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <Card 
                            key={product.id} 
                            className="cursor-pointer hover:shadow-md transition-all border-muted/60 overflow-hidden group"
                            onClick={() => handleEdit(product)}
                        >
                            <CardContent className="p-0">
                                <div className="aspect-video w-full bg-muted/20 relative">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <Package className="h-12 w-12 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {product.stock <= 5 && (
                                        <Badge variant="destructive" className="absolute bottom-2 left-2 shadow-sm">
                                            Low Stock: {product.stock}
                                        </Badge>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold line-clamp-1" title={product.name}>{product.name}</h3>
                                            <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>
                                        </div>
                                        <Badge variant="outline" className="shrink-0">
                                            {categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Stock: </span>
                                            <span className={product.stock > 0 ? "font-medium" : "text-destructive font-medium"}>
                                                {product.stock} {product.unit}
                                            </span>
                                        </div>
                                        <div className="font-bold text-lg text-primary">
                                        {product.sellPrice.toFixed(2)} TMT
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(product)}>
                                <TableCell>
                                    <div className="h-10 w-10 rounded-lg bg-muted/20 overflow-hidden">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <Package className="h-5 w-5 opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{product.barcode}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal">
                                        {categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className={product.stock <= 5 ? "text-destructive font-medium" : ""}>
                                        {product.stock} {product.unit}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {product.sellPrice.toFixed(2)} TMT
                                </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <ProductDetailsDialog
                product={selectedProduct}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                defaultEditing={isCreating}
            />
        </div>
    );
};

const PromotionsManager = () => {
    const { promotions, isLoading, deletePromotion } = usePromotions();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const handleCreate = () => {
        setSelectedPromotion(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (promotion: Promotion) => {
        setSelectedPromotion(promotion);
        setIsDialogOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this promotion?')) {
            try {
                await deletePromotion(id);
                toast.success('Promotion deleted');
            } catch (error) {
                toast.error('Failed to delete promotion');
            }
        }
    };

    const filteredPromotions = promotions.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const isActive = new Date() >= new Date(p.startDate) && new Date() <= new Date(p.endDate);
        const matchesFilter = filter === 'all' 
            ? true 
            : filter === 'active' ? isActive : !isActive;
        return matchesSearch && matchesFilter;
    });

    if (isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-[200px] w-full" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold">Promotions</h2>
                    <p className="text-sm text-muted-foreground">Manage discounts and special offers</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-[200px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search promotions..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                        <SelectTrigger className="w-full sm:w-[130px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPromotions.map(promo => {
                    const isActive = new Date() >= new Date(promo.startDate) && new Date() <= new Date(promo.endDate);
                    return (
                        <Card 
                            key={promo.id} 
                            className="cursor-pointer hover:shadow-md transition-all border-muted/60 group"
                            onClick={() => handleEdit(promo)}
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">{promo.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {format(new Date(promo.startDate), 'MMM d')} - {format(new Date(promo.endDate), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant={isActive ? "default" : "secondary"}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-primary">
                                            {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value} TMT`}
                                        </span>
                                        <span className="text-sm text-muted-foreground font-medium">OFF</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => handleDelete(e, promo.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Applied to products</span>
                                    <span className="font-medium bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground text-xs">
                                        {promo.products?.length || 0} items
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {filteredPromotions.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border-dashed border-2">
                        <Tag className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="font-semibold text-lg">No promotions found</h3>
                        <p className="mb-4">Try adjusting your search or filters</p>
                        <Button variant="outline" onClick={() => {setSearch(''); setFilter('all');}}>Clear Filters</Button>
                    </div>
                )}
            </div>

            <PromotionDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen} 
                promotion={selectedPromotion}
            />
        </div>
    );
};
