import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/types';

export const useCategories = () => {
    const queryClient = useQueryClient();

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get<Category[]>('/categories');
            return data;
        },
    });

    const addCategoryMutation = useMutation({
        mutationFn: async (newCategory: Category) => {
            const { data } = await api.post<Category>('/categories', newCategory);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    return {
        categories: categoriesQuery.data || [],
        isLoading: categoriesQuery.isLoading,
        isError: categoriesQuery.isError,
        addCategory: addCategoryMutation.mutateAsync,
        deleteCategory: deleteCategoryMutation.mutateAsync,
    };
};
