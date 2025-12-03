import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api';
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
  -webkit-line-clamp: 3;
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

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
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
    filter: brightness(0.9);
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${props => props.theme.colors.textMuted};
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.error};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.error};
    filter: brightness(0.9);
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

const InLibraryBadge = styled.div`
  background: ${props => props.theme.colors.success};
  color: white;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProcessingBadge = styled.div`
  background: ${props => props.theme.colors.warning};
  color: white;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

interface SearchResult {
    source: 'google' | 'local';
    googleBooksId?: string;
    existingBookId: number | null;
    isInUserLibrary: boolean;
    tytul: string;
    autorzy: string[];
    isbn: string;
    opis: string;
    liczba_stron: number | null;
    data_wydania: string;
    wydawnictwo?: string;
    gatunek: string;
    jezyk: string;
    url_okladki: string;
    previewLink?: string;
    rating?: number | null;
    ratingsCount?: number;
}

const SearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addingBooks, setAddingBooks] = useState<Set<string>>(new Set());
    const [removingBook, setRemovingBook] = useState<string | null>(null);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const RESULTS_PER_PAGE = 12;

    // Pobierz sugestie przy załadowaniu
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await api.get('/search/suggestions');
                if (response.data.success) {
                    setSuggestions(response.data.suggestions);
                }
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
            console.log('🔍 Sending search request for:', searchQuery);

            const response = await api.get('/search', {
                params: {
                    q: searchQuery,
                    maxResults: RESULTS_PER_PAGE,
                    startIndex: page * RESULTS_PER_PAGE
                },
                timeout: 15000
            });

            console.log('📦 Search response:', response.data);

            if (response.data.success) {
                setResults(response.data.books || []);
                setTotalResults(response.data.totalResults || 0);
                setCurrentPage(page);
            } else {
                setError(response.data.message || 'Wystąpił błąd podczas wyszukiwania');
                setResults([]);
            }

        } catch (err: any) {
            console.error('💥 Search error details:', err);

            let errorMessage = 'Wystąpił błąd podczas wyszukiwania';

            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Przekroczono czas oczekiwania. Spróbuj ponownie.';
            } else if (err.response?.data) {
                errorMessage = err.response.data.message || err.response.data.error;
            } else if (err.request) {
                errorMessage = 'Problem z połączeniem. Sprawdź internet.';
            } else {
                errorMessage = err.message;
            }

            setError(errorMessage);
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

    const handleAddBook = async (book: SearchResult) => {
        console.log('📖 Book data for adding:', {
            source: book.source,
            googleBooksId: book.googleBooksId,
            existingBookId: book.existingBookId,
            isInUserLibrary: book.isInUserLibrary,
            title: book.tytul
        });

        // Jeśli książka jest już w bibliotece użytkownika
        if (book.isInUserLibrary) {
            alert('✅ Ta książka jest już w Twojej bibliotece');
            return;
        }

        // Dla wszystkich książek używamy tego samego endpointu
        const bookKey = book.googleBooksId || `local-${book.existingBookId}`;

        // Dodaj książkę do listy przetwarzanych
        setAddingBooks(prev => new Set(prev).add(bookKey));

        try {
            console.log(`🔄 Adding book to library and database:`, {
                title: book.tytul,
                source: book.source,
                googleBooksId: book.googleBooksId,
                existingBookId: book.existingBookId
            });

            // Wysyłamy dane książki do backendu
            const response = await api.post('/search/add-book', {
                // Dane książki
                title: book.tytul,
                authors: book.autorzy,
                isbn: book.isbn,
                description: book.opis,
                pageCount: book.liczba_stron,
                publishedDate: book.data_wydania,
                publisher: book.wydawnictwo,
                genre: book.gatunek,
                language: book.jezyk,
                coverUrl: book.url_okladki,
                // Identyfikatory
                googleBooksId: book.googleBooksId,
                existingBookId: book.existingBookId
            }, {
                timeout: 15000
            });

            console.log('📨 Add book response:', response.data);

            if (response.data.success) {
                // Aktualizuj wyniki wyszukiwania
                setResults(prev => prev.map(b => {
                    if ((b.googleBooksId === book.googleBooksId) ||
                        (b.existingBookId === book.existingBookId)) {
                        return {
                            ...b,
                            isInUserLibrary: true,
                            existingBookId: response.data.bookId || b.existingBookId,
                            source: 'local' // Teraz jest w lokalnej bazie
                        };
                    }
                    return b;
                }));

                alert('✅ ' + response.data.message);
            } else {
                alert('❌ ' + (response.data.message || 'Nie udało się dodać książki'));
            }
        } catch (err: any) {
            console.error('💥 Add book error:', err);

            let errorMessage = 'Nie udało się dodać książki. Spróbuj ponownie.';

            if (err.response?.data) {
                errorMessage = err.response.data.message || err.response.data.error;
            } else if (err.request) {
                errorMessage = 'Problem z połączeniem. Sprawdź internet.';
            } else {
                errorMessage = err.message;
            }

            alert('❌ ' + errorMessage);
        } finally {
            // Usuń książkę z listy przetwarzanych
            setAddingBooks(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookKey);
                return newSet;
            });
        }
    };

    const handleRemoveFromLibrary = async (book: SearchResult) => {
        if (!book.existingBookId) {
            alert('❌ Nie można usunąć książki bez ID z bazy danych');
            return;
        }

        setRemovingBook(book.googleBooksId || null);

        try {
            console.log('🗑️ Removing book from library:', {
                bookId: book.existingBookId,
                title: book.tytul
            });

            const response = await api.delete(`/search/books/${book.existingBookId}/remove-from-library`);

            console.log('📨 Remove response:', response.data);

            if (response.data.success) {
                // Odśwież wyniki wyszukiwania
                setResults(prev => prev.map(b =>
                    b.existingBookId === book.existingBookId
                        ? { ...b, isInUserLibrary: false }
                        : b
                ));

                alert('✅ ' + response.data.message);
            } else {
                alert('❌ ' + (response.data.message || 'Nie udało się usunąć książki'));
            }
        } catch (err: any) {
            console.error('💥 Remove book error:', err);

            let errorMessage = 'Nie udało się usunąć książki. Spróbuj ponownie.';

            if (err.response?.data) {
                errorMessage = err.response.data.message || err.response.data.error;
            } else if (err.request) {
                errorMessage = 'Problem z połączeniem. Sprawdź internet.';
            } else {
                errorMessage = err.message;
            }

            alert('❌ ' + errorMessage);
        } finally {
            setRemovingBook(null);
        }
    };

    const handlePageChange = (page: number) => {
        performSearch(query, page);
    };

    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
    const isAddingBook = (book: SearchResult) => {
        const bookKey = book.googleBooksId || `local-${book.existingBookId}`;
        return addingBooks.has(bookKey);
    };

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
                                {results.some(book => book.source === 'local') && ' (w tym książki z Twojej biblioteki)'}
                            </ResultsCount>
                        </ResultsInfo>

                        <BooksGrid>
                            {results.map((book) => {
                                const bookKey = book.googleBooksId || `local-${book.existingBookId}`;
                                const isBeingAdded = isAddingBook(book);

                                return (
                                    <BookCard key={bookKey}>
                                        {book.isInUserLibrary ? (
                                            <InLibraryBadge>✓ W Twojej bibliotece</InLibraryBadge>
                                        ) : isBeingAdded ? (
                                            <ProcessingBadge>Dodawanie...</ProcessingBadge>
                                        ) : null}

                                        <BookCover
                                            src={book.url_okladki || 'https://via.placeholder.com/300x400/1a1a1a/666666?text=Brak+okładki'}
                                            alt={book.tytul}
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/300x400/1a1a1a/666666?text=Brak+okładki';
                                            }}
                                        />

                                        <BookTitle>{book.tytul}</BookTitle>

                                        <BookAuthors>
                                            {book.autorzy && book.autorzy.length > 0
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
                                            {book.source === 'local' && (
                                                <span style={{ color: '#4caf50', fontSize: '0.7rem' }}>
                                                    📚 Lokalna
                                                </span>
                                            )}
                                        </BookMeta>

                                        <ActionButtons>
                                            {book.isInUserLibrary ? (
                                                <RemoveButton
                                                    onClick={() => handleRemoveFromLibrary(book)}
                                                    disabled={removingBook === (book.googleBooksId || null)}
                                                >
                                                    {removingBook === (book.googleBooksId || null) ? 'Usuwanie...' : 'Usuń z biblioteki'}
                                                </RemoveButton>
                                            ) : (
                                                <AddButton
                                                    onClick={() => handleAddBook(book)}
                                                    disabled={isBeingAdded || book.isInUserLibrary}
                                                    $added={book.isInUserLibrary}
                                                >
                                                    {isBeingAdded
                                                        ? 'Dodawanie...'
                                                        : book.isInUserLibrary
                                                            ? '✓ W bibliotece'
                                                            : '+ Dodaj do biblioteki'
                                                    }
                                                </AddButton>
                                            )}
                                        </ActionButtons>
                                    </BookCard>
                                );
                            })}
                        </BooksGrid>

                        {totalPages > 1 && (
                            <Pagination>
                                <PageButton
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                >
                                    ‹ Poprzednia
                                </PageButton>

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