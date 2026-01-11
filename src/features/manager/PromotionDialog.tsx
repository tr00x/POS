import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Check } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Promotion } from '@/types';
import { cn } from '@/lib/utils';

interface PromotionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    promotion?: Promotion | null;
}

export const PromotionDialog = ({ open, onOpenChange, promotion }: PromotionDialogProps) => {
    const { products } = useProducts();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: '',
        startDate: '',
        endDate: '',
        productIds: [] as string[]
    });

    useEffect(() => {
        if (promotion) {
            setFormData({
                name: promotion.name,
                type: promotion.type,
                value: promotion.value.toString(),
                startDate: new Date(promotion.startDate).toISOString().slice(0, 16),
                endDate: new Date(promotion.endDate).toISOString().slice(0, 16),
                productIds: promotion.products?.map(p => p.id) || []
            });
        } else {
            setFormData({
                name: '',
                type: 'percentage',
                value: '',
                startDate: new Date().toISOString().slice(0, 16),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                productIds: []
            });
        }
    }, [promotion, open]);

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.barcode.includes(search)
    );

    const toggleProduct = (productId: string) => {
        setFormData(prev => {
            const exists = prev.productIds.includes(productId);
            if (exists) {
                return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
            } else {
                return { ...prev, productIds: [...prev.productIds, productId] };
            }
        });
    };

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/promotions', {
                ...data,
                value: parseFloat(data.value)
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Promotion created successfully');
            onOpenChange(false);
        },
        onError: () => toast.error('Failed to create promotion')
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.put(`/promotions/${promotion?.id}`, {
                ...data,
                value: parseFloat(data.value)
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Promotion updated successfully');
            onOpenChange(false);
        },
        onError: () => toast.error('Failed to update promotion')
    });

    const handleSubmit = () => {
        if (!formData.name || !formData.value || !formData.startDate || !formData.endDate) {
            toast.error('Please fill in all fields');
            return;
        }

        const data = {
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString()
        };

        if (promotion) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] p-0 overflow-visible bg-transparent border-none shadow-none">
                <div className="flex flex-col w-full h-full bg-background rounded-lg border shadow-lg overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>{promotion ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input 
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Summer Sale"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(val: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, type: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount (TMT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Input 
                                type="number"
                                value={formData.value}
                                onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
                                placeholder={formData.type === 'percentage' ? '10' : '5.00'}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input 
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input 
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Select Products ({formData.productIds.length} selected)</Label>
                        <div className="border rounded-xl overflow-hidden bg-card">
                            <div className="p-2 border-b bg-muted/30">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9 h-9 border-none bg-background shadow-none"
                                        placeholder="Search products..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ScrollArea className="h-[200px]">
                                <div className="p-1 space-y-1">
                                    {filteredProducts.map(product => {
                                        const isSelected = formData.productIds.includes(product.id);
                                        return (
                                            <div
                                                key={product.id}
                                                className={cn(
                                                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm",
                                                    isSelected ? "bg-primary/10 text-primary hover:bg-primary/15" : "hover:bg-muted"
                                                )}
                                                onClick={() => toggleProduct(product.id)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{product.name}</span>
                                                    <span className="text-xs text-muted-foreground">{product.barcode}</span>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-muted/10">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                        {promotion ? 'Save Changes' : 'Create Promotion'}
                    </Button>
                </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
