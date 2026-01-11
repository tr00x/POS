import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Promotion } from '@/types';

export const usePromotions = () => {
    const queryClient = useQueryClient();

    const promotionsQuery = useQuery({
        queryKey: ['promotions'],
        queryFn: async () => {
            const { data } = await api.get<Promotion[]>('/promotions');
            return data;
        },
    });

    const deletePromotionMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/promotions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Products might change status
        },
    });

    return {
        promotions: promotionsQuery.data || [],
        isLoading: promotionsQuery.isLoading,
        isError: promotionsQuery.isError,
        deletePromotion: deletePromotionMutation.mutateAsync,
    };
};
