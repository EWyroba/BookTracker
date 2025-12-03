// hooks/useAuthCheck.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useAuthCheck = (requireAuth = true) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (requireAuth && !user) {
                navigate('/login', {
                    state: {
                        message: 'Musisz być zalogowany aby uzyskać dostęp do tej strony'
                    }
                });
            } else if (!requireAuth && user) {
                navigate('/'); // Jeśli już zalogowany, przekieruj na dashboard
            }
        }
    }, [user, loading, requireAuth, navigate]);

    return { user, loading };
};