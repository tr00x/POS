import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface NumpadProps {
    onInput: (value: string) => void;
    onDelete: () => void;
    onClear?: () => void;
    disabled?: boolean;
    className?: string;
}

export const Numpad = ({ onInput, onDelete, disabled, className }: NumpadProps) => {
    const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0'];

    return (
        <div className={`grid grid-cols-3 gap-2 ${className}`}>
            {keys.map((key) => (
                <Button
                    key={key}
                    variant="outline"
                    className="h-14 text-2xl font-semibold"
                    onClick={() => onInput(key)}
                    disabled={disabled}
                >
                    {key}
                </Button>
            ))}
            <Button
                variant="outline"
                className="h-14"
                onClick={onDelete}
                disabled={disabled}
            >
                <Delete className="h-6 w-6" />
            </Button>
        </div>
    );
};
