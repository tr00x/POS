import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface EmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee?: any;
    onSuccess: () => void;
}

export const EmployeeDialog = ({ open, onOpenChange, employee, onSuccess }: EmployeeDialogProps) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('cashier');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (employee) {
                setName(employee.name || '');
                setUsername(employee.username || '');
                setRole(employee.role || 'cashier');
                setPassword(''); // Don't show password
            } else {
                setName('');
                setUsername('');
                setRole('cashier');
                setPassword('');
            }
        }
    }, [open, employee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data: any = {
                name,
                username,
                role
            };

            if (password) {
                data.password = password;
            }

            if (employee) {
                await api.put(`/users/${employee.id}`, data);
                toast.success('Employee updated successfully');
            } else {
                if (!password) {
                    toast.error('Password is required for new employees');
                    setLoading(false);
                    return;
                }
                await api.post('/users', data);
                toast.success('Employee created successfully');
            }

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error(employee ? 'Failed to update employee' : 'Failed to create employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="johndoe"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cashier">Cashier</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="storage">Storage</SelectItem>
                                <SelectItem value="courier">Courier</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={employee ? "Leave blank to keep current" : "Enter password"}
                            required={!employee}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (employee ? 'Update' : 'Create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
