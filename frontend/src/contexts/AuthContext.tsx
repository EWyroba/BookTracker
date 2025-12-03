// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import api from '../services/api';

// Definiowanie typu dla użytkownika
export interface User {
    id: number;
    nazwa_uzytkownika: string;
    email: string;
    nazwa_wyswietlana: string;
    url_avatara: string | null;
    bio: string | null;
    cel_czytania: number;
    data_rejestracji?: string;
}

// Typ dla kontekstu
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => Promise<void>;
    register: (token: string, userData: User) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    isAuthenticated: boolean;
    loading: boolean;
    refreshUser: () => Promise<void>;
    clearAuthData: () => void;
}

// Tworzenie kontekstu z domyślnymi wartościami
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook do używania kontekstu
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Interfejs dla komponentu providera
interface AuthProviderProps {
    children: ReactNode;
}

// Komponent providera
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Funkcja czyszczenia danych autoryzacyjnych
    const clearAuthData = () => {
        console.log('Clearing auth data...');
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        delete api.defaults.headers.common['Authorization'];
    };

    // Funkcja walidacji tokenu
    const validateToken = async (tokenToValidate: string): Promise<boolean> => {
        try {
            // Tymczasowo ustaw nagłówek
            const tempAuthHeader = `Bearer ${tokenToValidate}`;

            // Użyj authAPI zamiast axios bezpośrednio
            const response = await api.get('/auth/me', {
                headers: {
                    Authorization: tempAuthHeader
                }
            });

            return response.status === 200 && response.data?.user;
        } catch (error) {
            console.error('Token validation failed:', error);

            // Sprawdź konkretny błąd
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                    console.log('Token is invalid or expired');
                    return false;
                }
            }

            return false;
        }
    };

    // Funkcja do inicjalizacji z weryfikacją
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log('Initializing auth...');

                // Sprawdź czy mamy dane w localStorage
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                console.log('Stored token:', storedToken ? 'exists' : 'missing');
                console.log('Stored user:', storedUser ? 'exists' : 'missing');

                if (!storedToken || !storedUser) {
                    console.log('No stored auth data found');
                    clearAuthData();
                    setLoading(false);
                    return;
                }

                // Sprawdź ważność tokenu
                console.log('Validating token...');
                const isValid = await validateToken(storedToken);

                if (isValid) {
                    console.log('Token is valid, setting auth data');
                    // Jeśli token jest ważny, ustaw dane
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // Ustaw nagłówek dla axios
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                    console.log('Auth initialized successfully');
                } else {
                    console.log('Token invalid, clearing auth data');
                    // Jeśli token nieprawidłowy, wyczyść wszystko
                    clearAuthData();
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                clearAuthData();
            } finally {
                setLoading(false);
                console.log('Auth initialization complete');
            }
        };

        initializeAuth();
    }, []);

    // Funkcja logowania
    const login = async (newToken: string, userData: User) => {
        try {
            console.log('Logging in with token:', newToken);

            // Ustaw stan
            setToken(newToken);
            setUser(userData);

            // Zapisz w localStorage
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Ustaw nagłówek axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            console.log('Login successful for user:', userData.email);
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    // Funkcja rejestracji
    const register = async (newToken: string, userData: User) => {
        try {
            console.log('Registering with token:', newToken);

            // Ustaw stan
            setToken(newToken);
            setUser(userData);

            // Zapisz w localStorage
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Ustaw nagłówek axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            console.log('Registration successful for user:', userData.email);
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    };

    // Funkcja wylogowania
    const logout = () => {
        console.log('Logging out...');
        clearAuthData();

        // Przekieruj na stronę logowania
        window.location.href = '/login';
    };

    // Funkcja aktualizacji danych użytkownika
    const updateUser = (userData: Partial<User>) => {
        console.log('Updating user data:', userData);

        setUser(prev => {
            if (!prev) return null;

            const updatedUser = { ...prev, ...userData };

            // Aktualizuj localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return updatedUser;
        });
    };

    // Funkcja do ręcznego odświeżenia danych użytkownika z API
    const refreshUser = async (): Promise<void> => {
        if (!token) {
            console.log('No token available for refresh');
            return;
        }

        try {
            console.log('Refreshing user data...');

            const response = await api.get('/auth/me');
            const updatedUser = response.data.user;

            updateUser(updatedUser);
            console.log('User data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing user data:', error);

            // Jeśli token jest nieprawidłowy, wyloguj
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.log('Token expired during refresh, logging out');
                logout();
            }
        }
    };

    // Sprawdzenie czy użytkownik jest zalogowany
    const isAuthenticated = !!user && !!token;

    // Wartość kontekstu
    const contextValue: AuthContextType = {
        user,
        token,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
        loading,
        refreshUser,
        clearAuthData
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;