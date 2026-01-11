import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2, Package, Copy, Edit2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProductDetailsDialog } from './ProductDetailsDialog';

export const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products, isLoading } = useProducts();
    const { categories } = useCategories();
    const queryClient = useQueryClient();
    const product = products.find(p => p.id === id);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    if (isLoading) return <div className="p-4"><Skeleton className="h-48 w-full rounded-xl" /></div>;
    if (!product) return <div className="p-4">Product not found</div>;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/products/${product.id}`);
            await queryClient.invalidateQueries({ queryKey: ['products'] });
            setDeleteDialogOpen(false);
            navigate('/storage');
        } catch (error) {
            console.error(error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => navigate('/storage')}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted" onClick={() => setEditDialogOpen(true)}>
                        <Edit2 className="h-5 w-5" />
                    </Button>

                    <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
                        setDeleteDialogOpen(open);
                        if (!open) setIsDeleting(false);
                    }}>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[320px] rounded-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{product.name}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col gap-2 space-y-0">
                                <AlertDialogAction 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete();
                                    }} 
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl h-12"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                                <AlertDialogCancel className="rounded-xl h-12 border-0 bg-muted/50 hover:bg-muted text-foreground mt-0">Cancel</AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
                <div className="flex gap-4 mb-6">
                    <div className="h-24 w-24 bg-muted rounded-xl flex items-center justify-center shrink-0">
                        {/* Placeholder Image */}
                        <div className="h-12 w-12 rounded bg-foreground/10" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight mb-1">{product.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {categories.find(c => c.id === product.categoryId)?.name || product.categoryId}
                        </p>
                    </div>
                </div>

                {/* Barcode */}
                <div className="bg-muted/30 p-3 rounded-xl flex items-center justify-between mb-6 border border-dashed border-border">
                    <div className="font-mono text-lg tracking-wider">{product.barcode}</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>

                {/* Grid Inputs Readonly Style */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium uppercase">Measure</label>
                        <div className="bg-muted/30 px-3 py-2 rounded-lg text-sm font-medium border border-border/50">
                            {product.unitType === 'piece' ? 'Quantity' : 'Weight'}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium uppercase">Unit</label>
                        <div className="bg-muted/30 px-3 py-2 rounded-lg text-sm font-medium border border-border/50">
                            {product.unit}
                        </div>
                    </div>
                </div>

                <div className="space-y-1 mb-4">
                    <label className="text-xs text-muted-foreground font-medium uppercase">Units In Stock</label>
                    <div className="bg-muted/30 px-3 py-2 rounded-lg text-sm font-bold border border-border/50 flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        {product.stock}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium uppercase">Buying Price</label>
                        <div className="bg-muted/30 px-3 py-2 rounded-lg text-sm font-medium border border-border/50">
                            {product.buyPrice} TMT
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium uppercase">Selling Price</label>
                        <div className="bg-primary/10 px-3 py-2 rounded-lg text-sm font-bold text-primary border border-primary/20">
                            {product.sellPrice} TMT
                        </div>
                    </div>
                </div>

            </div>

            <ProductDetailsDialog 
                product={product} 
                open={editDialogOpen} 
                onOpenChange={setEditDialogOpen}
                defaultEditing={true}
            />
        </div>
    );
};
