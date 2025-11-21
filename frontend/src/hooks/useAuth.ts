import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Re-export the hook from AuthContext for convenience
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Default export for consistency
export default useAuth;