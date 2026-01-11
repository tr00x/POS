import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
    data?: { time: string; orders: number; revenue: number }[];
    isLoading: boolean;
}

export const HourlyActivityChart = ({ data, isLoading }: Props) => {
    if (isLoading) return <Card className="h-[350px] animate-pulse bg-muted/20" />;

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Hourly Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
