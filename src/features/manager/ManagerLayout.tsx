import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const ManagerLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Determine active tab based on path
    const getActiveTab = () => {
        if (location.pathname.includes('/settings')) return 'settings';
        if (location.pathname.includes('/employees')) return 'employees';
        if (location.pathname.includes('/orders')) return 'orders';
        if (location.pathname.includes('/inventory')) return 'inventory';
        return 'stats'; // Default or /manager
    };

    const activeTab = getActiveTab();

    return (
        <div className="flex flex-col h-screen bg-muted/20">
            {/* Header Info */}
            <div className="bg-background px-6 pt-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">{user?.name}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{user?.role}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-xl">MH13</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Licence ID</div>
                    </div>
                </div>

                {/* Navigation Pills */}
                <div className="bg-muted rounded-xl p-1 flex">
                    <Link to="/manager/settings" className={cn("flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all", activeTab === 'settings' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50")}>
                        App settings
                    </Link>
                    <Link to="/manager/employees" className={cn("flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all", activeTab === 'employees' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50")}>
                        Employees
                    </Link>
                    <Link to="/manager/orders" className={cn("flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all", activeTab === 'orders' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50")}>
                        Orders
                    </Link>
                    <Link to="/manager/inventory" className={cn("flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all", activeTab === 'inventory' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50")}>
                        Inventory
                    </Link>
                    <Link to="/manager" className={cn("flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all", activeTab === 'stats' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50")}>
                        Statistics
                    </Link>
                </div>
            </div>

            <main className="flex-1 overflow-auto p-4">
                <Outlet />
            </main>
        </div>
    );
};
