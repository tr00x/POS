import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CourierLayout = () => {
    const { user, logout } = useAuth();
    return (
        <div className="flex flex-col h-[100dvh] bg-background">
            <header className="h-14 border-b flex items-center justify-between px-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-3 font-bold">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-black ring-2 ring-primary/5">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm leading-none">{user?.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Courier</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="h-5 w-5" />
                </Button>
            </header>
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};
