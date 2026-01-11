import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';

export const AdminLayout = () => {
    const { logout, user } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6" />
                        <h1 className="font-bold text-xl">Admin Panel</h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            Logged in as {user?.name}
                        </span>
                        <Button variant="ghost" size="icon" onClick={logout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};
