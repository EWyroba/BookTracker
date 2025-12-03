import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import Icon from '../common/Icon';

const StatsContainer = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const StatsHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatsTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatsSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
`;

const ChartCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
`;

const ChartTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text};
`;

const GoalSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const GoalTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const GoalProgress = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ProgressBar = styled.div`
  height: 12px;
  background: ${props => props.theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.$progress}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.error};
`;

const SimpleChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const ChartItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} 0;
`;

const ChartLabel = styled.span`
  min-width: 120px;
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
`;

const ChartBarContainer = styled.div`
  flex: 1;
  height: 20px;
  background: ${props => props.theme.colors.border};
  border-radius: 10px;
  overflow: hidden;
`;

const ChartBarFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  background: ${props => props.$color};
  width: ${props => props.$percentage}%;
  transition: width 0.5s ease;
  border-radius: 10px;
`;

const ChartValue = styled.span`
  min-width: 40px;
  text-align: right;
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
  color: ${props => props.theme.colors.text};
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const TimeFilter = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.lg};
`;

const AnalyticsCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
`;

// Kolory dla wykresów
const COLORS = ['#00b4db', '#0083b0', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];

interface OverviewStats {
    booksRead: number;
    currentlyReading: number;
    totalPages: number;
    readingTime: number;
    averageRating: string;
    booksPerMonth: string;
}

interface GenreStats {
    gatunek: string;
    count: number;
}

interface TimelineStats {
    period: string;
    books_read: number;
    pages_read: number;
}

interface TopRatedBook {
    tytul: string;
    autor: string;
    ocena: number;
}

interface ReadingGoal {
    goal: number;
    current: number;
    progress: number;
    remaining: number;
    monthlyProgress: any[];
    onTrack: boolean;
}

interface MonthlyStats {
    month: number;
    books_read: number;
    pages_read: number;
    avg_rating: number;
}

interface BookLength {
    length_category: string;
    count: number;
}

interface ReadingPace {
    id: number;
    tytul: string;
    liczba_stron: number;
    days_to_read: number;
    pages_per_day: number;
}

interface TopAuthor {
    autor: string;
    books_read: number;
    avg_rating: number;
}

