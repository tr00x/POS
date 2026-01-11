import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ManagerStats } from '@/hooks/useManagerStats';

interface Props {
    data?: ManagerStats['cards'];
    isLoading: boolean;
}

export const StatsCards = ({ data, isLoading }: Props) => {
    if (isLoading || !data) {
        return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/20 rounded-2xl animate-pulse" />)}
        </div>
    }

    const stats = [
        {
            title: "Total Revenue",
            value: `${data.revenue.value.toLocaleString()} TMT`,
            change: `${data.revenue.change > 0 ? '+' : ''}${data.revenue.change.toFixed(1)}%`,
            trend: data.revenue.trend,
            icon: DollarSign,
            description: "vs. previous period"
        },
        {
            title: "Average Check",
            value: `${data.averageCheck.value.toFixed(1)} TMT`,
            change: `${data.averageCheck.change > 0 ? '+' : ''}${data.averageCheck.change.toFixed(1)}%`,
            trend: data.averageCheck.trend,
            icon: ShoppingCart,
            description: "vs. previous period"
        },
        {
            title: "Net Profit (Est.)",
            value: `${data.profit.value.toLocaleString()} TMT`,
            change: `${data.profit.change > 0 ? '+' : ''}${data.profit.change.toFixed(1)}%`,
            trend: data.profit.trend,
            icon: TrendingUp,
            description: "vs. previous period"
        },
         {
            title: "Active Cashiers",
            value: `${data.activeCashiers.value} / ${data.activeCashiers.total}`,
            change: "All systems normal",
            trend: "neutral",
            icon: Users,
            description: "currently online"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="rounded-2xl border-none shadow-sm bg-card/50 hover:bg-card transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            {stat.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />}
                            {stat.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />}
                            <span className={stat.trend === 'up' ? 'text-green-500 font-medium' : stat.trend === 'down' ? 'text-red-500 font-medium' : ''}>
                                {stat.change}
                            </span>
                            <span className="ml-1 opacity-70">{stat.description}</span>
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
