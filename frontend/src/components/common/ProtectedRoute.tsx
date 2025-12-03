// src/components/auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background}, ${props => props.theme.colors.surface});
  gap: ${props => props.theme.spacing.lg};
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid ${props => props.theme.colors.border};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
  text-align: center;
`;

const SessionExpiredMessage = styled.div`
  background: ${props => props.theme.colors.warning}20;
  border: 1px solid ${props => props.theme.colors.warning};
  color: ${props => props.theme.colors.warning};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin: ${props => props.theme.spacing.lg} auto;
  max-width: 400px;
  text-align: center;
  font-size: 0.9rem;
`;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           children,
                                                           requireAuth = true,
                                                           redirectTo = '/login'
                                                       }) => {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sessionExpired, setSessionExpired] = useState(false);
    const [internalLoading, setInternalLoading] = useState(true);

    // Sprawdź czy sesja wygasła z query params
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const hasSessionExpired = searchParams.get('session_expired') === 'true';

        if (hasSessionExpired) {
            console.log('Session expired detected from URL');
            setSessionExpired(true);

            // Wyczyść query param po wykryciu
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('session_expired');
            const newPath = `${location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;

            // Zamień historię bez przekierowania
            window.history.replaceState({}, '', newPath);
        }
    }, [location.search, location.pathname]);

    // Obsługa stanu ładowania
    useEffect(() => {
        if (!authLoading) {
            // Małe opóźnienie dla płynniejszej animacji
            const timer = setTimeout(() => {
                setInternalLoading(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [authLoading]);

    // Jeśli nie wymagamy autoryzacji (np. dla stron publicznych)
    if (!requireAuth) {
        return <>{children}</>;
    }

    // Stan ładowania
    if (authLoading || internalLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>
                    {authLoading ? 'Weryfikacja sesji...' : 'Ładowanie...'}
                </LoadingText>
            </LoadingContainer>
        );
    }

    // Sprawdzenie autoryzacji
    if (!isAuthenticated || !user) {
        console.log('User not authenticated, redirecting to login');

        // Przygotuj stan do przekierowania
        const redirectState = {
            from: location.pathname !== '/login' ? location : undefined,
            message: sessionExpired
                ? 'Twoja sesja wygasła. Zaloguj się ponownie.'
                : 'Musisz być zalogowany, aby uzyskać dostęp do tej strony.'
        };

        return <Navigate to={redirectTo} state={redirectState} replace />;
    }

    // Wyświetl komunikat o wygasłej sesji jeśli był
    if (sessionExpired) {
        return (
            <>
                <SessionExpiredMessage>
                    Twoja poprzednia sesja wygasła. Zalogowano ponownie pomyślnie.
                </SessionExpiredMessage>
                {children}
            </>
        );
    }

    // Użytkownik jest zalogowany - wyświetl zawartość
    return <>{children}</>;
};

// Wersja dla odwrotnego przypadku (kiedy użytkownik jest już zalogowany)
export const GuestRoute: React.FC<ProtectedRouteProps> = ({
                                                              children,
                                                              redirectTo = '/dashboard'
                                                          }) => {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const location = useLocation();
    const [internalLoading, setInternalLoading] = useState(true);

    // Obsługa stanu ładowania
    useEffect(() => {
        if (!authLoading) {
            const timer = setTimeout(() => {
                setInternalLoading(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [authLoading]);

    // Stan ładowania
    if (authLoading || internalLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Weryfikacja...</LoadingText>
            </LoadingContainer>
        );
    }

    // Jeśli użytkownik jest już zalogowany, przekieruj na dashboard
    if (isAuthenticated && user) {
        console.log('User already authenticated, redirecting to dashboard');

        // Sprawdź czy próbujemy przejść na stronę logowania/rejestracji
        const isAuthPage = ['/login', '/register'].includes(location.pathname);

        if (isAuthPage) {
            return <Navigate to={redirectTo} replace />;
        }
    }

    // Użytkownik nie jest zalogowany - wyświetl zawartość
    return <>{children}</>;
};

export default ProtectedRoute;