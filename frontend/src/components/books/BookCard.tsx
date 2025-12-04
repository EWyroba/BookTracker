import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import { Book } from '../../types';
import api from '../../services/api';

// INTERFACE DEFINITIONS
// INTERFACE DEFINITIONS
interface ProgressFillProps {
    progress: number;
}

interface StatusBadgeProps {
    status: string;
}

interface StatusButtonProps {
    active?: boolean;
}

interface StarProps {
    active: boolean;
    disabled?: boolean;
}

// STYLED COMPONENTS
const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: ${props => props.theme.colors.primary};
  }
`;

const BookCover = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
  background: ${props => props.theme.colors.surfaceLight};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const BookInfo = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const BookTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.xs};
  line-height: 1.3;

  a {
    color: ${props => props.theme.colors.text};
    text-decoration: none;

    &:hover {
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const BookAuthor = styled.p`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const BookMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.warning};
  font-size: 0.9rem;
`;

const AverageRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.success};
  font-size: 0.8rem;
  background: ${props => props.theme.colors.surfaceLight};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
`;

const RatingCount = styled.span`
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: ${props => props.theme.spacing.xs};
`;

const Pages = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
`;

const StatusBadge = styled.div<StatusBadgeProps>`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'przeczytana':
        return props.theme.colors.success;
      case 'aktualnie_czytam':
        return props.theme.colors.primary;
      case 'chce_przeczytac':
        return props.theme.colors.warning;
      default:
        return props.theme.colors.textMuted;
    }
  }};
  color: #fff;
`;

const ProgressSection = styled.div`
  padding: 0 ${props => props.theme.spacing.lg} ${props => props.theme.spacing.lg};
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  height: 6px;
  background: ${props => props.theme.colors.border};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<ProgressFillProps>`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const StatusButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const StatusButton = styled.button<StatusButtonProps>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.error};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: ${props => props.theme.spacing.sm};

  &:hover:not(:disabled) {
    background: ${props => '#bd2130'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RatingSection = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
`;

const RatingLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Star = styled.button<StarProps>`
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.warning : props.theme.colors.textMuted};
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  padding: 2px;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.warning};
    transform: scale(1.2);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const LoadingText = styled.div`
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
  text-align: center;
