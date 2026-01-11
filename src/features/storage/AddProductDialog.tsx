import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useScanDetection } from '@/hooks/useScanDetection';
import { ImageInput } from '@/components/ImageInput';
import { Plus, ScanBarcode, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BarcodeScannerDialog } from '../cashier/BarcodeScannerDialog';

export function AddProductDialog() {
    const { addProduct } = useProducts();
    const { categories } = useCategories();
    const [open, setOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        categoryId: 'general',
        stock: '',
        buyPrice: '',
        sellPrice: '',
        unit: 'pcs',
        unitType: 'piece',
        image: ''
    });

    // Listen for scans only when dialog is open
    useScanDetection({
        onScan: (code) => {
            if (open) {
                setFormData(prev => ({ ...prev, barcode: code }));
            }
        },
        minLength: 3
    });

    const handleBarcodeScanned = (code: string) => {
        setFormData(prev => ({ ...prev, barcode: code }));
        setScannerOpen(false);
        toast.warning('Barcode scanned. Please verify it matches the product.', {
            duration: 5000,
            icon: <AlertCircle className="h-5 w-5 text-yellow-500" />
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addProduct({
                name: formData.name,
                barcode: formData.barcode,
                categoryId: formData.categoryId,
                stock: Number(formData.stock),
                buyPrice: Number(formData.buyPrice),
                sellPrice: Number(formData.sellPrice),
                unit: formData.unit,
                unitType: formData.unitType as any,
                image: formData.image || undefined
            });
            toast.success('Product added successfully');
            setOpen(false);
            setFormData({
                name: '',
                barcode: '',
                categoryId: 'general',
                stock: '',
                buyPrice: '',
                sellPrice: '',
                unit: 'pcs',
                unitType: 'piece',
                image: ''
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 overflow-visible bg-transparent border-none shadow-none">
                <div className="flex flex-col w-full bg-background rounded-lg border shadow-lg overflow-hidden max-h-[90vh]">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new product to add to inventory.
                    </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto p-6 pt-2">
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-6 md:grid-cols-[1fr_250px]">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Product Name"
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="barcode"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleChange}
                                        required
                                        placeholder="Scan or type..."
                                        className="font-mono"
                                    />
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => setScannerOpen(true)}
                                        title="Scan with Camera"
                                        className="shrink-0"
                                    >
                                        <ScanBarcode className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select 
                                    value={formData.categoryId} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                                >
                                    <SelectTrigger>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="unit">Unit (e.g. kg)</Label>
                                    <Input
                                        id="unit"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Image</Label>
                            <div className="border rounded-xl p-2 bg-muted/20">
                                <ImageInput 
                                    value={formData.image}
                                    onChange={(val) => setFormData(prev => ({ ...prev, image: val }))}
                                    label=""
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="buyPrice">Buy Price</Label>
                            <Input
                                id="buyPrice"
                                name="buyPrice"
                                type="number"
                                step="0.01"
                                value={formData.buyPrice}
                                onChange={handleChange}
                                required
                                className="text-lg font-medium"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sellPrice">Sell Price</Label>
                            <Input
                                id="sellPrice"
                                name="sellPrice"
                                type="number"
                                step="0.01"
                                value={formData.sellPrice}
                                onChange={handleChange}
                                required
                                className="text-lg font-bold"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} size="lg" className="w-full">
                            {loading ? 'Saving...' : 'Save Product'}
                        </Button>
                    </DialogFooter>
                </form>
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
}