import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Settings2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

export function ManageCategoriesDialog() {
    const { categories, addCategory, deleteCategory } = useCategories();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        if (!newCategoryName.trim()) return;
        const id = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-');
        
        // Check if exists
        if (categories.some(c => c.id === id)) {
            toast.error('Category already exists');
            return;
        }

        setIsLoading(true);
        try {
            await addCategory({ id, name: newCategoryName.trim() });
            setNewCategoryName('');
            toast.success('Category added');
        } catch (e) {
            toast.error('Failed to add category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure? Products in this category will show ID instead of name until reassigned.')) {
             try {
                await deleteCategory(id);
                toast.success('Category deleted');
            } catch (e) {
                toast.error('Failed to delete category');
            }
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Settings2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="New Category Name" 
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        />
                        <Button onClick={handleAdd} disabled={isLoading || !newCategoryName.trim()}>
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                                <span className="font-medium">{cat.name}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(cat.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No categories yet
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
