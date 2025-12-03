import axios from 'axios';

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
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000, // Zwiększony timeout
    withCredentials: false
});

// 4. Interceptor requestów
api.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            if (process.env.NODE_ENV === 'development') {
                console.log(`📤 ${config.method?.toUpperCase()} ${config.url} [with token]`);
            }
        } else if (process.env.NODE_ENV === 'development') {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url} [no token]`);
        }

        // Logowanie danych w development
        if (config.data && process.env.NODE_ENV === 'development') {
            console.log('📝 Request data:', config.data);
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
    (response) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`📥 ${response.status} ${response.config.url}`, response.data);
        }
        return response;
    },
    (error) => {
        const { config, response } = error;

        if (process.env.NODE_ENV === 'development') {
            console.error('❌ API Error:', {
                url: config?.url,
                method: config?.method,
                status: response?.status,
                message: response?.data?.message || error.message,
                code: response?.data?.code || 'UNKNOWN_ERROR'
            });
        }

        // Obsługa błędów autoryzacji
        if (response?.status === 401) {
            const errorCode = response.data?.code;

            if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
                console.warn('🔐 Token expired or invalid, clearing auth data');

                // Wyczyść dane auth
                localStorage.removeItem('token');
                localStorage.removeItem('auth');
                localStorage.removeItem('user');

                // Tylko przekieruj jeśli nie jesteśmy na stronie logowania
                if (!window.location.pathname.includes('/login') &&
                    !window.location.pathname.includes('/register')) {
                    setTimeout(() => {
                        window.location.href = '/login?session=expired';
                    }, 1000);
                }
            }
        }

        // Obsługa błędów 500
        if (response?.status === 500) {
            console.error('🔥 Server error:', response.data);
        }

        return Promise.reject(error);
    }
);

// 6. Eksport głównej instancji
export default api;

// 7. Eksport pomocniczych funkcji
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
        localStorage.setItem('user', JSON.stringify(user));
    },
    isAuthenticated: (): boolean => {
        return !!getToken();
    }
};