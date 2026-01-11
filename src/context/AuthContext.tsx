import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types';

export type UserRole = User['role'];

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const navigate = useNavigate();

    // Poll for user updates to handle role changes/deletions in real-time
    const { data: remoteUser, isError } = useQuery({
        queryKey: ['me', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data } = await api.get<User>(`/users/${user.id}`);
            return data;
        },
        enabled: !!user?.id,
        refetchInterval: 5000, // Check every 5 seconds
        retry: false
    });

    // Sync remote user state
    useEffect(() => {
        if (remoteUser) {
            // If role changed, update state and local storage
            if (JSON.stringify(remoteUser) !== JSON.stringify(user)) {
                setUser(remoteUser);
                localStorage.setItem('user', JSON.stringify(remoteUser));
            }
        }
    }, [remoteUser, user]);

    // Handle user deletion or invalidation
    useEffect(() => {
        if (isError && user) {
            logout();
        }
    }, [isError]);

    const role = user?.role || null;

    const login = async (username: string, password: string) => {
        try {
            const { data } = await api.post<User>('/login', { username, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            navigate(`/${data.role}`);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
