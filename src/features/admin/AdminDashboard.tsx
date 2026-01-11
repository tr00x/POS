import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Store, User, Package, Calculator, Settings, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard = () => {
    const navigate = useNavigate();

    const sections = [
        { id: 'cashier', label: 'Cashier POS', icon: <Calculator className="h-6 w-6" />, desc: 'Process sales and transactions' },
        { id: 'manager', label: 'Manager Dashboard', icon: <User className="h-6 w-6" />, desc: 'View stats and manage staff' },
        { id: 'storage', label: 'Storage Management', icon: <Store className="h-6 w-6" />, desc: 'Manage inventory and stock' },
        { id: 'courier', label: 'Courier Interface', icon: <Package className="h-6 w-6" />, desc: 'View deliveries and routes' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Manage your entire business system from here.</p>
                </div>
                <Button onClick={() => toast.info('Business settings coming soon')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Business Settings
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {sections.map((section) => (
                    <Card key={section.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/${section.id}`)}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {section.label}
                            </CardTitle>
                            {section.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mt-2">
                                {section.desc}
                            </div>
                            <Button variant="link" className="px-0 mt-4 text-primary group">
                                Go to {section.id} 
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