const Charts: React.FC = () => {
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [genres, setGenres] = useState<GenreStats[]>([]);
    const [timeline, setTimeline] = useState<TimelineStats[]>([]);
    const [topRated, setTopRated] = useState<TopRatedBook[]>([]);
    const [recentBooks, setRecentBooks] = useState<any[]>([]);
    const [readingGoal, setReadingGoal] = useState<ReadingGoal | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
    const [bookLengths, setBookLengths] = useState<BookLength[]>([]);
    const [readingPace, setReadingPace] = useState<ReadingPace[]>([]);
    const [topAuthors, setTopAuthors] = useState<TopAuthor[]>([]);
    const [timeFilter, setTimeFilter] = useState<'month' | 'year' | 'all_time'>('year');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [dashboardResponse, analyticsResponse, goalsResponse] = await Promise.all([
                api.get(`/stats/dashboard?period=${timeFilter}`),
                api.get('/stats/analytics'),
                api.get('/stats/reading-goals')
            ]);

            const dashboardData = dashboardResponse.data;
            const analyticsData = analyticsResponse.data;

            setOverview(dashboardData.overview);
            setGenres(dashboardData.genres || []);
            setTimeline(dashboardData.readingTimeline || []);
            setTopRated(dashboardData.topRated || []);
            setRecentBooks(dashboardData.recentBooks || []);

            setMonthlyStats(analyticsData.monthlyStats || []);
            setBookLengths(analyticsData.bookLengths || []);
            setReadingPace(analyticsData.readingPace || []);
            setTopAuthors(analyticsData.topAuthors || []);

            setReadingGoal(goalsResponse.data);
        } catch (err: any) {
            console.error('Error fetching stats:', err);
            setError(err.response?.data?.message || 'Wystąpił błąd podczas ładowania statystyk');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [timeFilter]);

    // Oblicz maksymalne wartości dla skalowania wykresów
    const maxGenreCount = genres.length > 0 ? Math.max(...genres.map(g => g.count)) : 1;
    const maxBooksInTimeline = timeline.length > 0 ? Math.max(...timeline.map(t => t.books_read)) : 1;
    const maxMonthlyBooks = monthlyStats.length > 0 ? Math.max(...monthlyStats.map(m => m.books_read)) : 1;
    const maxBookLengthCount = bookLengths.length > 0 ? Math.max(...bookLengths.map(b => b.count)) : 1;
    const maxAuthorBooks = topAuthors.length > 0 ? Math.max(...topAuthors.map(a => a.books_read)) : 1;

    if (loading) {
        return (
            <StatsContainer>
                <div className="container">
                    <LoadingState>
                        <Icon name="FiLoader" size={48} />
                        <div style={{ marginTop: '1rem' }}>Ładowanie statystyk...</div>
                    </LoadingState>
                </div>
            </StatsContainer>
        );
    }

    if (error) {
        return (
            <StatsContainer>
                <div className="container">
                    <ErrorState>
                        <Icon name="FiAlertTriangle" size={48} />
                        <div style={{ marginTop: '1rem' }}>{error}</div>
                        <button
                            onClick={fetchStats}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                background: '#00b4db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Spróbuj ponownie
                        </button>
                    </ErrorState>
                </div>
            </StatsContainer>
        );
    }

    return (
        <StatsContainer>
            <div className="container">
                <StatsHeader>
                    <StatsTitle>Statystyki Czytania</StatsTitle>
                    <StatsSubtitle>
                        Śledź swoje postępy i odkrywaj nawyki czytelnicze
                    </StatsSubtitle>
                </StatsHeader>

                {overview && (
                    <OverviewGrid>
                        <StatCard>
                            <StatIcon>
                                <Icon name="FiBook" />
                            </StatIcon>
                            <StatValue>{overview.booksRead}</StatValue>
                            <StatLabel>Przeczytane książki</StatLabel>
                        </StatCard>

                        <StatCard>
                            <StatIcon>
                                <Icon name="FiBookOpen" />
                            </StatIcon>
                            <StatValue>{overview.currentlyReading}</StatValue>
                            <StatLabel>Aktualnie czytane</StatLabel>
                        </StatCard>

                        <StatCard>
                            <StatIcon>
                                <Icon name="FiTrendingUp" />
                            </StatIcon>
                            <StatValue>{overview.totalPages}</StatValue>
                            <StatLabel>Przeczytane strony</StatLabel>
                        </StatCard>

                        <StatCard>
                            <StatIcon>
                                <Icon name="FiClock" />
                            </StatIcon>
                            <StatValue>{overview.readingTime}</StatValue>
                            <StatLabel>Godziny czytania</StatLabel>
                        </StatCard>

                        <StatCard>
                            <StatIcon>
                                <Icon name="FiStar" />
                            </StatIcon>
                            <StatValue>{overview.averageRating}</StatValue>
                            <StatLabel>Średnia ocena</StatLabel>
                        </StatCard>

                        <StatCard>
                            <StatIcon>
                                <Icon name="FiBarChart2" />
                            </StatIcon>
                            <StatValue>{overview.booksPerMonth}</StatValue>
                            <StatLabel>Książki/miesiąc</StatLabel>
                        </StatCard>
                    </OverviewGrid>
                )}

                {readingGoal && readingGoal.goal > 0 && (
                    <GoalSection>
                        <GoalHeader>
                            <GoalTitle>Cel czytelniczy na rok</GoalTitle>
                            <div style={{
                                color: readingGoal.onTrack ? '#4caf50' : '#ff6b6b',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                {readingGoal.onTrack ? '📈 Na dobrej drodze' : '📉 Wymaga poprawy'}
                            </div>
                        </GoalHeader>
                        <GoalProgress>
                            <ProgressBar>
                                <ProgressFill $progress={readingGoal.progress} />
                            </ProgressBar>
                            <ProgressText>
                                <span>{readingGoal.current} / {readingGoal.goal} książek</span>
                                <span>{Math.round(readingGoal.progress)}%</span>
                            </ProgressText>
                        </GoalProgress>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                            Do celu pozostało: {readingGoal.remaining} książek
                        </div>
                    </GoalSection>
                )}

                <Section>
                    <SectionHeader>
                        <SectionTitle>Analityki czytania</SectionTitle>
                        <TimeFilter>
                            <FilterButton
                                $active={timeFilter === 'month'}
                                onClick={() => setTimeFilter('month')}
                            >
                                Miesiąc
                            </FilterButton>
                            <FilterButton
                                $active={timeFilter === 'year'}
                                onClick={() => setTimeFilter('year')}
                            >
                                Rok
                            </FilterButton>
                            <FilterButton
                                $active={timeFilter === 'all_time'}
                                onClick={() => setTimeFilter('all_time')}
                            >
                                Cały czas
                            </FilterButton>
                        </TimeFilter>
                    </SectionHeader>

                    <ChartsGrid>
                        {/* Wykres gatunków */}
                        {genres.length > 0 && (
                            <ChartCard>
                                <ChartTitle>Ulubione gatunki</ChartTitle>
                                <SimpleChart>
                                    {genres.map((genre, index) => (
                                        <ChartItem key={genre.gatunek}>
                                            <ChartLabel>{genre.gatunek}</ChartLabel>
                                            <ChartBarContainer>
                                                <ChartBarFill
                                                    $percentage={maxGenreCount > 0 ? (genre.count / maxGenreCount) * 100 : 0}
                                                    $color={COLORS[index % COLORS.length]}
                                                />
                                            </ChartBarContainer>
                                            <ChartValue>{genre.count}</ChartValue>
                                        </ChartItem>
                                    ))}
                                </SimpleChart>
                            </ChartCard>
                        )}

                        {/* Wykres czytania w czasie */}
                        {timeline.length > 0 && (
                            <ChartCard>
                                <ChartTitle>Czytanie w czasie ({timeFilter})</ChartTitle>
                                <SimpleChart>
                                    {timeline.map((item, index) => (
                                        <ChartItem key={item.period}>
                                            <ChartLabel>{item.period}</ChartLabel>
                                            <ChartBarContainer>
                                                <ChartBarFill
                                                    $percentage={maxBooksInTimeline > 0 ? (item.books_read / maxBooksInTimeline) * 100 : 0}
                                                    $color="#00b4db"
                                                />
                                            </ChartBarContainer>
                                            <ChartValue>{item.books_read}</ChartValue>
                                        </ChartItem>
                                    ))}
                                </SimpleChart>
                            </ChartCard>
                        )}
                    </ChartsGrid>

                    {/* Rozszerzone analityki */}
                    <AnalyticsGrid>
                        {/* Długość książek */}
                        {bookLengths.length > 0 && (
                            <AnalyticsCard>
                                <ChartTitle>Długość książek</ChartTitle>
                                <SimpleChart>
                                    {bookLengths.map((item, index) => (
                                        <ChartItem key={item.length_category}>
                                            <ChartLabel>{item.length_category}</ChartLabel>
                                            <ChartBarContainer>
                                                <ChartBarFill
                                                    $percentage={maxBookLengthCount > 0 ? (item.count / maxBookLengthCount) * 100 : 0}
                                                    $color={COLORS[(index + 2) % COLORS.length]}
                                                />
                                            </ChartBarContainer>
                                            <ChartValue>{item.count}</ChartValue>
                                        </ChartItem>
                                    ))}
                                </SimpleChart>
                            </AnalyticsCard>
                        )}

                        {/* Ulubieni autorzy */}
                        {topAuthors.length > 0 && (
                            <AnalyticsCard>
                                <ChartTitle>Ulubieni autorzy</ChartTitle>
                                <SimpleChart>
                                    {topAuthors.map((author, index) => (
                                        <ChartItem key={author.autor}>
                                            <ChartLabel title={author.autor}>
                                                {author.autor.length > 15 ? author.autor.substring(0, 15) + '...' : author.autor}
                                            </ChartLabel>
                                            <ChartBarContainer>
                                                <ChartBarFill
                                                    $percentage={maxAuthorBooks > 0 ? (author.books_read / maxAuthorBooks) * 100 : 0}
                                                    $color={COLORS[(index + 4) % COLORS.length]}
                                                />
                                            </ChartBarContainer>
                                            <ChartValue>{author.books_read}</ChartValue>
                                        </ChartItem>
                                    ))}
                                </SimpleChart>
                            </AnalyticsCard>
                        )}

                        {/* Tempo czytania */}
                        {readingPace.length > 0 && (
                            <AnalyticsCard>
                                <ChartTitle>Najszybciej przeczytane</ChartTitle>
                                <SimpleChart>
                                    {readingPace.slice(0, 5).map((book, index) => (
                                        <ChartItem key={book.id}>
                                            <ChartLabel title={book.tytul}>
                                                {book.tytul.length > 15 ? book.tytul.substring(0, 15) + '...' : book.tytul}
                                            </ChartLabel>
                                            <ChartValue>{book.pages_per_day} str/dzień</ChartValue>
                                        </ChartItem>
                                    ))}
                                </SimpleChart>
                            </AnalyticsCard>
                        )}
                    </AnalyticsGrid>
                </Section>

                {/* Najlepiej oceniane książki */}
                {topRated.length > 0 && (
                    <Section>
                        <SectionHeader>
                            <SectionTitle>Najlepiej oceniane książki</SectionTitle>
                        </SectionHeader>
                        <BooksGrid>
                            {topRated.map((book, index) => (
                                <StatCard key={index}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        {book.tytul}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                        {book.autor}
                                    </div>
                                    <div style={{
                                        color: '#ffd700',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Icon name="FiStar" size={14} />
                                        {book.ocena}/5
                                    </div>
                                </StatCard>
                            ))}
                        </BooksGrid>
                    </Section>
                )}

                {/* Komunikat jeśli brak danych */}
                {(!overview || (genres.length === 0 && timeline.length === 0)) && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <Icon name="FiBook" size={48} />
                        <h3 style={{ margin: '1rem 0 0.5rem' }}>Brak danych statystycznych</h3>
                        <p>Dodaj książki i oznacz je jako przeczytane, aby zobaczyć statystyki.</p>
                    </div>
                )}
            </div>
        </StatsContainer>
    );
};

export default Charts;