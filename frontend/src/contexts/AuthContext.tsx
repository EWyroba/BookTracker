import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI, booksAPI } from '../services/api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

interface RegisterData {
    nazwa_uzytkownika: string;
    email: string;
    password: string;
    nazwa_wyswietlana: string;
}

interface AuthProviderProps {
    children: ReactNode;
}

// Tutaj eksportujemy AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
            booksAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authAPI.post('/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            booksAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            const response = await authAPI.post('/auth/register', userData);
            const { token, userId } = response.data;

            localStorage.setItem('token', token);
            booksAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Po rejestracji automatycznie logujemy
            const loginResponse = await authAPI.post('/auth/login', {
                email: userData.email,
                password: userData.password
            });

            const { user } = loginResponse.data;
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error: any) {
            console.error('Register error:', error);
            throw error;
        }
    };
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete booksAPI.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// I tutaj eksportujemy useAuth hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};