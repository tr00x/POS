import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, RefreshCw, X, Link as LinkIcon, AlertCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface ImageInputProps {
    value?: string | null;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
}

export const ImageInput = ({ 
    value, 
    onChange, 
    label = "Product Image", 
    placeholder = "https://..."
}: ImageInputProps) => {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [isUploading, setIsUploading] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        onChange(url);
        if (!url) {
            setIsValid(true);
            return;
        }
        // Basic validation
        setIsValid(true); // Reset to true, let the img onError handle failure
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onChange(data.url);
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleImageError = () => {
        setIsValid(false);
    };

    const handleImageLoad = () => {
        setIsValid(true);
    };

    return (
        <div className="space-y-3">
            <Label>{label}</Label>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
            />

            <div className="flex flex-wrap gap-4 items-start">
                {/* Preview Box */}
                <div className="relative shrink-0 w-32 h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center overflow-hidden group transition-all hover:border-primary/50">
                    {preview && isValid ? (
                        <>
                            <img 
                                src={preview} 
                                alt="Preview" 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => onChange('')}
                                    type="button"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground p-2 text-center">
                            {preview && !isValid ? (
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            ) : (
                                <ImageIcon className="h-8 w-8 opacity-50" />
                            )}
                            <span className="text-xs font-medium">
                                {preview && !isValid ? "Invalid URL" : "No Image"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex-1 space-y-3">
                    <Button 
                        type="button" 
                        variant="default" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Upload className="h-3.5 w-3.5" />
                        )}
                        Upload Image
                    </Button>

                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            value={value || ''}
                            onChange={handleUrlChange}
                            placeholder={placeholder}
                            className="pl-9 pr-4"
                        />
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                        Upload an image from your device or paste a URL.
                    </p>
                </div>
            </div>
        </div>
    );
};
