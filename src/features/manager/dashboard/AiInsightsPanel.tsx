import { Sparkles, AlertTriangle, TrendingUp, Package, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ManagerStats } from '@/hooks/useManagerStats';

interface Props {
    insights?: ManagerStats['insights'];
    isLoading: boolean;
    fullWidth?: boolean;
}

export const AiInsightsPanel = ({ insights, isLoading, fullWidth = false }: Props) => {
    const getInsightConfig = (type: string) => {
        switch (type) {
            case 'alert':
                return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" };
            case 'optimization':
                return { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" };
            case 'inventory':
                return { icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" };
            default:
                return { icon: Info, color: "text-gray-500", bg: "bg-gray-500/10" };
        }
    };

    if (isLoading || !insights) {
        return (
            <Card className="rounded-2xl border-none shadow-sm h-full flex flex-col bg-gradient-to-b from-card to-card/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">AI Assistant</CardTitle>
                            <p className="text-xs text-muted-foreground">Real-time business insights</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl border-none shadow-sm h-full flex flex-col bg-gradient-to-b from-card to-card/50">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base">AI Assistant</CardTitle>
                        <p className="text-xs text-muted-foreground">Real-time business insights</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className={`flex-1 overflow-auto pr-2 ${fullWidth ? 'flex flex-col' : 'space-y-4'}`}>
                <div className={fullWidth ? "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" : "space-y-4"}>
                    {insights.map((insight, i) => {
                        const config = getInsightConfig(insight.type);
                        const Icon = config.icon;
                        return (
                            <div key={i} className={`bg-background/50 rounded-xl p-3 border hover:border-primary/20 transition-all cursor-pointer group ${fullWidth ? 'h-full' : ''}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`shrink-0 p-2 rounded-lg ${config.bg}`}>
                                        <Icon className={`h-4 w-4 ${config.color}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            {insight.title}
                                            {i === 0 && <Badge variant="secondary" className="h-5 text-[10px] px-1 bg-red-100 text-red-700">New</Badge>}
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {insight.message}
                                        </p>
                                        {insight.action && (
                                            <Button variant="link" className="h-auto p-0 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                {insight.action} →
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="pt-4 mt-auto">
                    <div className="relative">                        <input 
                            type="text" 
                            placeholder="Ask AI: 'Show top sales on Friday'..." 
                            className="w-full bg-muted/50 text-sm rounded-xl px-4 py-3 pr-10 border-none focus:ring-1 focus:ring-primary outline-none"
                        />
                        <Button size="icon" variant="ghost" className="absolute right-1 top-1 hover:bg-background/50 rounded-lg h-8 w-8">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

