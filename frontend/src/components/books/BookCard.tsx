import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import { Book } from '../../types';
import { booksAPI } from '../../services/api';

interface ProgressFillProps {
    $progress: number;
}

interface StatusBadgeProps {
    $status: string;
}

interface StatusButtonProps {
    $active?: boolean;
}

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
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.warning};
  font-size: 0.9rem;
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
    switch (props.$status) {
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
  width: ${props => props.$progress}%;
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
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.textSecondary};
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

interface BookCardProps {
    book: Book;
    onStatusChange: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onStatusChange }) => {
    const [updating, setUpdating] = useState(false);
    const progress = book.aktualna_strona && book.liczba_stron
        ? Math.round((book.aktualna_strona / book.liczba_stron) * 100)
        : 0;

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            await booksAPI.post(`/books/${book.id}/status`, {
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

    // Funkcja do formatowania autorów
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
                <StatusBadge $status={book.status}>
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

                {/* POPRAWIONE: Używamy funkcji formatAuthors */}
                <BookAuthor>{formatAuthors(book.autorzy)}</BookAuthor>

                <BookMeta>
                    {book.ocena && (
                        <Rating>
                            <Icon name="FiStar" />
                            <span>{book.ocena}</span>
                        </Rating>
                    )}

                    {book.liczba_stron && (
                        <Pages>
                            <Icon name="FiBookOpen" />
                            <span>{book.liczba_stron} str.</span>
                        </Pages>
                    )}
                </BookMeta>

                <StatusButtons>
                    <StatusButton
                        onClick={() => handleStatusChange('chce_przeczytac')}
                        disabled={updating}
                        $active={book.status === 'chce_przeczytac'}
                    >
                        Chcę przeczytać
                    </StatusButton>
                    <StatusButton
                        onClick={() => handleStatusChange('aktualnie_czytam')}
                        disabled={updating}
                        $active={book.status === 'aktualnie_czytam'}
                    >
                        Czytam
                    </StatusButton>
                    <StatusButton
                        onClick={() => handleStatusChange('przeczytana')}
                        disabled={updating}
                        $active={book.status === 'przeczytana'}
                    >
                        Przeczytana
                    </StatusButton>
                </StatusButtons>
            </BookInfo>

            {(book.status === 'aktualnie_czytam' && progress > 0) && (
                <ProgressSection>
                    <ProgressInfo>
                        <span>Postęp</span>
                        <span>{progress}%</span>
                    </ProgressInfo>
                    <ProgressBar>
                        <ProgressFill $progress={progress} />
                    </ProgressBar>
                </ProgressSection>
            )}
        </Card>
    );
};

export default BookCard;