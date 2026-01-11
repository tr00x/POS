import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Order } from '@/types';

interface OrdersResponse {
    data: Order[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const useOrders = (params?: { limit?: number }) => {
    const queryClient = useQueryClient();

    const ordersQuery = useInfiniteQuery({
        queryKey: ['orders'],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await api.get<OrdersResponse>('/orders', {
                params: {
                    page: pageParam,
                    limit: params?.limit || 20
                }
            });
            return data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.page < lastPage.meta.totalPages) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        }
    });

    const createOrderMutation = useMutation({
        mutationFn: async (newOrder: { items: { productId: string; quantity: number; price?: number }[]; cashierId: string; type: 'local' | 'delivery'; deliveryAddress?: string; deliveryFee?: number; customerPhone?: string; receiverName?: string; paymentMethod?: 'cash' | 'card'; note?: string; }) => {
            const { data } = await api.post<Order>('/orders', newOrder);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Stock changes
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    return {
        orders: ordersQuery.data?.pages.flatMap(page => page.data) || [],
        isLoading: ordersQuery.isLoading,
        isError: ordersQuery.isError,
        fetchNextPage: ordersQuery.fetchNextPage,
        hasNextPage: ordersQuery.hasNextPage,
        isFetchingNextPage: ordersQuery.isFetchingNextPage,
        createOrder: createOrderMutation.mutateAsync,
        isCreating: createOrderMutation.isPending,
    };
};
