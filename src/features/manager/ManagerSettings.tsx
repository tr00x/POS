import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ManagerSettings = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center">
                {/* Back button logic if needed, or simply header */}
            </div>

            <div className="space-y-1">
                <div className="bg-card rounded-2xl border overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b hover:bg-muted/50 cursor-pointer">
                        <span className="font-medium">Language</span>
                        <div className="flex items-center text-muted-foreground gap-2">
                            <span>English</span>
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between border-b hover:bg-muted/50 cursor-pointer">
                        <span className="font-medium">Color scheme</span>
                        <div className="flex items-center text-muted-foreground gap-2">
                            <span>Light</span>
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer">
                        <span className="font-medium">Server</span>
                        <div className="flex items-center text-muted-foreground gap-2">
                            <span>Local - 192.168.1.13</span>
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#FFF8E1] text-[#795548] p-6 rounded-2xl border border-[#FFE082] text-center space-y-2">
                <h3 className="font-bold">Your license is active till:</h3>
                <p className="font-medium">13 April 1996</p>
            </div>

            {/* Example of expired state from design */}
            <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 text-center space-y-4">
                <h3 className="font-bold">Your license expired. Contact manager for questions.</h3>
                <Button variant="destructive" className="w-full bg-destructive text-white hover:bg-destructive/90 rounded-xl">
                    Make a Call
                </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-10">
                AppName v1.2
            </div>
        </div>
    );
};
