import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../common/Icon';

interface SubmitButtonProps {
    $loading?: boolean;
}

interface PasswordStrengthProps {
    $strength: number;
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
  max-width: 450px;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
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

const PasswordStrength = styled.div<PasswordStrengthProps>`
  height: 4px;
  background: ${props => {
    if (props.$strength === 0) return props.theme.colors.border;
    if (props.$strength === 1) return props.theme.colors.error;
    if (props.$strength === 2) return props.theme.colors.warning;
    return props.theme.colors.success;
  }};
  border-radius: 2px;
  margin-top: ${props => props.theme.spacing.xs};
  transition: all 0.3s ease;
`;

const PasswordHint = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
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
  margin-top: ${props => props.theme.spacing.md};
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

const LoginLink = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-top: ${props => props.theme.spacing.lg};

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

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const getPasswordStrength = (password: string): number => {
        if (password.length === 0) return 0;
        if (password.length < 6) return 1;
        if (password.length < 8) return 2;
        if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 4;
        if (/[A-Z]/.test(password) || /[0-9]/.test(password)) return 3;
        return 2;
    };

    const validateForm = (): boolean => {
        if (!formData.nazwa_uzytkownika || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Wypełnij wszystkie wymagane pola');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Hasła nie są identyczne');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Hasło musi mieć co najmniej 6 znaków');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Podaj poprawny adres email');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            await register(formData);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas rejestracji');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <RegisterContainer>
            <RegisterCard>
                <Logo>
                    <h1>
                        <Icon name="FiBook" />
                        BookTracker
                    </h1>
                    <p>Dołącz do społeczności czytelników</p>
                </Logo>

                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <FormRow>
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
                                    disabled={loading}
                                    required
                                />
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="nazwa_wyswietlana">Wyświetlana nazwa</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <Icon name="FiUser" />
                                </InputIcon>
                                <Input
                                    type="text"
                                    id="nazwa_wyswietlana"
                                    name="nazwa_wyswietlana"
                                    placeholder="Jan Kowalski"
                                    value={formData.nazwa_wyswietlana}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </InputWrapper>
                        </FormGroup>
                    </FormRow>

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
                                disabled={loading}
                                required
                            />
                        </InputWrapper>
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
                                disabled={loading}
                                required
                            />
                            <PasswordToggle
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                <Icon name={showPassword ? 'FiEyeOff' : 'FiEye'} />
                            </PasswordToggle>
                        </InputWrapper>
                        <PasswordStrength $strength={passwordStrength} />
                        <PasswordHint>
                            {formData.password && (
                                <>
                                    Siła hasła:
                                    {passwordStrength === 1 && ' Słabe'}
                                    {passwordStrength === 2 && ' Średnie'}
                                    {passwordStrength === 3 && ' Dobre'}
                                    {passwordStrength === 4 && ' Bardzo dobre'}
                                </>
                            )}
                        </PasswordHint>
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
                                disabled={loading}
                                required
                            />
                            <PasswordToggle
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
                            >
                                <Icon name={showConfirmPassword ? 'FiEyeOff' : 'FiEye'} />
                            </PasswordToggle>
                        </InputWrapper>
                    </FormGroup>

                    <SubmitButton type="submit" $loading={loading} disabled={loading}>
                        {loading ? (
                            <>
                                <LoadingSpinner />
                                Rejestracja...
                            </>
                        ) : (
                            'Zarejestruj się'
                        )}
                    </SubmitButton>
                </Form>

                <LoginLink>
                    Masz już konto?
                    <Link to="/login">Zaloguj się</Link>
                </LoginLink>
            </RegisterCard>
        </RegisterContainer>
    );
};

export default RegisterForm;