import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, TrendingUp, Barcode, DollarSign } from 'lucide-react';

interface ManagerProductDetailsDialogProps {
    product: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ManagerProductDetailsDialog = ({
    product,
    open,
    onOpenChange
}: ManagerProductDetailsDialogProps) => {
    if (!product) return null;

    const totalRevenue = product.count * product.sellPrice;
    const totalProfit = product.count * (product.sellPrice - product.buyPrice);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-visible bg-transparent border-none shadow-none">
                <div className="flex flex-col w-full bg-background rounded-3xl border shadow-lg p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 bg-black rounded-lg shrink-0" />
                        {product.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/30 p-4 rounded-2xl space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                            <TrendingUp className="w-3 h-3" />
                            Total Sold
                        </div>
                        <div className="text-2xl font-bold">{product.count} <span className="text-sm text-muted-foreground font-normal">pcs</span></div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-2xl space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                            <Package className="w-3 h-3" />
                            Current Stock
                        </div>
                        <div className="text-2xl font-bold">{product.stock} <span className="text-sm text-muted-foreground font-normal">pcs</span></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                            <span>Selling Price</span>
                        </div>
                        <span className="font-semibold">{product.sellPrice} TMT</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                            <span>Buying Price</span>
                        </div>
                        <span className="font-semibold">{product.buyPrice} TMT</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Barcode className="w-4 h-4" />
                            <span>Barcode</span>
                        </div>
                        <span className="font-mono text-sm">{product.barcode}</span>
                    </div>
                    
                    <div className="pt-4 grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                            <div className="text-lg font-bold text-blue-600">{totalRevenue} TMT</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">Total Profit</div>
                            <div className="text-lg font-bold text-green-600">+{totalProfit} TMT</div>
                        </div>
                    </div>
                </div>
            </div>
            </DialogContent>
        </Dialog>
    );
};
