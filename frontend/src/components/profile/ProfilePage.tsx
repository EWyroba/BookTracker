// src/components/profile/ProfilePage.tsx - POPRAWIONY PLIK
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Icon from '../common/Icon';

const ProfileContainer = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xxl};
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div<{ $src?: string }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: ${props => props.$src ? `url(${props.$src}) center/cover` : props.theme.colors.surfaceLight};
  border: 3px solid ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: ${props => props.theme.colors.textSecondary};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 120px;
    height: 120px;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-size: 2rem;
  margin-bottom: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text};
`;

const UserEmail = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const UserBio = styled.p`
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const UserMeta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;

  span {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: ${props => props.theme.spacing.xl};
  overflow-x: auto;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: none;
  border: none;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-weight: ${props => props.$active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const TabContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surfaceLight};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
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
  font-weight: 500;
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.primary};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.primaryDark};
          }
        `;
      case 'danger':
        return `
          background: ${props.theme.colors.error};
          color: white;
          
          &:hover:not(:disabled) {
            background: #d32f2f;
          }
        `;
      default:
        return `
          background: ${props.theme.colors.surfaceLight};
          color: ${props.theme.colors.text};
          border: 1px solid ${props.theme.colors.border};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.border};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}20;
  border: 1px solid ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SuccessMessage = styled.div`
  background: ${props => props.theme.colors.success}20;
  border: 1px solid ${props => props.theme.colors.success};
  color: ${props => props.theme.colors.success};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const DangerZone = styled.div`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.error}10;
  border: 1px solid ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-top: ${props => props.theme.spacing.xl};
`;

const DangerZoneTitle = styled.h3`
  color: ${props => props.theme.colors.error};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const DangerZoneText = styled.p`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.6;
`;

interface UserStats {
    booksRead: number;
    currentlyReading: number;
    totalPages: number;
    averageRating: string;
    notesCount: number;
    registrationYear: string;
}

interface User {
    id: number;
    nazwa_uzytkownika: string;
    email: string;
    nazwa_wyswietlana: string;
    url_avatara: string | null;
    bio: string | null;
    cel_czytania: number;
    data_rejestracji?: string;
}

