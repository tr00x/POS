import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Volume2, RefreshCw, Search, Keyboard } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CashierSettingsProps {
    soundEnabled: boolean;
    setSoundEnabled: (val: boolean) => void;
    onFocusSearch: () => void;
    children?: React.ReactNode;
}

export const CashierSettingsDialog = ({ 
    soundEnabled, 
    setSoundEnabled, 
    onFocusSearch,
    children 
}: CashierSettingsProps) => {
    const queryClient = useQueryClient();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Products refreshed');
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-visible bg-transparent border-none shadow-none">
                <div className="flex flex-col w-full bg-background rounded-lg border shadow-lg p-6">
                    <DialogHeader>
                        <DialogTitle>Cashier Settings</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="sound-mode">Sound Effects</Label>
                        </div>
                        <Switch 
                            id="sound-mode" 
                            checked={soundEnabled}
                            onCheckedChange={setSoundEnabled}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            <Label>Refresh Data</Label>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            Refresh
                        </Button>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Label>Focus Search</Label>
                        </div>
                        <Button variant="outline" size="sm" onClick={onFocusSearch}>
                            Focus Input
                        </Button>
                    </div>

                    <div className="flex items-center justify-between space-x-2 opacity-50">
                        <div className="flex items-center space-x-2">
                            <Keyboard className="h-4 w-4 text-muted-foreground" />
                            <Label>Keyboard Shortcuts</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">Coming soon</span>
                    </div>
                </div>
            </div>
        </DialogContent>
        </Dialog>
    );
};
