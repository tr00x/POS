import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ManagerStats } from '@/hooks/useManagerStats';

interface Props {
    data?: ManagerStats['topProducts'];
    isLoading: boolean;
}

export const TopProductsTable = ({ data, isLoading }: Props) => {
    const getBadgeColor = (cat: string) => {
        if (cat === 'A') return "bg-green-100 text-green-700 hover:bg-green-100";
        if (cat === 'B') return "bg-blue-100 text-blue-700 hover:bg-blue-100";
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    };

    if (isLoading || !data) {
        return (
            <Card className="rounded-2xl border-none shadow-sm h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Top Products (ABC Analysis)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
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
                <CardTitle className="text-base">Top Products (ABC Analysis)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((p, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted/30 p-2 -mx-2 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center font-bold text-xs text-muted-foreground">
                                    {i + 1}
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{p.name}</div>
                                    <div className="text-xs text-muted-foreground">{p.sold} sold</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="font-bold text-sm">{p.revenue} TMT</div>
                                    <Badge className={`h-5 text-[10px] px-1.5 ${getBadgeColor(p.category)} border-0`}>
                                        Class {p.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

