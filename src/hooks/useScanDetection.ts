import { useEffect, useRef } from 'react';

interface UseScanDetectionOptions {
    onScan: (code: string) => void;
    minLength?: number;
    bufferResetTime?: number;
    stopPropagation?: boolean;
    preventDefault?: boolean;
}

export const useScanDetection = ({
    onScan,
    minLength = 3,
    bufferResetTime = 50, // Slightly increased to be safe, scanners are usually < 20ms per char
    stopPropagation = false,
    preventDefault = false,
}: UseScanDetectionOptions) => {
    const buffer = useRef<string>('');
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if modifier keys are pressed (Ctrl, Alt, Meta)
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            // Handle Enter key (End of scan)
            if (e.key === 'Enter') {
                if (buffer.current.length >= minLength) {
                    onScan(buffer.current);
                    if (stopPropagation) e.stopPropagation();
                    if (preventDefault) e.preventDefault();
                    buffer.current = '';
                    if (timeout.current) clearTimeout(timeout.current);
                } else {
                    // If enter pressed but buffer short, just clear buffer
                    buffer.current = '';
                }
                return;
            }

            // Only accept single printable characters
            if (e.key.length !== 1) return;

            // If we have a timeout running, clear it to keep the buffer alive
            if (timeout.current) {
                clearTimeout(timeout.current);
            }

            buffer.current += e.key;

            // Set a timeout to clear the buffer if no next key arrives quickly
            timeout.current = setTimeout(() => {
                buffer.current = '';
            }, bufferResetTime);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (timeout.current) clearTimeout(timeout.current);
        };
    }, [onScan, minLength, bufferResetTime, stopPropagation, preventDefault]);
};
