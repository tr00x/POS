import { Outlet } from 'react-router-dom';
import { Package, LogOut } from 'lucide-react';
import { AddProductDialog } from './AddProductDialog';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const StorageLayout = () => {
    const { user, logout } = useAuth();
    return (
        <div className="flex flex-col h-screen bg-muted/20">
            {/* Header */}
            <header className="h-16 bg-background border-b flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
                <div className="font-bold text-xl flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Package className="h-5 w-5" />
                    </div>
                    Storage
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium leading-none">{user?.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 mt-1 border-primary/20 text-primary">{user?.role}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={logout} className="mr-2 text-muted-foreground hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                    </Button>
                    <AddProductDialog />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4">
                <Outlet />
            </main>
        </div>
    );
};