const ProfilePage: React.FC = () => {
    const { user: authUser, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState<User | null>(authUser);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Formularz edycji profilu
    const [profileForm, setProfileForm] = useState({
        nazwa_wyswietlana: '',
        bio: '',
        cel_czytania: ''
    });

    // Formularz zmiany hasła
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Formularz avatara
    const [avatarForm, setAvatarForm] = useState({
        avatarUrl: ''
    });

    // Formularz usunięcia konta
    const [deleteForm, setDeleteForm] = useState({
        password: '',
        confirmText: ''
    });

    const fetchUserStats = async () => {
        try {
            const response = await api.get('/auth/me/stats');
            setStats(response.data.stats);
        } catch (err: any) {
            console.error('Błąd pobierania statystyk:', err);
            if (err.response?.status === 401) {
                setError('Sesja wygasła. Zaloguj się ponownie.');
            }
        }
    };

    const fetchCurrentUser = async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const response = await api.get('/auth/me');
            const updatedUser = response.data.user;

            if (!updatedUser) {
                throw new Error('Brak danych użytkownika w odpowiedzi');
            }

            setUser(updatedUser);

            // Ustaw formularz z danych z API
            setProfileForm({
                nazwa_wyswietlana: updatedUser.nazwa_wyswietlana || '',
                bio: updatedUser.bio || '',
                cel_czytania: String(updatedUser.cel_czytania || 0)
            });

            // Ustaw avatar URL jeśli istnieje
            if (updatedUser.url_avatara) {
                setAvatarForm({ avatarUrl: updatedUser.url_avatara });
            }

        } catch (err: any) {
            console.error('Błąd ładowania danych profilu:', err);

            if (err.response?.status === 401) {
                setError('Sesja wygasła. Zaloguj się ponownie.');
                setTimeout(() => {
                    logout();
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError('Nie udało się załadować danych profilu: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            if (isInitialLoad) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                // Pobierz najpierw dane użytkownika
                await fetchCurrentUser(true);

                // Potem statystyki
                await fetchUserStats();
            } catch (error) {
                console.error('Błąd ładowania danych:', error);
            }
        };

        if (authUser?.id) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [authUser?.id]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            // Walidacja nazwy wyświetlanej
            if (!profileForm.nazwa_wyswietlana.trim()) {
                throw new Error('Nazwa wyświetlana jest wymagana');
            }

            // Przygotuj dane do wysłania
            const requestData: any = {
                nazwa_wyswietlana: profileForm.nazwa_wyswietlana.trim()
            };

            // Dodaj bio tylko jeśli nie jest puste
            if (profileForm.bio.trim()) {
                requestData.bio = profileForm.bio.trim();
            } else {
                requestData.bio = null;
            }

            // Dodaj cel czytania (liczba całkowita)
            const celCzytaniaNum = profileForm.cel_czytania ?
                parseInt(profileForm.cel_czytania) : 0;

            if (!isNaN(celCzytaniaNum) && celCzytaniaNum >= 0) {
                requestData.cel_czytania = celCzytaniaNum;
            } else {
                requestData.cel_czytania = 0;
            }

            // WYSYŁAMY REQUEST
            const response = await api.put('/auth/profile', requestData);

            if (response.data && response.data.user) {
                const updatedUser = response.data.user;

                // 1. Aktualizuj stan lokalny
                setUser(updatedUser);

                // 2. Aktualizuj kontekst auth
                updateUser(updatedUser);

                // 3. Aktualizuj localStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // 4. Aktualizuj formularz z nowymi danymi
                setProfileForm({
                    nazwa_wyswietlana: updatedUser.nazwa_wyswietlana || '',
                    bio: updatedUser.bio || '',
                    cel_czytania: String(updatedUser.cel_czytania || 0)
                });

                setSuccess(response.data.message || '✅ Profil zaktualizowany pomyślnie!');

                // Ukryj komunikat po 5 sekundach
                setTimeout(() => setSuccess(''), 5000);

            } else {
                throw new Error('Nieprawidłowa odpowiedź z serwera');
            }

        } catch (err: any) {
            console.error('Aktualizacja profilu nie powiodła się:', err);

            let errorMessage = 'Wystąpił błąd podczas aktualizacji profilu';

            // Szczegółowe komunikaty błędów
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }

            // Specjalne przypadki
            if (err.response?.status === 400) {
                const errorCode = err.response.data?.code;

                switch (errorCode) {
                    case 'MISSING_DISPLAY_NAME':
                        errorMessage = 'Nazwa wyświetlana jest wymagana';
                        break;
                    case 'DISPLAY_NAME_EXISTS':
                        errorMessage = 'Ta nazwa wyświetlana jest już używana';
                        break;
                    case 'BIO_TOO_LONG':
                        errorMessage = 'Bio nie może przekraczać 500 znaków';
                        break;
                    case 'INVALID_READING_GOAL':
                        errorMessage = 'Cel czytania musi być liczbą dodatnią';
                        break;
                    default:
                        errorMessage = 'Nieprawidłowe dane. Sprawdź formularz.';
                }
            } else if (err.response?.status === 401) {
                errorMessage = 'Sesja wygasła. Zaloguj się ponownie.';
                setTimeout(() => {
                    logout();
                    window.location.href = '/login';
                }, 2000);
            } else if (err.response?.status === 404) {
                errorMessage = 'Użytkownik nie znaleziony';
            } else if (err.response?.status === 500) {
                errorMessage = 'Błąd serwera. Spróbuj ponownie za chwilę.';
            }

            setError(`❌ ${errorMessage}`);

        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Nowe hasła nie są identyczne');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('Nowe hasło musi mieć co najmniej 6 znaków');
            return;
        }

        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.put('/auth/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            setSuccess('✅ Hasło zostało zmienione pomyślnie!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Ukryj komunikat po 5 sekundach
            setTimeout(() => setSuccess(''), 5000);

        } catch (err: any) {
            console.error('Błąd zmiany hasła:', err);

            let errorMessage = 'Wystąpił błąd podczas zmiany hasła';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(`❌ ${errorMessage}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleAvatarUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.put('/auth/avatar', {
                avatarUrl: avatarForm.avatarUrl.trim() || null
            });

            if (response.data && response.data.user) {
                const updatedUser = response.data.user;
                setUser(updatedUser);
                updateUser({ url_avatara: updatedUser.url_avatara });

                setSuccess('✅ Avatar zaktualizowany pomyślnie!');

                // Ukryj komunikat po 5 sekundach
                setTimeout(() => setSuccess(''), 5000);
            }

        } catch (err: any) {
            console.error('Błąd aktualizacji avatara:', err);

            let errorMessage = 'Wystąpił błąd podczas aktualizacji avatara';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(`❌ ${errorMessage}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        if (deleteForm.confirmText !== 'USUŃ') {
            setError('Wpisz "USUŃ" aby potwierdzić usunięcie konta');
            return;
        }

        if (!window.confirm('Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna!')) {
            return;
        }

        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.delete('/auth/account', {
                data: { password: deleteForm.password }
            });

            setSuccess('✅ Konto zostało usunięte pomyślnie!');

            setTimeout(() => {
                logout();
                window.location.href = '/';
            }, 2000);

        } catch (err: any) {
            console.error('Błąd usuwania konta:', err);

            let errorMessage = 'Wystąpił błąd podczas usuwania konta';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(`❌ ${errorMessage}`);
        } finally {
            setUpdating(false);
        }
    };

    const refreshData = async () => {
        try {
            await Promise.all([
                fetchCurrentUser(false),
                fetchUserStats()
            ]);
            setSuccess('✅ Dane odświeżone pomyślnie!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Błąd odświeżania danych:', error);
        }
    };

    if (loading) {
        return (
            <ProfileContainer>
                <div className="container">
                    <LoadingState>
                        <Icon name="FiLoader" size={48} className="spin" />
                        <div style={{ marginTop: '1rem' }}>Ładowanie profilu...</div>
                    </LoadingState>
                </div>
            </ProfileContainer>
        );
    }

    if (!user) {
        return (
            <ProfileContainer>
                <div className="container">
                    <ErrorMessage style={{ textAlign: 'center', padding: '3rem' }}>
                        <Icon name="FiUserX" size={48} />
                        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                            Nie jesteś zalogowany lub sesja wygasła
                        </div>
                        <Button
                            $variant="primary"
                            onClick={() => window.location.href = '/login'}
                        >
                            <Icon name="FiLogIn" />
                            Przejdź do logowania
                        </Button>
                    </ErrorMessage>
                </div>
            </ProfileContainer>
        );
    }

    return (
        <ProfileContainer>
            <div className="container">
                <ProfileHeader>
                    <Avatar $src={user.url_avatara || undefined}>
                        {!user.url_avatara && <Icon name="FiUser" size={48} />}
                    </Avatar>

                    <UserInfo>
                        <UserName>{user.nazwa_wyswietlana || user.nazwa_uzytkownika}</UserName>
                        <UserEmail>{user.email}</UserEmail>
                        {user.bio && <UserBio>{user.bio}</UserBio>}

                        <UserMeta>
                            <span>
                                <Icon name="FiCalendar" />
                                {user.data_rejestracji ? `Dołączył: ${new Date(user.data_rejestracji).toLocaleDateString('pl-PL')}` : 'Członek'}
                            </span>
                            {user.cel_czytania > 0 && (
                                <span>
                                    <Icon name="FiTarget" />
                                    Cel: {user.cel_czytania} książek/rok
                                </span>
                            )}
                        </UserMeta>
                    </UserInfo>
                </ProfileHeader>

                {error && (
                    <ErrorMessage>
                        <Icon name="FiAlertCircle" />
                        {error}
                    </ErrorMessage>
                )}

                {success && (
                    <SuccessMessage>
                        <Icon name="FiCheckCircle" />
                        {success}
                    </SuccessMessage>
                )}

                <Tabs>
                    <Tab
                        $active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    >
                        <Icon name="FiHome" />
                        Przegląd
                    </Tab>
                    <Tab
                        $active={activeTab === 'edit'}
                        onClick={() => setActiveTab('edit')}
                    >
                        <Icon name="FiEdit" />
                        Edytuj profil
                    </Tab>
                    <Tab
                        $active={activeTab === 'password'}
                        onClick={() => setActiveTab('password')}
                    >
                        <Icon name="FiLock" />
                        Zmień hasło
                    </Tab>
                    <Tab
                        $active={activeTab === 'avatar'}
                        onClick={() => setActiveTab('avatar')}
                    >
                        <Icon name="FiImage" />
                        Avatar
                    </Tab>
                    <Tab
                        $active={activeTab === 'danger'}
                        onClick={() => setActiveTab('danger')}
                    >
                        <Icon name="FiAlertTriangle" />
                        Niebezpieczna strefa
                    </Tab>
                </Tabs>

                <TabContent>
                    {activeTab === 'overview' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0, color: 'inherit' }}>Statystyki</h2>
                                <Button
                                    $variant="secondary"
                                    onClick={refreshData}
                                    disabled={refreshing || loading}
                                >
                                    <Icon name={refreshing ? "FiLoader" : "FiRefreshCw"} className={refreshing ? "spin" : ""} />
                                    {refreshing ? 'Odświeżanie...' : 'Odśwież'}
                                </Button>
                            </div>

                            {stats ? (
                                <>
                                    <StatsGrid>
                                        <StatCard>
                                            <StatValue>{stats.booksRead}</StatValue>
                                            <StatLabel>Przeczytane książki</StatLabel>
                                        </StatCard>

                                        <StatCard>
                                            <StatValue>{stats.currentlyReading}</StatValue>
                                            <StatLabel>Aktualnie czytane</StatLabel>
                                        </StatCard>

                                        <StatCard>
                                            <StatValue>{stats.totalPages.toLocaleString()}</StatValue>
                                            <StatLabel>Przeczytane strony</StatLabel>
                                        </StatCard>

                                        <StatCard>
                                            <StatValue>{stats.averageRating}</StatValue>
                                            <StatLabel>Średnia ocena</StatLabel>
                                        </StatCard>

                                        <StatCard>
                                            <StatValue>{stats.notesCount}</StatValue>
                                            <StatLabel>Notatki</StatLabel>
                                        </StatCard>

                                        <StatCard>
                                            <StatValue>{user.cel_czytania || 0}</StatValue>
                                            <StatLabel>Cel na rok</StatLabel>
                                        </StatCard>
                                    </StatsGrid>

                                    <div style={{ marginTop: '2rem' }}>
                                        <h3 style={{ marginBottom: '1rem' }}>Informacje o koncie</h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '1rem',
                                            color: '#888'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Nazwa użytkownika</div>
                                                <div style={{ fontWeight: '600', color: 'inherit' }}>{user.nazwa_uzytkownika}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Email</div>
                                                <div style={{ fontWeight: '600', color: 'inherit' }}>{user.email}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Data rejestracji</div>
                                                <div style={{ fontWeight: '600', color: 'inherit' }}>
                                                    {user.data_rejestracji
                                                        ? new Date(user.data_rejestracji).toLocaleDateString('pl-PL')
                                                        : stats.registrationYear || 'Nieznana'
                                                    }
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Cel czytelniczy</div>
                                                <div style={{ fontWeight: '600', color: 'inherit' }}>
                                                    {user.cel_czytania > 0 ? `${user.cel_czytania} książek/rok` : 'Nieustawiony'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <LoadingState>
                                    <Icon name="FiLoader" className="spin" />
                                    Ładowanie statystyk...
                                </LoadingState>
                            )}
                        </div>
                    )}

                    {activeTab === 'edit' && (
                        <Form onSubmit={handleProfileUpdate}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'inherit' }}>Edycja profilu</h2>

                            <FormGroup>
                                <Label htmlFor="nazwa_wyswietlana">Wyświetlana nazwa *</Label>
                                <Input
                                    type="text"
                                    id="nazwa_wyswietlana"
                                    value={profileForm.nazwa_wyswietlana}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, nazwa_wyswietlana: e.target.value }))}
                                    placeholder="Twoja wyświetlana nazwa"
                                    disabled={updating}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="bio">Bio (o sobie)</Label>
                                <TextArea
                                    id="bio"
                                    value={profileForm.bio}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                                    placeholder="Opisz siebie w kilku słowach..."
                                    disabled={updating}
                                    maxLength={500}
                                />
                                <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'right' }}>
                                    {profileForm.bio.length}/500 znaków
                                </div>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="cel_czytania">Cel czytelniczy na rok</Label>
                                <Input
                                    type="number"
                                    id="cel_czytania"
                                    value={profileForm.cel_czytania}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, cel_czytania: e.target.value }))}
                                    placeholder="np. 52"
                                    min="0"
                                    max="1000"
                                    disabled={updating}
                                />
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    Ustaw ile książek chcesz przeczytać w tym roku (0 = brak celu)
                                </div>
                            </FormGroup>

                            <ButtonGroup>
                                <Button type="submit" $variant="primary" disabled={updating || !profileForm.nazwa_wyswietlana.trim()}>
                                    {updating ? (
                                        <>
                                            <Icon name="FiLoader" className="spin" />
                                            Zapisywanie...
                                        </>
                                    ) : 'Zapisz zmiany'}
                                </Button>
                                <Button
                                    type="button"
                                    $variant="secondary"
                                    onClick={() => {
                                        setProfileForm({
                                            nazwa_wyswietlana: user.nazwa_wyswietlana || '',
                                            bio: user.bio || '',
                                            cel_czytania: user.cel_czytania?.toString() || '0'
                                        });
                                        setError('');
                                        setSuccess('');
                                    }}
                                    disabled={updating}
                                >
                                    Przywróć
                                </Button>
                            </ButtonGroup>
                        </Form>
                    )}

                    {activeTab === 'password' && (
                        <Form onSubmit={handlePasswordChange}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'inherit' }}>Zmiana hasła</h2>

                            <FormGroup>
                                <Label htmlFor="currentPassword">Obecne hasło *</Label>
                                <Input
                                    type="password"
                                    id="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    placeholder="Wpisz obecne hasło"
                                    disabled={updating}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="newPassword">Nowe hasło *</Label>
                                <Input
                                    type="password"
                                    id="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                    placeholder="Minimum 6 znaków"
                                    disabled={updating}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="confirmPassword">Potwierdź nowe hasło *</Label>
                                <Input
                                    type="password"
                                    id="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="Powtórz nowe hasło"
                                    disabled={updating}
                                    required
                                />
                            </FormGroup>

                            <ButtonGroup>
                                <Button type="submit" $variant="primary" disabled={updating}>
                                    {updating ? (
                                        <>
                                            <Icon name="FiLoader" className="spin" />
                                            Zmienianie...
                                        </>
                                    ) : 'Zmień hasło'}
                                </Button>
                                <Button
                                    type="button"
                                    $variant="secondary"
                                    onClick={() => {
                                        setPasswordForm({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                        setError('');
                                        setSuccess('');
                                    }}
                                >
                                    Wyczyść
                                </Button>
                            </ButtonGroup>
                        </Form>
                    )}

                    {activeTab === 'avatar' && (
                        <Form onSubmit={handleAvatarUpdate}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'inherit' }}>Avatar</h2>

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <Avatar
                                    $src={user.url_avatara || undefined}
                                    style={{ margin: '0 auto' }}
                                >
                                    {!user.url_avatara && <Icon name="FiUser" size={48} />}
                                </Avatar>
                                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                    {user.url_avatara ? 'Obecny avatar' : 'Brak avatara'}
                                </div>
                            </div>

                            <FormGroup>
                                <Label htmlFor="avatarUrl">URL obrazka</Label>
                                <Input
                                    type="url"
                                    id="avatarUrl"
                                    value={avatarForm.avatarUrl}
                                    onChange={(e) => setAvatarForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                                    placeholder="https://example.com/avatar.jpg"
                                    disabled={updating}
                                />
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    Wklej URL obrazka (np. z imgur, gravatar). Zostaw puste aby usunąć avatar.
                                </div>
                            </FormGroup>

                            <ButtonGroup>
                                <Button type="submit" $variant="primary" disabled={updating}>
                                    {updating ? (
                                        <>
                                            <Icon name="FiLoader" className="spin" />
                                            Aktualizowanie...
                                        </>
                                    ) : avatarForm.avatarUrl ? 'Zaktualizuj avatar' : 'Usuń avatar'}
                                </Button>
                                <Button
                                    type="button"
                                    $variant="secondary"
                                    onClick={() => setAvatarForm({ avatarUrl: user.url_avatara || '' })}
                                >
                                    Przywróć
                                </Button>
                            </ButtonGroup>
                        </Form>
                    )}

                    {activeTab === 'danger' && (
                        <div>
                            <DangerZone>
                                <DangerZoneTitle>
                                    <Icon name="FiAlertTriangle" />
                                    Usunięcie konta
                                </DangerZoneTitle>

                                <DangerZoneText>
                                    <strong>Uwaga:</strong> Ta operacja jest nieodwracalna. Po usunięciu konta:
                                </DangerZoneText>

                                <ul style={{ color: '#fff', marginBottom: '1rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                                    <li>Wszystkie Twoje książki zostaną usunięte z Twojej biblioteki</li>
                                    <li>Wszystkie notatki i postępy czytania zostaną utracone</li>
                                    <li>Twoje statystyki zostaną usunięte</li>
                                    <li>Nie będziesz mógł się zalogować</li>
                                </ul>

                                <Form onSubmit={handleDeleteAccount}>
                                    <FormGroup>
                                        <Label htmlFor="deletePassword">Hasło *</Label>
                                        <Input
                                            type="password"
                                            id="deletePassword"
                                            value={deleteForm.password}
                                            onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                                            placeholder="Wpisz swoje hasło"
                                            disabled={updating}
                                            required
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label htmlFor="confirmText">Potwierdzenie *</Label>
                                        <Input
                                            type="text"
                                            id="confirmText"
                                            value={deleteForm.confirmText}
                                            onChange={(e) => setDeleteForm(prev => ({ ...prev, confirmText: e.target.value }))}
                                            placeholder='Wpisz "USUŃ" aby potwierdzić'
                                            disabled={updating}
                                            required
                                        />
                                        <div style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>
                                            Wpisz <strong>USUŃ</strong> w polu powyżej (wielkie litery)
                                        </div>
                                    </FormGroup>

                                    <ButtonGroup>
                                        <Button
                                            type="submit"
                                            $variant="danger"
                                            disabled={updating || deleteForm.confirmText !== 'USUŃ' || !deleteForm.password}
                                        >
                                            {updating ? (
                                                <>
                                                    <Icon name="FiLoader" className="spin" />
                                                    Usuwanie...
                                                </>
                                            ) : 'Usuń konto na zawsze'}
                                        </Button>
                                        <Button
                                            type="button"
                                            $variant="secondary"
                                            onClick={() => {
                                                setDeleteForm({
                                                    password: '',
                                                    confirmText: ''
                                                });
                                                setError('');
                                                setSuccess('');
                                            }}
                                        >
                                            Anuluj
                                        </Button>
                                    </ButtonGroup>
                                </Form>
                            </DangerZone>
                        </div>
                    )}
                </TabContent>
            </div>
        </ProfileContainer>
    );
};

// Dodaj style dla animacji spinnera
const style = document.createElement('style');
style.textContent = `
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default ProfilePage;