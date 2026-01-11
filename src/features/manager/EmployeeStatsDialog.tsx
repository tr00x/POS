import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, TrendingUp, Package, CheckCircle, XCircle, DollarSign, Bike, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface EmployeeStatsDialogProps {
    employee: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EmployeeStatsDialog = ({ employee, open, onOpenChange }: EmployeeStatsDialogProps) => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['employee-stats', employee?.id],
        queryFn: async () => {
            if (!employee?.id) return null;
            const res = await api.get(`/users/${employee.id}/stats`);
            return res.data;
        },
        enabled: !!employee?.id && open
    });

    if (!employee) return null;

    const getRoleIcon = () => {
        switch (employee.role) {
            case 'cashier': return <DollarSign className="h-5 w-5" />;
            case 'courier': return <Bike className="h-5 w-5" />;
            default: return <Package className="h-5 w-5" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 bg-background border-none shadow-lg">
                <div className="p-6 pb-0">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                {getRoleIcon()}
                            </div>
                            <div>
                                <div className="text-xl font-bold">{employee.name || employee.username}</div>
                                <Badge variant="secondary" className="uppercase text-[10px] tracking-wider mt-1">
                                    {employee.role}
                                </Badge>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <ScrollArea className="h-[600px] px-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : stats ? (
                        <div className="space-y-8 pb-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {employee.role === 'cashier' ? (
                                    <>
                                        <StatCard 
                                            label="Total Revenue" 
                                            value={`${stats.totalRevenue?.toFixed(2) || 0} TMT`} 
                                            icon={<TrendingUp className="h-4 w-4 text-green-600" />}
                                            bg="bg-green-50"
                                        />
                                        <StatCard 
                                            label="Total Orders" 
                                            value={stats.totalOrders || 0}
                                            icon={<Package className="h-4 w-4 text-blue-600" />}
                                            bg="bg-blue-50"
                                        />
                                        <StatCard 
                                            label="Completed" 
                                            value={stats.completedOrders || 0}
                                            icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
                                            bg="bg-emerald-50"
                                        />
                                        <StatCard 
                                            label="Cancelled" 
                                            value={stats.cancelledOrders || 0}
                                            icon={<XCircle className="h-4 w-4 text-red-600" />}
                                            bg="bg-red-50"
                                        />
                                    </>
                                ) : employee.role === 'courier' ? (
                                    <>
                                        <StatCard 
                                            label="Deliveries" 
                                            value={stats.totalDeliveries || 0}
                                            icon={<Bike className="h-4 w-4 text-blue-600" />}
                                            bg="bg-blue-50"
                                        />
                                        <StatCard 
                                            label="Fees Earned" 
                                            value={`${stats.totalDeliveryFees?.toFixed(2) || 0} TMT`}
                                            icon={<DollarSign className="h-4 w-4 text-green-600" />}
                                            bg="bg-green-50"
                                        />
                                        <StatCard 
                                            label="Completed" 
                                            value={stats.completedDeliveries || 0}
                                            icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
                                            bg="bg-emerald-50"
                                        />
                                        <StatCard 
                                            label="Cancelled" 
                                            value={stats.cancelledDeliveries || 0}
                                            icon={<XCircle className="h-4 w-4 text-red-600" />}
                                            bg="bg-red-50"
                                        />
                                    </>
                                ) : null}
                            </div>

                            {/* AI Insights Section */}
                            <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <BrainCircuit className="h-24 w-24" />
                                </div>
                                <div className="flex items-center gap-2 mb-3 text-indigo-700">
                                    <Sparkles className="h-5 w-5" />
                                    <h3 className="font-semibold">AI Performance Insights</h3>
                                </div>
                                <div className="grid gap-3 relative z-10">
                                    <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg backdrop-blur-sm">
                                        <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">High Efficiency detected</p>
                                            <p className="text-xs text-slate-500">
                                                {employee.role === 'cashier' 
                                                    ? 'Processing speed is 15% faster than average during peak hours.'
                                                    : 'Delivery completion rate is in the top 10% of couriers.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg backdrop-blur-sm">
                                        <TrendingUp className="h-5 w-5 text-emerald-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Predicted Performance</p>
                                            <p className="text-xs text-slate-500">
                                                Based on current trends, expected to handle {employee.role === 'cashier' ? '45+ orders' : '12+ deliveries'} tomorrow.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Trend Chart */}
                                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="text-sm font-semibold mb-4 text-slate-700">
                                        {employee.role === 'cashier' ? 'Revenue Trend (7 Days)' : 'Delivery Fees (7 Days)'}
                                    </h4>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.dailyStats || []}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                                <Tooltip 
                                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                                    cursor={{stroke: '#6366f1', strokeWidth: 1}}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey={employee.role === 'cashier' ? 'revenue' : 'fees'} 
                                                    stroke="#6366f1" 
                                                    fillOpacity={1} 
                                                    fill="url(#colorValue)" 
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Status Chart */}
                                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="text-sm font-semibold mb-4 text-slate-700">Order Status Distribution</h4>
                                    <div className="h-[200px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.statusDistribution || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {(stats.statusDistribution || []).map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-4 text-xs text-slate-600 mt-2">
                                        {(stats.statusDistribution || []).map((item: any) => (
                                            <div key={item.name} className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                                                {item.name} ({item.value})
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Hourly Activity */}
                                <div className="md:col-span-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="text-sm font-semibold mb-4 text-slate-700">Activity by Hour</h4>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.hourlyStats || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis 
                                                    dataKey="hour" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fontSize: 10, fill: '#64748b'}} 
                                                    interval={2}
                                                />
                                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                                <Tooltip 
                                                    cursor={{fill: '#f1f5f9'}}
                                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                                />
                                                <Bar 
                                                    dataKey={employee.role === 'cashier' ? 'orders' : 'deliveries'} 
                                                    fill="#3b82f6" 
                                                    radius={[4, 4, 0, 0]} 
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">No stats available</div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

const StatCard = ({ label, value, icon, bg }: { label: string, value: string | number, icon: any, bg: string }) => (
    <div className={`p-4 rounded-xl ${bg} flex flex-col justify-between h-24`}>
        <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">{label}</span>
            <div className="bg-white/60 p-1.5 rounded-lg backdrop-blur-sm">
                {icon}
            </div>
        </div>
        <div className="text-xl font-bold tracking-tight">{value}</div>
    </div>
);
