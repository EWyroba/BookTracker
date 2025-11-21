import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import React, { useState, useEffect } from 'react'; // DODAJ useEffect
import { booksAPI } from '../../services/api';
import BookCard from '../books/BookCard'; // DODAJ import BookCard

interface ProgressFillProps {
    $progress: number;
}

const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const WelcomeSection = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryDark});
  padding: ${props => props.theme.spacing.xxl};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.xxl};
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: ${props => props.theme.spacing.md};
  font-weight: 700;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xxl};
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.theme.colors.primary}20;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.md};

  svg {
    font-size: 1.5rem;
    color: ${props => props.theme.colors.primary};
  }
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

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xxl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
`;

const SectionLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

// Zmieniamy nazwę lokalnego komponentu na DashboardBookCard
const DashboardBookCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const BookCover = styled.img`
  width: 100%;
  height: 240px;
  object-fit: cover;
  background: ${props => props.theme.colors.surfaceLight};
`;

const BookInfo = styled.div`
  padding: ${props => props.theme.spacing.md};
`;

const BookTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.xs};
  line-height: 1.3;
`;

const BookAuthor = styled.p`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  height: 4px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  margin-top: ${props => props.theme.spacing.sm};
  overflow: hidden;
`;

const ProgressFill = styled.div<ProgressFillProps>`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        readingGoal: 0,
        pagesRead: 0,
        readingTime: 0
    });
    const [currentlyReading, setCurrentlyReading] = useState<any[]>([]);
    const [recentBooks, setRecentBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Pobierz dane z API
    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Pobierz statystyki
            const statsResponse = await booksAPI.get('/stats/dashboard');
            const statsData = statsResponse.data;

            // Pobierz książki
            const booksResponse = await booksAPI.get('/books');
            const allBooks = booksResponse.data.books;

            // Aktualizuj statystyki
            setStats({
                totalBooks: statsData.overview?.booksRead || 0,
                readingGoal: 52, // Możesz pobrać z API później
                pagesRead: statsData.overview?.totalPages || 0,
                readingTime: statsData.overview?.readingTime || 0
            });

            // Filtruj książki aktualnie czytane
            const currentlyReadingBooks = allBooks.filter((book: any) =>
                book.status === 'aktualnie_czytam'
            ).slice(0, 4);

            // Filtruj ostatnio przeczytane książki
            const readBooks = allBooks.filter((book: any) =>
                book.status === 'przeczytana'
            ).sort((a: any, b: any) => {
                // Sortuj po dacie zakończenia (najnowsze pierwsze)
                return new Date(b.data_zakonczenia).getTime() - new Date(a.data_zakonczenia).getTime();
            }).slice(0, 4);

            setCurrentlyReading(currentlyReadingBooks);
            setRecentBooks(readBooks);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <DashboardContainer>
                <div className="container">
                    <LoadingState>
                        <Icon name="FiLoader" size={48} />
                        <div style={{ marginTop: '1rem' }}>Ładowanie dashboardu...</div>
                    </LoadingState>
                </div>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            <div className="container">
                <WelcomeSection>
                    <WelcomeTitle>Witaj w BookTracker!</WelcomeTitle>
                    <WelcomeSubtitle>
                        Śledź swoje postępy w czytaniu, odkrywaj nowe książki i osiągaj cele czytelnicze
                    </WelcomeSubtitle>
                </WelcomeSection>

                <StatsGrid>
                    <StatCard>
                        <StatIcon>
                            <Icon name="FiBook" />
                        </StatIcon>
                        <StatValue>{stats.totalBooks}</StatValue>
                        <StatLabel>Przeczytane książki</StatLabel>
                    </StatCard>

                    <StatCard>
                        <StatIcon>
                            <Icon name="FiAward" />
                        </StatIcon>
                        <StatValue>{stats.readingGoal}</StatValue>
                        <StatLabel>Cel na rok</StatLabel>
                    </StatCard>

                    <StatCard>
                        <StatIcon>
                            <Icon name="FiTrendingUp" />
                        </StatIcon>
                        <StatValue>{stats.pagesRead}</StatValue>
                        <StatLabel>Przeczytane strony</StatLabel>
                    </StatCard>

                    <StatCard>
                        <StatIcon>
                            <Icon name="FiClock" />
                        </StatIcon>
                        <StatValue>{stats.readingTime}h</StatValue>
                        <StatLabel>Czas czytania</StatLabel>
                    </StatCard>
                </StatsGrid>

                <Section>
                    <SectionHeader>
                        <SectionTitle>Aktualnie czytane</SectionTitle>
                        <SectionLink to="/books">Zobacz wszystkie</SectionLink>
                    </SectionHeader>

                    {currentlyReading.length > 0 ? (
                        <BooksGrid>
                            {currentlyReading.map(book => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    onStatusChange={fetchDashboardData} // Odśwież po zmianie statusu
                                />
                            ))}
                        </BooksGrid>
                    ) : (
                        <EmptyState>
                            <p>Nie masz aktualnie czytanych książek.</p>
                            <Link to="/search" style={{ color: '#00b4db', marginTop: '0.5rem', display: 'block' }}>
                                Znajdź nową książkę →
                            </Link>
                        </EmptyState>
                    )}
                </Section>

                <Section>
                    <SectionHeader>
                        <SectionTitle>Ostatnio przeczytane</SectionTitle>
                        <SectionLink to="/books?status=przeczytana">Zobacz wszystkie</SectionLink>
                    </SectionHeader>

                    {recentBooks.length > 0 ? (
                        <BooksGrid>
                            {recentBooks.map(book => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    onStatusChange={fetchDashboardData}
                                />
                            ))}
                        </BooksGrid>
                    ) : (
                        <EmptyState>
                            <p>Nie masz jeszcze przeczytanych książek.</p>
                        </EmptyState>
                    )}
                </Section>
            </div>
        </DashboardContainer>
    );
};

// Dodaj brakujące styled components:
const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
`;

export default Dashboard;