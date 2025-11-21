import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { booksAPI } from '../../services/api';
import Icon from '../common/Icon';

const SearchContainer = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
  min-height: 80vh;
`;

const SearchHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SearchTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SearchForm = styled.form`
  max-width: 600px;
  margin: 0 auto ${props => props.theme.spacing.xl};
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  padding-right: 60px;
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background: ${props => props.theme.colors.textMuted};
    cursor: not-allowed;
  }
`;

const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.textSecondary};
`;

const ResultsCount = styled.div`
  font-size: 0.9rem;
`;

const SortSelect = styled.select`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const BookCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: ${props => props.theme.colors.primary};
  }
`;

const BookCover = styled.img`
  width: 100%;
  height: 450px;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
`;

const BookTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.sm};
  line-height: 1.3;
  color: ${props => props.theme.colors.text};
`;

const BookAuthors = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const BookDescription = styled.p`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: ${props => props.theme.spacing.md};
  display: -webkit-box;
  -webkit-line-amp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BookMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const AddButton = styled.button<{ $added?: boolean }>`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.$added ? props.theme.colors.success : props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.$added ? props.theme.colors.success : props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${props => props.theme.colors.textMuted};
    cursor: not-allowed;
  }
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.xl};
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  justify-content: center;
  margin-top: ${props => props.theme.spacing.lg};
`;

