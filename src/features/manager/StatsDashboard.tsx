import { useState } from 'react';
import { StatsCards } from './dashboard/StatsCards';
import { SalesChart } from './dashboard/SalesChart';
import { AiInsightsPanel } from './dashboard/AiInsightsPanel';
import { TopProductsTable } from './dashboard/TopProductsTable';
import { BottomProductsTable } from './dashboard/BottomProductsTable';
import { TopCashiersTable } from './dashboard/TopCashiersTable';
import { CategoryPieChart } from './dashboard/CategoryPieChart';
import { HourlyActivityChart } from './dashboard/HourlyActivityChart';
import { PaymentMethodChart } from './dashboard/PaymentMethodChart';
import { useManagerStats, type Period } from '@/hooks/useManagerStats';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const StatsDashboard = () => {
    const [period, setPeriod] = useState<Period>('week');
    const { data, isLoading } = useManagerStats(period);

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Top Stats Cards */}
            <StatsCards data={data?.cards} isLoading={isLoading} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Row 1: Sales Trend (2/3) & Payment Methods (1/3) */}
                <div className="lg:col-span-2">
                    <SalesChart data={data?.chart} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-1">
                    <PaymentMethodChart data={data?.paymentMethods} isLoading={isLoading} />
                </div>

                {/* Row 2: Hourly Activity (2/3) & Category Sales (1/3) */}
                <div className="lg:col-span-2">
                    <HourlyActivityChart data={data?.hourlyActivity} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-1">
                    <CategoryPieChart data={data?.categorySales} isLoading={isLoading} />
                </div>

                {/* Row 3: Product & Staff Analysis */}
                <div className="lg:col-span-1">
                    <TopProductsTable data={data?.topProducts} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-1">
                    <BottomProductsTable data={data?.bottomProducts} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-1">
                    <TopCashiersTable data={data?.topCashiers} isLoading={isLoading} />
                </div>

                {/* Row 4: AI Insights */}
                <div className="lg:col-span-3">
                    <AiInsightsPanel insights={data?.insights} isLoading={isLoading} fullWidth />
                </div>
            </div>
        </div>
    );
};
