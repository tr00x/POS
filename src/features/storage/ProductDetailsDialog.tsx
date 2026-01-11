import { Button } from '@/components/ui/button';
import { Trash2, Package, Copy, Edit2, ScanBarcode, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BarcodeScannerDialog } from '../cashier/BarcodeScannerDialog';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useScanDetection } from '@/hooks/useScanDetection';
import { useCategories } from '@/hooks/useCategories';
import { ImageInput } from '@/components/ImageInput';
import type { Product } from '@/types';

interface ProductDetailsDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultEditing?: boolean;
}

export const ProductDetailsDialog = ({ product, open, onOpenChange, defaultEditing = false }: ProductDetailsDialogProps) => {
    const queryClient = useQueryClient();
    const { categories } = useCategories();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(defaultEditing);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        categoryId: '',
        stock: '',
        buyPrice: '',
        sellPrice: '',
        unit: '',
        unitType: '',
        image: ''
    });

    useEffect(() => {
        if (open) {
            setIsEditing(defaultEditing);
            if (product) {
                setFormData({
                    name: product.name,
                    barcode: product.barcode,
                    categoryId: product.categoryId,
                    stock: product.stock.toString(),
                    buyPrice: product.buyPrice.toString(),
                    sellPrice: product.sellPrice.toString(),
                    unit: product.unit,
                    unitType: product.unitType,
                    image: product.image || ''
                });
            } else {
                setFormData({
                    name: '',
                    barcode: '',
                    categoryId: '',
                    stock: '',
                    buyPrice: '',
                    sellPrice: '',
                    unit: '',
                    unitType: 'piece',
                    image: ''
                });
            }
        } else {
            setIsEditing(false);
        }
    }, [open, defaultEditing, product]);

    // Listen for scans only when dialog is open and in edit mode
    useScanDetection({
        onScan: (code) => {
            if (open && isEditing) {
                setFormData(prev => ({ ...prev, barcode: code }));
            }
        },
        minLength: 3
    });

    const createMutation = useMutation({
        mutationFn: async (newProduct: any) => {
            const { data } = await api.post<Product>('/products', newProduct);
            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product created successfully');
            onOpenChange(false);
        },
        onError: () => {
            toast.error('Failed to create product');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedProduct: any) => {
            if (!product) return;
            const { data } = await api.put<Product>(`/products/${product.id}`, updatedProduct);
            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product updated successfully');
            setIsEditing(false);
        },
        onError: () => {
            toast.error('Failed to update product');
        }
    });

    if (!product && !defaultEditing) return null;

    const handleBarcodeScanned = (code: string) => {
        setFormData(prev => ({ ...prev, barcode: code }));
        setScannerOpen(false);
        toast.warning('Barcode scanned. Please verify it matches the product.', {
            duration: 5000,
            icon: <AlertCircle className="h-5 w-5 text-yellow-500" />
        });
    };

    const handleDelete = async () => {
        if (!product) return;
        setIsDeleting(true);
        try {
            await api.delete(`/products/${product.id}`);
            await queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully');
            setDeleteDialogOpen(false);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete product');
            setIsDeleting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const productData = {
                name: formData.name,
                barcode: formData.barcode,
                categoryId: formData.categoryId,
                stock: Number(formData.stock),
                buyPrice: Number(formData.buyPrice),
                sellPrice: Number(formData.sellPrice),
                unit: formData.unit,
                unitType: formData.unitType as any,
                image: formData.image || undefined
            };

            if (product) {
                await updateMutation.mutateAsync(productData);
            } else {
                await createMutation.mutateAsync(productData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] w-full max-h-[90vh] p-0 overflow-visible bg-transparent border-none shadow-none">
                <div className="flex flex-col w-full h-full bg-background rounded-lg border shadow-lg overflow-hidden max-h-[90vh]">
                {/* Header / Top Section */}
                <div className="bg-muted/30 p-6 border-b border-border/50 shrink-0">
                    <div className="flex gap-4 mb-2">
                        <div className="h-20 w-20 bg-background rounded-xl flex items-center justify-center shrink-0 shadow-sm border overflow-hidden">
                            {isEditing ? (
                                formData.image ? (
                                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-10 w-10 rounded bg-foreground/10" />
                                )
                            ) : (
                                product?.image ? (
                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-10 w-10 rounded bg-foreground/10" />
                                )
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            {isEditing ? (
                                <>
                                    <div className="sr-only">
                                        <DialogTitle>Edit Product</DialogTitle>
                                    </div>
                                    <Input 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="font-bold text-lg h-9"
                                        placeholder="Product Name"
                                    />
                                </>
                            ) : product ? (
                                <>
                                    <DialogTitle className="text-xl font-bold leading-tight mb-1">{product.name}</DialogTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {categories.find(c => c.id === product.categoryId)?.name || product.categoryId}
                                    </p>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isEditing ? (
                        <form id="edit-form" onSubmit={handleSave} className="space-y-5">
                            <div className="grid gap-6 md:grid-cols-[1fr_250px]">
                                <div className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-barcode">Barcode</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="edit-barcode" 
                                                name="barcode" 
                                                value={formData.barcode} 
                                                onChange={handleChange} 
                                                required 
                                                className="h-11 rounded-xl font-mono text-sm" 
                                                placeholder="Scan or type barcode"
                                            />
                                            <Button 
                                                type="button"
                                                variant="outline" 
                                                size="icon"
                                                className="h-11 w-11 shrink-0 rounded-xl"
                                                onClick={() => setScannerOpen(true)}
                                                title="Scan with Camera"
                                            >
                                                <ScanBarcode className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Select 
                                            value={formData.categoryId} 
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-unitType">Measure</Label>
                                            <select
                                                id="edit-unitType"
                                                name="unitType"
                                                value={formData.unitType}
                                                onChange={handleChange}
                                                className="h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                <option value="piece">Pieces</option>
                                                <option value="weight">Weight (Kg)</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-unit">Unit Label</Label>
                                            <Input 
                                                id="edit-unit" 
                                                name="unit" 
                                                value={formData.unit} 
                                                onChange={handleChange} 
                                                placeholder="e.g. pcs, kg" 
                                                className="h-11 rounded-xl" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-stock">Current Stock</Label>
                                        <Input 
                                            id="edit-stock" 
                                            name="stock" 
                                            type="number" 
                                            value={formData.stock} 
                                            onChange={handleChange} 
                                            required 
                                            className="h-11 rounded-xl text-lg font-bold" 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-buyPrice">Buying Price</Label>
                                            <Input 
                                                id="edit-buyPrice" 
                                                name="buyPrice" 
                                                type="number" 
                                                step="0.01" 
                                                value={formData.buyPrice} 
                                                onChange={handleChange} 
                                                required 
                                                className="h-11 rounded-xl" 
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-sellPrice">Selling Price</Label>
                                            <Input 
                                                id="edit-sellPrice" 
                                                name="sellPrice" 
                                                type="number" 
                                                step="0.01" 
                                                value={formData.sellPrice} 
                                                onChange={handleChange} 
                                                required 
                                                className="h-11 rounded-xl" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Product Image</Label>
                                    <div className="border rounded-xl p-2 bg-muted/20">
                                        <ImageInput 
                                            value={formData.image}
                                            onChange={(val) => setFormData(prev => ({ ...prev, image: val }))}
                                            label=""
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : product ? (
                        <>
                            {/* Barcode */}
                            <div className="bg-muted/30 p-3 rounded-xl flex items-center justify-between border border-dashed border-border">
                                <div className="font-mono text-lg tracking-wider">{product.barcode}</div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        navigator.clipboard.writeText(product.barcode);
                                        toast.success("Barcode copied to clipboard");
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
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

                            <div className="space-y-1">
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
                        </>
                    ) : null}

                </div>
                
                {/* Fixed Footer */}
                <div className="p-6 border-t bg-background shrink-0">
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <Button 
                                    variant="outline" 
                                    className="flex-1 h-12 rounded-xl"
                                    onClick={() => {
                                        if (!product) onOpenChange(false);
                                        else setIsEditing(false);
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    className="flex-[2] h-12 rounded-xl font-bold"
                                    type="submit"
                                    form="edit-form"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (product ? 'Save Changes' : 'Create Product')}
                                </Button>
                            </>
                        ) : product ? (
                            <>
                                <Button 
                                    className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit Product
                                </Button>

                                <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
                                    setDeleteDialogOpen(open);
                                    if (!open) setIsDeleting(false);
                                }}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="flex-1 gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 h-11 rounded-xl">
                                            <Trash2 className="h-4 w-4" />
                                            Delete
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
                            </>
                        ) : null}
                </div>
                </div>
                </div>
            </DialogContent>
            
            <BarcodeScannerDialog 
                open={scannerOpen} 
                onOpenChange={setScannerOpen} 
                onScan={handleBarcodeScanned} 
            />
        </Dialog>
    );
};
