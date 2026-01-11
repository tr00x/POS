import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type Period = 'today' | 'week' | 'month' | 'year';

export interface CardStat {
    value: number;
    change: number;
    trend: 'up' | 'down';
    total?: number;
}

export interface ManagerStats {
    cards: {
        revenue: CardStat;
        averageCheck: CardStat;
        profit: CardStat;
        activeCashiers: CardStat;
    };
    chart: { name: string; revenue: number; profit: number }[];
    topProducts: {
        id: string;
        name: string;
        sold: number;
        revenue: number;
        category: 'A' | 'B' | 'C';
    }[];
    bottomProducts: {
        id: string;
        name: string;
        sold: number;
        revenue: number;
        category: 'A' | 'B' | 'C';
    }[];
    topCashiers: {
        id: string;
        name: string;
        revenue: number;
        orders: number;
    }[];
    insights: {
        type: string;
        title: string;
        message: string;
        action?: string;
    }[];
    categorySales: { name: string; value: number; fill: string }[];
    hourlyActivity: { time: string; orders: number; revenue: number }[];
    paymentMethods: { name: string; value: number; fill: string }[];
}

export const useManagerStats = (period: Period = 'week') => {
    return useQuery({
        queryKey: ['manager-stats', period],
        queryFn: async () => {
            const { data } = await api.get<ManagerStats>(`/stats?period=${period}`);
            return data;
        },
        refetchInterval: 30000 // Real-time pulse every 30s
    });
};
