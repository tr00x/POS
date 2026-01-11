import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';
import type { Product } from '@/types';

interface ProductDetailsDialogProps {
    product: Product | null;
    initialQuantity: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (quantity: number) => void;
}

export const ProductDetailsDialog = ({
    product,
    initialQuantity,
    open,
    onOpenChange,
    onConfirm
}: ProductDetailsDialogProps) => {
    const [value, setValue] = useState(initialQuantity.toString());

    useEffect(() => {
        if (open) {
            setValue(initialQuantity > 0 ? initialQuantity.toString() : '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!product) return null;

    const handleInput = (key: string) => {
        setValue(prev => {
            if (key === '.' && prev.includes('.')) return prev;
            if (prev === '0' && key !== '.') return key;
            return prev + key;
        });
    };

    const handleDelete = () => {
        setValue(prev => prev.slice(0, -1));
    };

    const handleConfirm = () => {
        const qty = parseFloat(value);
        if (!isNaN(qty) && qty > 0) {
            onConfirm(qty);
            onOpenChange(false);
        }
    };

    const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm p-0 overflow-visible bg-transparent border-none shadow-none">
                <div className="flex flex-col w-full h-full p-6 gap-6 bg-background rounded-3xl overflow-hidden shadow-lg border">
                    <div className="sr-only">
                    <DialogTitle>{product.name}</DialogTitle>
                </div>
                
                {/* Header Info */}
                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 bg-black rounded-xl shrink-0" />
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                        <div className="text-red-500 font-bold mt-1">
                            {product.sellPrice} TMT <span className="text-muted-foreground text-xs font-normal line-through ml-1">14 TMT</span>
                        </div>
                    </div>
                </div>

                {/* Input Display */}
                <div className="bg-muted/30 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-border/10 pb-2">
                        <span className="text-3xl font-bold">{value || '0'}</span>
                        <span className="text-muted-foreground font-medium uppercase">{product.unit || 'pcs'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{Number(value || 0) * product.sellPrice}</span>
                        <span className="text-muted-foreground text-sm">TMT</span>
                    </div>
                </div>

                {/* Numpad Grid */}
                <div className="grid grid-cols-4 gap-3 h-64">
                    <div className="col-span-3 grid grid-cols-3 gap-3">
                        {keys.map((key) => (
                            <Button
                                key={key}
                                variant="ghost"
                                className="h-full text-2xl font-bold bg-muted/20 hover:bg-muted/40 rounded-xl"
                                onClick={() => handleInput(key)}
                            >
                                {key === '.' ? ',' : key}
                            </Button>
                        ))}
                        <Button
                            variant="ghost"
                            className="h-full bg-muted/20 hover:bg-muted/40 rounded-xl"
                            onClick={handleDelete}
                        >
                            <Delete className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Right Action Column */}
                    <div className="col-span-1 flex flex-col gap-3">
                        <Button
                            className="flex-1 rounded-xl text-lg font-bold bg-blue-100 text-blue-600 hover:bg-blue-200"
                            onClick={handleConfirm}
                        >
                            Confirm
                        </Button>
                        <Button
                            variant="destructive"
                            className="h-20 rounded-xl bg-red-100 text-red-600 hover:bg-red-200"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
