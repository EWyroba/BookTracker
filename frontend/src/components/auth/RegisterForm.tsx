// src/components/auth/RegisterForm.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../common/Icon';
import api from '../../services/api';

interface SubmitButtonProps {
    $loading?: boolean;
}

const RegisterContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background}, ${props => props.theme.colors.surface});
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl} 0;
`;

const RegisterCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xxl};
  width: 100%;
  max-width: 500px;
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

const SuccessMessage = styled.div`
  background: ${props => props.theme.colors.success}20;
  border: 1px solid ${props => props.theme.colors.success};
  color: ${props => props.theme.colors.success};
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

const LoginLink = styled.div`
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

const PasswordRequirements = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textMuted};
  margin-top: ${props => props.theme.spacing.xs};

  ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  li.valid {
    color: ${props => props.theme.colors.success};
  }

  li.invalid {
    color: ${props => props.theme.colors.error};
  }
`;

const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState({
        nazwa_uzytkownika: '',
        email: '',
        password: '',
        confirmPassword: '',
        nazwa_wyswietlana: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { register, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Sprawdź czy już jesteśmy zalogowani
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            console.log('Already authenticated, redirecting to dashboard...');
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Walidacja
        if (!formData.nazwa_uzytkownika || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Wypełnij wszystkie wymagane pola');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Hasła nie są identyczne');
            return;
        }

        if (formData.password.length < 6) {
            setError('Hasło musi mieć co najmniej 6 znaków');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Podaj poprawny adres email');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Wyślij żądanie rejestracji do API
            const response = await api.post('/auth/register', {
                nazwa_uzytkownika: formData.nazwa_uzytkownika,
                email: formData.email,
                password: formData.password,
                nazwa_wyswietlana: formData.nazwa_wyswietlana || formData.nazwa_uzytkownika
            });

            const { token, user } = response.data;

            console.log('Registration API response received:', { token, user });

            // Użyj funkcji register z AuthContext
            await register(token, user);

            setSuccess('Rejestracja udana! Przekierowuję...');

            // Przekieruj po 1.5 sekundy
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (err: any) {
            console.error('Registration error:', err);

            let errorMessage = 'Wystąpił błąd podczas rejestracji';

            if (err.response) {
                if (err.response.status === 400) {
                    errorMessage = err.response.data.message || 'Użytkownik już istnieje';
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

    return (
        <RegisterContainer>
            <RegisterCard>
                <Logo>
                    <h1>
                        <Icon name="FiBook" />
                        BookTracker
                    </h1>
                    <p>Zarejestruj nowe konto</p>
                </Logo>

                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    {success && <SuccessMessage>{success}</SuccessMessage>}

                    <FormGroup>
                        <Label htmlFor="nazwa_uzytkownika">Nazwa użytkownika *</Label>
                        <InputWrapper>
                            <InputIcon>
                                <Icon name="FiUser" />
                            </InputIcon>
                            <Input
                                type="text"
                                id="nazwa_uzytkownika"
                                name="nazwa_uzytkownika"
                                placeholder="jankowalski"
                                value={formData.nazwa_uzytkownika}
                                onChange={handleChange}
                                disabled={loading || authLoading}
                                required
                            />
                        </InputWrapper>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="email">Email *</Label>
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
                        <Label htmlFor="nazwa_wyswietlana">Nazwa wyświetlana</Label>
                        <InputWrapper>
                            <InputIcon>
                                <Icon name="FiUserCheck" />
                            </InputIcon>
                            <Input
                                type="text"
                                id="nazwa_wyswietlana"
                                name="nazwa_wyswietlana"
                                placeholder="Jan Kowalski (opcjonalnie)"
                                value={formData.nazwa_wyswietlana}
                                onChange={handleChange}
                                disabled={loading || authLoading}
                            />
                        </InputWrapper>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            Jeśli nie podasz, użyjemy nazwy użytkownika
                        </div>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="password">Hasło *</Label>
                        <InputWrapper>
                            <InputIcon>
                                <Icon name="FiLock" />
                            </InputIcon>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Minimum 6 znaków"
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

                    <FormGroup>
                        <Label htmlFor="confirmPassword">Potwierdź hasło *</Label>
                        <InputWrapper>
                            <InputIcon>
                                <Icon name="FiLock" />
                            </InputIcon>
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Powtórz hasło"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading || authLoading}
                                required
                            />
                            <PasswordToggle
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading || authLoading}
                            >
                                <Icon name={showConfirmPassword ? 'FiEyeOff' : 'FiEye'} />
                            </PasswordToggle>
                        </InputWrapper>
                    </FormGroup>

                    <PasswordRequirements>
                        <strong>Wymagania hasła:</strong>
                        <ul>
                            <li className={formData.password.length >= 6 ? 'valid' : 'invalid'}>
                                Co najmniej 6 znaków
                            </li>
                            <li className={formData.password === formData.confirmPassword && formData.confirmPassword !== '' ? 'valid' : 'invalid'}>
                                Hasła muszą być identyczne
                            </li>
                        </ul>
                    </PasswordRequirements>

                    <SubmitButton
                        type="submit"
                        $loading={loading || authLoading}
                        disabled={loading || authLoading}
                    >
                        {(loading || authLoading) ? (
                            <>
                                <LoadingSpinner />
                                {authLoading ? 'Sprawdzanie...' : 'Rejestracja...'}
                            </>
                        ) : (
                            'Zarejestruj się'
                        )}
                    </SubmitButton>
                </Form>

                <Divider>lub</Divider>

                <LoginLink>
                    Masz już konto?
                    <Link to="/login">Zaloguj się</Link>
                </LoginLink>
            </RegisterCard>
        </RegisterContainer>
    );
};

export default RegisterForm;