const SuggestionTag = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }
`;

interface SearchResult {
    googleBooksId: string;
    existingBookId: number | null;
    tytul: string;
    autorzy: string[];
    isbn: string;
    opis: string;
    liczba_stron: number | null;
    data_wydania: string;
    wydawnictwo: string;
    gatunek: string;
    jezyk: string;
    url_okladki: string;
    previewLink: string;
    rating: number | null;
    ratingsCount: number;
}

const SearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addingBook, setAddingBook] = useState<string | null>(null);
    const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const RESULTS_PER_PAGE = 12;

    // Pobierz sugestie przy załadowaniu
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await booksAPI.get('/search/suggestions');
                setSuggestions(response.data.suggestions);
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            }
        };
        fetchSuggestions();
    }, []);

    const performSearch = useCallback(async (searchQuery: string, page: number = 0) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setTotalResults(0);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await booksAPI.get('/search', {
                params: {
                    q: searchQuery,
                    maxResults: RESULTS_PER_PAGE,
                    startIndex: page * RESULTS_PER_PAGE
                }
            });

            setResults(response.data.books || []);
            setTotalResults(response.data.totalResults || 0);
            setCurrentPage(page);

            // POPRAWIONE: Oznacz książki które już są w bibliotece
            const existingBooksArray: string[] = (response.data.books || [])
                .filter((book: SearchResult) => book.existingBookId !== null)
                .map((book: SearchResult) => book.googleBooksId);

            setAddedBooks(new Set(existingBooksArray));

        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.response?.data?.message || 'Wystąpił błąd podczas wyszukiwania');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Wyszukaj przy załadowaniu jeśli jest query w URL
    useEffect(() => {
        const urlQuery = searchParams.get('q');
        if (urlQuery) {
            setQuery(urlQuery);
            performSearch(urlQuery);
        }
    }, [searchParams, performSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ q: query.trim() });
            performSearch(query.trim());
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setSearchParams({ q: suggestion });
        performSearch(suggestion);
    };

    const handleAddBook = async (googleBooksId: string) => {
        setAddingBook(googleBooksId);
        try {
            await booksAPI.post('/search/quick-add', { googleBooksId });
            // POPRAWIONE: Aktualizacja Set z poprawnym typem
            setAddedBooks(prev => new Set([...Array.from(prev), googleBooksId]));
        } catch (err: any) {
            console.error('Error adding book:', err);
            alert(err.response?.data?.message || 'Wystąpił błąd podczas dodawania książki');
        } finally {
            setAddingBook(null);
        }
    };

    const handlePageChange = (page: number) => {
        performSearch(query, page);
    };

    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

    return (
        <SearchContainer>
            <div className="container">
                <SearchHeader>
                    <SearchTitle>Wyszukiwarka Książek</SearchTitle>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>
                        Wyszukuj książki w bazie Google Books i dodawaj je do swojej biblioteki
                    </p>
                </SearchHeader>

                <SearchForm onSubmit={handleSubmit}>
                    <SearchInput
                        type="text"
                        placeholder="Wpisz tytuł, autora, ISBN lub słowa kluczowe..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <SearchButton type="submit" disabled={loading}>
                        <Icon name="FiSearch" />
                    </SearchButton>
                </SearchForm>

                {suggestions.length > 0 && !searchParams.get('q') && (
                    <Suggestions>
                        <span style={{ color: '#666', marginRight: '1rem' }}>Popularne wyszukiwania:</span>
                        {suggestions.map((suggestion, index) => (
                            <SuggestionTag
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </SuggestionTag>
                        ))}
                    </Suggestions>
                )}

                {loading && (
                    <LoadingState>
                        <Icon name="FiLoader" size={48} />
                        <div style={{ marginTop: '1rem' }}>Wyszukiwanie książek...</div>
                    </LoadingState>
                )}

                {error && (
                    <ErrorState>
                        <Icon name="FiAlertTriangle" size={48} />
                        <div style={{ marginTop: '1rem' }}>{error}</div>
                        <button
                            onClick={() => performSearch(query)}
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
                )}

                {!loading && !error && results.length > 0 && (
                    <>
                        <ResultsInfo>
                            <ResultsCount>
                                Znaleziono {totalResults} książek dla "{query}"
                            </ResultsCount>
                        </ResultsInfo>

                        <BooksGrid>
                            {results.map((book) => (
                                <BookCard key={book.googleBooksId}>
                                    <BookCover
                                        src={book.url_okladki || 'https://via.placeholder.com/300x400/1a1a1a/666666?text=Brak+okładki'}
                                        alt={book.tytul}
                                    />

                                    <BookTitle>{book.tytul}</BookTitle>

                                    <BookAuthors>
                                        {book.autorzy.length > 0
                                            ? book.autorzy.join(', ')
                                            : 'Autor nieznany'
                                        }
                                    </BookAuthors>

                                    <BookDescription>{book.opis}</BookDescription>

                                    <BookMeta>
                    <span>
                      {book.liczba_stron ? `${book.liczba_stron} str.` : 'Brak danych'}
                    </span>
                                        <span>{book.data_wydania}</span>
                                    </BookMeta>

                                    <AddButton
                                        onClick={() => handleAddBook(book.googleBooksId)}
                                        disabled={addingBook === book.googleBooksId || addedBooks.has(book.googleBooksId)}
                                        $added={addedBooks.has(book.googleBooksId)}
                                    >
                                        {addingBook === book.googleBooksId ? (
                                            <>Dodawanie...</>
                                        ) : addedBooks.has(book.googleBooksId) ? (
                                            <>✓ W bibliotece</>
                                        ) : (
                                            <>+ Dodaj do biblioteki</>
                                        )}
                                    </AddButton>
                                </BookCard>
                            ))}
                        </BooksGrid>

                        {totalPages > 1 && (
                            <Pagination>
                                <PageButton
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                >
                                    ‹ Poprzednia
                                </PageButton>

                                {/* POPRAWIONE: Paginacja bez problemów z iteracją */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                    const page = index;
                                    return (
                                        <PageButton
                                            key={page}
                                            $active={currentPage === page}
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page + 1}
                                        </PageButton>
                                    );
                                })}

                                <PageButton
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    Następna ›
                                </PageButton>
                            </Pagination>
                        )}
                    </>
                )}

                {!loading && !error && query && results.length === 0 && (
                    <EmptyState>
                        <Icon name="FiSearch" size={48} />
                        <h3 style={{ margin: '1rem 0 0.5rem' }}>Nie znaleziono książek</h3>
                        <p>Spróbuj zmienić zapytanie wyszukiwania</p>
                    </EmptyState>
                )}

                {!loading && !error && !query && (
                    <EmptyState>
                        <Icon name="FiBook" size={48} />
                        <h3 style={{ margin: '1rem 0 0.5rem' }}>Wpisz czego szukasz</h3>
                        <p>Użyj wyszukiwarki powyżej aby znaleźć książki</p>
                    </EmptyState>
                )}
            </div>
        </SearchContainer>
    );
};

export default SearchPage;