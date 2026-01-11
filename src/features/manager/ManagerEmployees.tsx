import { useState } from 'react';
import {
    ChevronRight,
    User,
    Plus,
    Pencil,
    Trash2,
    BarChart2
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EmployeeDialog } from './EmployeeDialog';
import { EmployeeStatsDialog } from './EmployeeStatsDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export const ManagerEmployees = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [statsEmployee, setStatsEmployee] = useState<any>(null);

    const { data: employees, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data;
        }
    });

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/users/${deleteId}`);
            toast.success('Employee deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete employee');
        } finally {
            setDeleteId(null);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'destructive'; // or default/primary
            case 'manager': return 'default';
            case 'cashier': return 'secondary';
            case 'storage': return 'outline';
            case 'courier': return 'outline';
            default: return 'secondary';
        }
    };

    if (isLoading) return <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
                    <p className="text-muted-foreground">Manage all staff members and roles.</p>
                </div>
                <Button onClick={() => { setEditingEmployee(null); setIsAddOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            </div>

            <div className="bg-card rounded-2xl border overflow-hidden">
                {employees?.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No employees found. Add one to get started.
                    </div>
                ) : (
                    employees?.map((employee: any) => (
                        <div 
                            key={employee.id} 
                            className="p-4 flex items-center justify-between border-b last:border-0 hover:bg-muted/50 transition-colors group"
                        >
                            <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => {
                                    if (employee.role === 'cashier' || employee.role === 'courier') {
                                        setStatsEmployee(employee);
                                    }
                                }}
                            >
                                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {employee.name || employee.username}
                                        <Badge variant={getRoleBadgeColor(employee.role) as any} className="text-[10px] px-1.5 py-0 uppercase">
                                            {employee.role}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">@{employee.username}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {(employee.role === 'cashier' || employee.role === 'courier') && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setStatsEmployee(employee);
                                        }}
                                    >
                                        <BarChart2 className="h-4 w-4 text-blue-600" />
                                    </Button>
                                )}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingEmployee(employee);
                                            setIsAddOpen(true);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteId(employee.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <EmployeeDialog 
                open={isAddOpen} 
                onOpenChange={setIsAddOpen} 
                employee={editingEmployee}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['users'] });
                }}
            />

            <EmployeeStatsDialog 
                open={!!statsEmployee} 
                onOpenChange={(open) => !open && setStatsEmployee(null)} 
                employee={statsEmployee}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the employee account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
