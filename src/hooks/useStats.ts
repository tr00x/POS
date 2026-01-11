import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Stats {
    products: number;
    orders: number;
    totalRevenue: number;
    topSelling: any[];
    chartData: { name: string; total: number }[];
}

export type Period = 'today' | 'week' | 'month' | 'year';

export const useStats = (period: Period = 'week') => {
    const query = useQuery({
        queryKey: ['stats', period],
        queryFn: async () => {
            const { data } = await api.get<Stats>(`/stats?period=${period}`);
            return data;
        },
    });

    return {
        stats: query.data,
        isLoading: query.isLoading,
        isError: query.isError
    };
};
