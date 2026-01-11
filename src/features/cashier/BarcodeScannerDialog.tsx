import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface BarcodeScannerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScan: (barcode: string) => void;
}

export const BarcodeScannerDialog = ({ open, onOpenChange, onScan }: BarcodeScannerDialogProps) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(false);
    const onScanRef = useRef(onScan);

    const lastScannedRef = useRef<{ code: string; timestamp: number } | null>(null);

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    // Effect to track mounting state
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            lastScannedRef.current = null;
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;

        if (!open) {
            // Cleanup logic when dialog closes
            const cleanup = async () => {
                if (scannerRef.current) {
                    try {
                        if (scannerRef.current.isScanning) {
                            await scannerRef.current.stop();
                        }
                        scannerRef.current.clear();
                    } catch (err) {
                        console.error("Error stopping scanner:", err);
                    } finally {
                        scannerRef.current = null;
                    }
                }
            };
            cleanup();
            return;
        }

        const startScanner = async () => {
            if (isCancelled) return;
            
            setIsLoading(true);
            setError(null);

            // Wait for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 300));
            if (isCancelled || !isMountedRef.current) return;

            const scannerId = "reader";
            const element = document.getElementById(scannerId);
            
            if (!element) {
                console.error("Scanner element not found");
                if (isMountedRef.current) setError("Scanner initialization failed.");
                return;
            }

            // Cleanup any existing instance just in case
            if (scannerRef.current) {
                try {
                    if (scannerRef.current.isScanning) {
                        await scannerRef.current.stop();
                    }
                    scannerRef.current.clear();
                } catch (e) {
                    // ignore
                }
                scannerRef.current = null;
            }

            try {
                // Use native barcode detector if supported (much faster)
                const html5QrCode = new Html5Qrcode(scannerId, { 
                    verbose: false,
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: true
                    }
                });
                scannerRef.current = html5QrCode;

                const config = { 
                    fps: 15, // Increased from 10 to 15 for smoother scanning
                    qrbox: { width: 250, height: 250 },
                    // aspectRatio removed to prevent layout issues
                    formatsToSupport: [ 
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.CODE_128,
                        Html5QrcodeSupportedFormats.CODE_39,
                        Html5QrcodeSupportedFormats.UPC_A,
                        Html5QrcodeSupportedFormats.UPC_E,
                        Html5QrcodeSupportedFormats.QR_CODE
                    ]
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        if (isMountedRef.current) {
                            const now = Date.now();
                            // Debounce: Ignore duplicate scans within 1.5 seconds
                            if (lastScannedRef.current && 
                                lastScannedRef.current.code === decodedText && 
                                (now - lastScannedRef.current.timestamp < 1500)) {
                                return;
                            }
                            
                            lastScannedRef.current = { code: decodedText, timestamp: now };
                            onScanRef.current(decodedText);
                        }
                    },
                    () => {
                        // ignore scan errors
                    }
                );
                
                if (isMountedRef.current) setIsLoading(false);
            } catch (err) {
                console.error("Error starting scanner:", err);
                if (isMountedRef.current) {
                    setError("Could not start camera. Please ensure permissions are granted.");
                    setIsLoading(false);
                }
                
                // Cleanup on error
                if (scannerRef.current) {
                    try {
                        scannerRef.current.clear();
                    } catch (e) {}
                    scannerRef.current = null;
                }
            }
        };

        startScanner();

        return () => {
            isCancelled = true;
            // Immediate cleanup attempt on unmount/effect re-run
            if (scannerRef.current) {
                const scanner = scannerRef.current;
                const stopPromise = scanner.isScanning ? scanner.stop() : Promise.resolve();
                stopPromise
                    .catch(e => console.error("Cleanup error:", e))
                    .finally(() => {
                        try {
                            scanner.clear();
                        } catch (e) {}
                    });
                scannerRef.current = null;
            }
        };
        // Removed onScan from dependencies to prevent restart on re-render
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-visible bg-transparent border-none shadow-none" onPointerDownOutside={(e) => e.preventDefault()}>
                <div className="flex flex-col w-full bg-background rounded-lg border shadow-lg p-6">
                <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                    <DialogDescription>Point your camera at a barcode</DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-black/5 rounded-xl overflow-hidden relative my-4">
                    {error ? (
                        <div className="text-center p-6 text-destructive space-y-2">
                            <AlertCircle className="h-10 w-10 mx-auto" />
                            <p>{error}</p>
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
                                Close
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div id="reader" className="w-full h-full min-h-[300px]" />
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
