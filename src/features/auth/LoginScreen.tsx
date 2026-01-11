import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export const LoginScreen = () => {
    const { login, isAuthenticated, role } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && role) {
            navigate(`/${role}`, { replace: true });
        }
    }, [isAuthenticated, role, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(username, password);
            toast.success('Logged in successfully');
        } catch (error) {
            toast.error('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-2 tracking-tight">POS System</h1>
                <p className="text-muted-foreground">Enter your credentials to login</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
            
            <div className="mt-8 text-sm text-muted-foreground text-center">
                <p>Default logins:</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                    <span>admin1 / 123</span>
                    <span>cashier1 / 123</span>
                    <span>manager1 / 123</span>
                    <span>storage1 / 123</span>
                    <span>courier1 / 123</span>
                </div>
            </div>
        </div>
    );
};
