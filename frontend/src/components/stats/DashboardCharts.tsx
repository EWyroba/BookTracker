import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { booksAPI } from '../../services/api';

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
`;

const ChartTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text};
`;

const SimpleBarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ChartItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ChartLabel = styled.span`
  min-width: 120px;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text};
`;

const ChartBar = styled.div`
  flex: 1;
  height: 20px;
  background: ${props => props.theme.colors.border};
  border-radius: 10px;
  overflow: hidden;
`;

const ChartFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  border-radius: 10px;
  transition: width 0.5s ease;
`;

const ChartValue = styled.span`
  min-width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
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

// Kolory dla wykresów
const CHART_COLORS = [
    '#00b4db', '#0083b0', '#ff6b6b', '#4ecdc4', '#45b7d1',
    '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
];

interface GenreStats {
    gatunek: string;
    count: number;
}

interface TimelineStats {
    period: string;
    books_read: number;
    pages_read: number;
}

interface DashboardChartsProps {
    onDataUpdate: (data: any) => void;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ onDataUpdate }) => {
    const [timeFilter, setTimeFilter] = useState<'month' | 'year' | 'all_time'>('year');
    const [genres, setGenres] = useState<GenreStats[]>([]);
    const [timeline, setTimeline] = useState<TimelineStats[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChartData = async () => {
        try {
            const response = await booksAPI.get(`/stats/dashboard?period=${timeFilter}`);
            const { genres, readingTimeline } = response.data;

            setGenres(genres || []);
            setTimeline(readingTimeline || []);
            onDataUpdate(response.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, [timeFilter]);

    // Oblicz maksymalne wartości dla skalowania
    const maxGenreCount = genres.length > 0 ? Math.max(...genres.map(g => g.count)) : 1;
    const maxBooksInTimeline = timeline.length > 0 ? Math.max(...timeline.map(t => t.books_read)) : 1;

    if (loading) {
        return <div>Ładowanie wykresów...</div>;
    }

    return (
        <div>
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

            <ChartsContainer>
                {/* Wykres gatunków */}
                <ChartCard>
                    <ChartTitle>Ulubione gatunki</ChartTitle>
                    <SimpleBarChart>
                        {genres.map((genre, index) => (
                            <ChartItem key={genre.gatunek}>
                                <ChartLabel>{genre.gatunek}</ChartLabel>
                                <ChartBar>
                                    <ChartFill
                                        $width={(genre.count / maxGenreCount) * 100}
                                        $color={CHART_COLORS[index % CHART_COLORS.length]}
                                    />
                                </ChartBar>
                                <ChartValue>{genre.count}</ChartValue>
                            </ChartItem>
                        ))}
                    </SimpleBarChart>
                </ChartCard>

                {/* Wykres czytania w czasie */}
                <ChartCard>
                    <ChartTitle>Czytanie w czasie</ChartTitle>
                    <SimpleBarChart>
                        {timeline.map((item, index) => (
                            <ChartItem key={item.period}>
                                <ChartLabel>{item.period}</ChartLabel>
                                <ChartBar>
                                    <ChartFill
                                        $width={(item.books_read / maxBooksInTimeline) * 100}
                                        $color="#00b4db"
                                    />
                                </ChartBar>
                                <ChartValue>{item.books_read}</ChartValue>
                            </ChartItem>
                        ))}
                    </SimpleBarChart>
                </ChartCard>
            </ChartsContainer>
        </div>
    );
};

export default DashboardCharts;