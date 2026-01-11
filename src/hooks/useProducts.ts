import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product } from '@/types';

export const useProducts = () => {
    const queryClient = useQueryClient();

    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await api.get<Product[]>('/products');
            return data;
        },
    });

    const addProductMutation = useMutation({
        mutationFn: async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data } = await api.post<Product>('/products', newProduct);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    return {
        products: productsQuery.data || [],
        isLoading: productsQuery.isLoading,
        isError: productsQuery.isError,
        addProduct: addProductMutation.mutateAsync,
    };
};
