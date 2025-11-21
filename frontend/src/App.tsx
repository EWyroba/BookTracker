import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import Dashboard from './components/dashboard/Dashboard';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import BooksPage from './components/books/BooksPage';
import SearchPage from './components/search/SearchPage';
import Charts from './components/stats/Charts';
import BookDetailsPage from './components/books/BookDetailsPage';


// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: theme.colors.text
            }}>
                Ładowanie...
            </div>
        );
    }

    return user ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: theme.colors.text
            }}>
                Ładowanie...
            </div>
        );
    }

    return !user ? <>{children}</> : <Navigate to="/" />;
};

function AppContent() {
    return (
        <Router>
            <div className="App">
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/books" element={
                            <ProtectedRoute>
                                <BooksPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/books/:id" element={
                            <ProtectedRoute>
                                <BookDetailsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/search" element={
                            <ProtectedRoute>
                                <SearchPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/stats" element={
                            <ProtectedRoute>
                                <Charts />
                            </ProtectedRoute>
                        } />
                        <Route path="/login" element={
                            <PublicRoute>
                                <LoginForm />
                            </PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute>
                                <RegisterForm />
                            </PublicRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;