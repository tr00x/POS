import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ManagerStats } from '@/hooks/useManagerStats';

interface Props {
    data?: ManagerStats['topCashiers'];
    isLoading: boolean;
}

export const TopCashiersTable = ({ data, isLoading }: Props) => {
    if (isLoading || !data) {
        return (
            <Card className="rounded-2xl border-none shadow-sm h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Top Cashiers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Top Cashiers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((c, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted/30 p-2 -mx-2 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                    {i + 1}
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{c.name}</div>
                                    <div className="text-xs text-muted-foreground">{c.orders} orders</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-sm">{c.revenue} TMT</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