`;

interface BookCardProps {
    book: Book;
    onStatusChange: () => void;
    onRemoveFromLibrary?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onStatusChange, onRemoveFromLibrary }) => {
    const [updating, setUpdating] = useState(false);
    const [ratingBook, setRatingBook] = useState(false);
    const [rating, setRating] = useState<number | null>(book.ocena || null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [removing, setRemoving] = useState(false);

    const progress = book.aktualna_strona && book.liczba_stron
        ? Math.round((book.aktualna_strona / book.liczba_stron) * 100)
        : 0;

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            await api.post(`/books/${book.id}/status`, {
                status: newStatus,
                aktualna_strona: book.aktualna_strona || 0
            });
            onStatusChange();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleRatingSubmit = async () => {
        if (!rating) return;

        setRatingBook(true);
        try {
            await api.post(`/books/${book.id}/rating`, {
                ocena: rating,
                recenzja: ''
            });
            onStatusChange();
        } catch (error) {
            console.error('Error updating rating:', error);
        } finally {
            setRatingBook(false);
        }
    };

    const handleRemoveFromLibrary = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę książkę z biblioteki?')) {
            return;
        }

        setRemoving(true);
        try {
            await api.delete(`/books/${book.id}/remove-from-library`);
            if (onRemoveFromLibrary) {
                onRemoveFromLibrary();
            }
        } catch (error) {
            console.error('Error removing book from library:', error);
            alert('Błąd podczas usuwania książki z biblioteki');
        } finally {
            setRemoving(false);
        }
    };

    const formatAuthors = (autorzy: string[] | string | undefined): string => {
        if (!autorzy) return 'Autor nieznany';

        if (Array.isArray(autorzy)) {
            return autorzy.length > 0 ? autorzy.join(', ') : 'Autor nieznany';
        }

        if (typeof autorzy === 'string') {
            return autorzy || 'Autor nieznany';
        }

        return 'Autor nieznany';
    };

    return (
        <Card>
            {book.status && (
                <StatusBadge status={book.status}>
                    {book.status === 'przeczytana' && 'Przeczytana'}
                    {book.status === 'aktualnie_czytam' && 'W trakcie'}
                    {book.status === 'chce_przeczytac' && 'Planowana'}
                </StatusBadge>
            )}

            <BookCover
                src={book.url_okladki || 'https://via.placeholder.com/200x300/1a1a1a/666666?text=Brak+okładki'}
                alt={book.tytul}
            />

            <BookInfo>
                <BookTitle>
                    <Link to={`/books/${book.id}`}>{book.tytul}</Link>
                </BookTitle>

                <BookAuthor>{formatAuthors(book.autorzy)}</BookAuthor>

                <BookMeta>
                    {book.ocena ? (
                        <Rating>
                            <Icon name="FiStar" />
                            <span>Twoja ocena: {book.ocena}/5</span>
                        </Rating>
                    ) : (
                        <Rating>
                            <Icon name="FiStar" />
                            <span>Nie ocenione</span>
                        </Rating>
                    )}

                    {(book.srednia_ocena && parseFloat(book.srednia_ocena) > 0) && (
                        <AverageRating>
                            <Icon name="FiTrendingUp" />
                            <span>{book.srednia_ocena}</span>
                            <RatingCount>({book.liczba_ocen || 0})</RatingCount>
                        </AverageRating>
                    )}

                    {book.liczba_stron && (
                        <Pages>
                            <Icon name="FiBookOpen" />
                            <span>{book.liczba_stron} str.</span>
                        </Pages>
                    )}
                </BookMeta>

                {/*/!* Rating Stars *!/*/}
                {/*{book.status === 'przeczytana' && (*/}
                {/*    <div>*/}
                {/*        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>*/}
                {/*            Oceń książkę:*/}
                {/*        </div>*/}
                {/*        <RatingStars>*/}
                {/*            {[1, 2, 3, 4, 5].map((star) => (*/}
                {/*                <Star*/}
                {/*                    key={star}*/}
                {/*                    active={(hoverRating || rating || 0) >= star}*/}
                {/*                    disabled={ratingBook}*/}
                {/*                    onClick={() => {*/}
                {/*                        setRating(star);*/}
                {/*                        setTimeout(handleRatingSubmit, 300);*/}
                {/*                    }}*/}
                {/*                    onMouseEnter={() => setHoverRating(star)}*/}
                {/*                    onMouseLeave={() => setHoverRating(null)}*/}
                {/*                >*/}
                {/*                    <Icon name="FiStar" />*/}
                {/*                </Star>*/}
                {/*            ))}*/}
                {/*        </RatingStars>*/}
                {/*        {ratingBook && (*/}
                {/*            <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>*/}
                {/*                Zapisuję ocenę...*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*)}*/}

                <StatusButtons>
                    <StatusButton
                        onClick={() => handleStatusChange('chce_przeczytac')}
                        disabled={updating}
                        active={book.status === 'chce_przeczytac'}
                    >
                        Chcę przeczytać
                    </StatusButton>
                    <StatusButton
                        onClick={() => handleStatusChange('aktualnie_czytam')}
                        disabled={updating}
                        active={book.status === 'aktualnie_czytam'}
                    >
                        Czytam
                    </StatusButton>
                    <StatusButton
                        onClick={() => handleStatusChange('przeczytana')}
                        disabled={updating}
                        active={book.status === 'przeczytana'}
                    >
                        Przeczytana
                    </StatusButton>
                </StatusButtons>

                {onRemoveFromLibrary && (
                    <RemoveButton
                        onClick={handleRemoveFromLibrary}
                        disabled={removing}
                    >
                        {removing ? 'Usuwanie...' : 'Usuń z biblioteki'}
                    </RemoveButton>
                )}
            </BookInfo>

            {(book.status === 'aktualnie_czytam' && progress > 0) && (
                <ProgressSection>
                    <ProgressInfo>
                        <span>Postęp</span>
                        <span>{progress}%</span>
                    </ProgressInfo>
                    <ProgressBar>
                        <ProgressFill progress={progress} />
                    </ProgressBar>
                </ProgressSection>
            )}
        </Card>
    );
};

export default BookCard;