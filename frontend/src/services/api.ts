import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 1. Ustaw bazowy URL
const getApiBaseUrl = (): string => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL: string = getApiBaseUrl();
console.log('🌐 API Base URL:', API_BASE_URL);

// 2. Funkcja do pobierania tokena
export const getToken = (): string | null => {
    // Sprawdź w localStorage
    const token = localStorage.getItem('token');

    // Sprawdź również w auth jeśli istnieje
    try {
        const authData = localStorage.getItem('auth');
        if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.token) {
                return parsed.token;
            }
        }
    } catch (error) {
        // Ignoruj błędy parsowania
    }

    return token;
};

// 3. Główna instancja axios
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000, // 30 sekund timeout
    withCredentials: false
});

// 4. Interceptor requestów
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();

        if (token) {
            config.headers = config.headers || {};
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;

            if (process.env.NODE_ENV === 'development') {
                console.log(`📤 ${config.method?.toUpperCase()} ${config.url} [with token]`);
            }
        } else if (process.env.NODE_ENV === 'development') {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url} [no token]`);
        }

        // Logowanie danych w development (bez wrażliwych danych)
        if (config.data && process.env.NODE_ENV === 'development') {
            const logData = { ...config.data };
            // Usuń potencjalnie wrażliwe dane z logów
            if (logData.password) delete logData.password;
            if (logData.hash_hasla) delete logData.hash_hasla;

            console.log('📝 Request data:', logData);
        }

        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// 5. Interceptor response
api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (process.env.NODE_ENV === 'development') {
            const responseData = response.data as any;
            console.log(`📥 ${response.status} ${response.config.url}`, {
                success: responseData?.success,
                message: responseData?.message
            });
        }
        return response;
    },
    (error) => {
        const { config, response } = error;

        if (process.env.NODE_ENV === 'development') {
            const responseData = response?.data as any;
            console.error('❌ API Error:', {
                url: config?.url,
                method: config?.method,
                status: response?.status,
                statusText: response?.statusText,
                message: responseData?.message || error.message,
                code: responseData?.code || 'UNKNOWN_ERROR'
            });
        }

        // Obsługa błędów autoryzacji
        if (response?.status === 401) {
            const responseData = response.data as any;
            const errorCode = responseData?.code;

            if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
                console.warn('🔐 Token expired or invalid, clearing auth data');

                // Wyczyść dane auth
                localStorage.removeItem('token');
                localStorage.removeItem('auth');
                localStorage.removeItem('user');

                // Tylko przekieruj jeśli nie jesteśmy na stronie logowania/rejestracji
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/login') &&
                    !currentPath.includes('/register') &&
                    !currentPath.includes('/auth')) {

                    setTimeout(() => {
                        window.location.href = '/login?session=expired';
                    }, 1500);
                }
            }
        }

        // Obsługa błędów 500
        if (response?.status === 500) {
            console.error('🔥 Server error:', response.data);

            // Nie pokazuj pełnych błędów serwera użytkownikowi
            const responseData = response.data as any;
            if (responseData && responseData.error) {
                error.message = 'Wewnętrzny błąd serwera. Spróbuj ponownie później.';
            }
        }

        // Obsługa błędów 404
        if (response?.status === 404) {
            console.error('🔍 Resource not found:', config?.url);
        }

        // Obsługa timeout
        if (error.code === 'ECONNABORTED') {
            error.message = 'Przekroczono czas oczekiwania. Sprawdź połączenie internetowe.';
        }

        // Obsługa problemów z siecią
        if (!response && error.request) {
            error.message = 'Problem z połączeniem internetowym. Sprawdź swoje połączenie.';
        }

        return Promise.reject(error);
    }
);

// 6. Typy dla API response
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    code?: string;
}

// 7. Helper funkcje dla API
export const apiHelpers = {
    get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.get<T>(url, config);
        return response.data;
    },

    post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.post<T>(url, data, config);
        return response.data;
    },

    put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.put<T>(url, data, config);
        return response.data;
    },

    delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.delete<T>(url, config);
        return response.data;
    },

    patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.patch<T>(url, data, config);
        return response.data;
    }
};

// 8. Funkcja do bezpiecznego wykonania requestów z obsługą błędów
export const safeRequest = async <T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    defaultError = 'Wystąpił błąd podczas komunikacji z serwerem'
): Promise<ApiResponse<T>> => {
    try {
        const response = await requestFn();
        const responseData = response.data as any;
        return {
            success: true,
            data: response.data,
            message: responseData?.message
        };
    } catch (error: any) {
        console.error('Request error:', error);
        const responseData = error.response?.data as any;

        return {
            success: false,
            message: responseData?.message || error.message || defaultError,
            error: responseData?.error || error.message,
            code: responseData?.code || 'REQUEST_ERROR'
        };
    }
};

// 9. Eksport pomocniczych funkcji autoryzacji
export const authHelpers = {
    getToken,
    setToken: (token: string): void => {
        localStorage.setItem('token', token);
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Token saved to localStorage');
        }
    },
    clearToken: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        localStorage.removeItem('user');

        // Usuń nagłówek Authorization
        delete api.defaults.headers.common['Authorization'];

        if (process.env.NODE_ENV === 'development') {
            console.log('🧹 Auth data cleared');
        }
    },
    getUser: (): any => {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },
    setUser: (user: any): void => {
        try {
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    },
    isAuthenticated: (): boolean => {
        const token = getToken();
        return !!token && token.length > 10; // Podstawowa walidacja tokenu
    },
    logout: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];

        // Przekieruj do logowania
        window.location.href = '/login';
    }
};

export default api;