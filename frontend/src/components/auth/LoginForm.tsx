// src/components/auth/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../common/Icon';
import api from '../../services/api';

interface SubmitButtonProps {
    $loading?: boolean;
}

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background}, ${props => props.theme.colors.surface});
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl} 0;
`;

const LoginCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xxl};
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${props => props.theme.spacing.sm};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} 3rem;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: none;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  background: none;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  padding: 0;
  border: none;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const SubmitButton = styled.button<SubmitButtonProps>`
  background: ${props => props.$loading ? props.theme.colors.textMuted : props.theme.colors.primary};
  color: white;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  border: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}20;
  border: 1px solid ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.9rem;
  text-align: center;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
  margin: ${props => props.theme.spacing.lg} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.colors.border};
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;

  a {
    color: ${props => props.theme.colors.primary};
    font-weight: 500;
    margin-left: ${props => props.theme.spacing.xs};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoginForm: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    interface LocationState {
        from?: {
            pathname: string;
        };
        message?: string;
    }

    // Sprawdź czy już jesteśmy zalogowani
    useEffect(() => {
        if (!authLoading && isAuthenticated && !autoLoginAttempted) {
            console.log('Already authenticated, redirecting...');
            const state = location.state as LocationState;
            const from = state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, location, autoLoginAttempted]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Wypełnij wszystkie pola');
            return;
        }

        setLoading(true);
        setError('');
        setAutoLoginAttempted(true);

        try {
            // Najpierw wyślij żądanie logowania do API
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            // Pobierz token i dane użytkownika z odpowiedzi
            const { token, user } = response.data;

            console.log('Login API response received:', { token, user });

            // Teraz wywołaj funkcję login z AuthContext
            await login(token, user);

            // Po udanym logowaniu, przekieruj na poprzednią stronę lub dashboard
            const state = location.state as LocationState;
            const from = state?.from?.pathname || '/dashboard';

            console.log('Redirecting to:', from);
            navigate(from, { replace: true });

        } catch (err: any) {
            console.error('Login error:', err);

            let errorMessage = 'Wystąpił błąd podczas logowania';

            if (err.response) {
                if (err.response.status === 400) {
                    errorMessage = err.response.data.message || 'Nieprawidłowy email lub hasło';
                } else if (err.response.status === 401) {
                    errorMessage = 'Nieprawidłowe dane logowania';
                } else if (err.response.status === 500) {
                    errorMessage = 'Błąd serwera. Spróbuj ponownie później.';
                }
            } else if (err.request) {
                errorMessage = 'Brak odpowiedzi z serwera. Sprawdź połączenie.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Pokaż wiadomość z przekierowania
    const state = location.state as LocationState;
    const redirectMessage = state?.message;

    return (
        <LoginContainer>
            <LoginCard>
                <Logo>
                    <h1>
                        <Icon name="FiBook" />
                        BookTracker
                    </h1>
                    <p>Zaloguj się do swojego konta</p>
                </Logo>

                {redirectMessage && (
                    <div style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {redirectMessage}
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <InputWrapper>
                            <InputIcon>
                                <Icon name="FiMail" />
                            </InputIcon>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="wpisz@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading || authLoading}
                                required
                            />
                        </InputWrapper>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="password">Hasło</Label>
                        <InputWrapper>
                            <InputIcon>
                                <Icon name="FiLock" />
                            </InputIcon>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Twoje hasło"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading || authLoading}
                                required
                            />
                            <PasswordToggle
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading || authLoading}
                            >
                                <Icon name={showPassword ? 'FiEyeOff' : 'FiEye'} />
                            </PasswordToggle>
                        </InputWrapper>
                    </FormGroup>

                    <SubmitButton
                        type="submit"
                        $loading={loading || authLoading}
                        disabled={loading || authLoading}
                    >
                        {(loading || authLoading) ? (
                            <>
                                <LoadingSpinner />
                                {authLoading ? 'Sprawdzanie...' : 'Logowanie...'}
                            </>
                        ) : (
                            'Zaloguj się'
                        )}
                    </SubmitButton>
                </Form>

                <Divider>lub</Divider>

                <RegisterLink>
                    Nie masz konta?
                    <Link to="/register">Zarejestruj się</Link>
                </RegisterLink>
            </LoginCard>
        </LoginContainer>
    );
};

export default LoginForm;