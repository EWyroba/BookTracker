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
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: ${props => props.theme.colors.primary};
  }
`;

const BookCover = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
`;

const BookTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.xs};
  line-height: 1.3;
  color: ${props => props.theme.colors.text};
  flex-shrink: 0;
`;

const BookAuthors = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: ${props => props.theme.spacing.sm};
  flex-shrink: 0;
`;

const DescriptionContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  flex-grow: 1;
  overflow: hidden;
`;

const BookDescription = styled.p<{ $expanded: boolean }>`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: ${props => props.theme.spacing.xs};
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.$expanded ? 'unset' : '3'};
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
  text-align: left;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const BookMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  flex-shrink: 0;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const AverageRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.theme.colors.success};
  font-size: 0.8rem;
  background: ${props => props.theme.colors.surfaceLight};
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
`;

const RatingCount = styled.span`
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: 2px;
`;

const UserRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.theme.colors.warning};
  font-size: 0.8rem;
  margin-top: 2px;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  flex-shrink: 0;
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

// Funkcja pomocnicza do formatowania daty
const formatDate = (dateString: string): string => {
    if (!dateString) return 'Brak daty';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            const dateOnly = dateString.split('T')[0];
            return dateOnly || dateString;
        }
        return date.toISOString().split('T')[0];
    } catch (error) {
        return dateString.split('T')[0] || dateString;
    }
};

// ===== INTERFACES =====
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
    srednia_ocena?: string | number | null;
    liczba_ocen?: number;
    readingStatus?: {
        status: string;
        ocena: number | null;
        aktualna_strona: number;
        postep: number;
        data_rozpoczecia: string | null;
        data_zakonczenia: string | null;
    };
}

// Helper function to ensure source is always 'google' or 'local'
const ensureSourceType = (source: any): 'google' | 'local' => {
    return source === 'local' ? 'local' : 'google';
};

const SearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addingBooks, setAddingBooks] = useState<Set<string>>(new Set());
    const [removingBooks, setRemovingBooks] = useState<Set<string>>(new Set());
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

    const RESULTS_PER_PAGE = 12;

    // Funkcja do rozwijania/zwijania opisu
    const toggleDescription = (bookKey: string) => {
        setExpandedDescriptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(bookKey)) {
                newSet.delete(bookKey);
            } else {
                newSet.add(bookKey);
            }
            return newSet;
        });
    };

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
            setExpandedDescriptions(new Set());
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
                const rawBooks = response.data.books || [];

                // Filtruj duplikaty - preferuj książki z biblioteki użytkownika
                const uniqueBooksMap = new Map<string, SearchResult>();

                rawBooks.forEach((book: any) => {
                    const key = book.existingBookId
                        ? `id-${book.existingBookId}`
                        : `isbn-${book.isbn || ''}-${book.tytul || ''}`;

                    if (uniqueBooksMap.has(key)) {
                        const existingBook = uniqueBooksMap.get(key)!;

                        // Preferuj książkę która jest już w bibliotece użytkownika
                        if (book.isInUserLibrary && !existingBook.isInUserLibrary) {
                            uniqueBooksMap.set(key, {
                                source: ensureSourceType(book.source),
                                googleBooksId: book.googleBooksId || undefined,
                                existingBookId: book.existingBookId || null,
                                isInUserLibrary: Boolean(book.isInUserLibrary),
                                tytul: book.tytul || 'Brak tytułu',
                                autorzy: Array.isArray(book.autorzy) ? book.autorzy : ['Autor nieznany'],
                                isbn: book.isbn || '',
                                opis: book.opis || 'Brak opisu',
                                liczba_stron: book.liczba_stron || null,
                                data_wydania: book.data_wydania || '',
                                wydawnictwo: book.wydawnictwo || '',
                                gatunek: book.gatunek || 'Inne',
                                jezyk: book.jezyk || 'pl',
                                url_okladki: book.url_okladki || '',
                                previewLink: book.previewLink || '',
                                rating: book.rating || null,
                                ratingsCount: book.ratingsCount || 0,
                                srednia_ocena: book.srednia_ocena || null,
                                liczba_ocen: book.liczba_ocen || 0,
                                readingStatus: book.readingStatus || undefined
                            });
                        }
                        // Preferuj książkę z istniejącym ID (z naszej bazy)
                        else if (book.existingBookId && !existingBook.existingBookId) {
                            uniqueBooksMap.set(key, {
                                source: 'local',
                                googleBooksId: book.googleBooksId || undefined,
                                existingBookId: book.existingBookId || null,
                                isInUserLibrary: Boolean(book.isInUserLibrary),
                                tytul: book.tytul || 'Brak tytułu',
                                autorzy: Array.isArray(book.autorzy) ? book.autorzy : ['Autor nieznany'],
                                isbn: book.isbn || '',
                                opis: book.opis || 'Brak opisu',
                                liczba_stron: book.liczba_stron || null,
                                data_wydania: book.data_wydania || '',
                                wydawnictwo: book.wydawnictwo || '',
                                gatunek: book.gatunek || 'Inne',
                                jezyk: book.jezyk || 'pl',
                                url_okladki: book.url_okladki || '',
                                previewLink: book.previewLink || '',
                                rating: book.rating || null,
                                ratingsCount: book.ratingsCount || 0,
                                srednia_ocena: book.srednia_ocena || null,
                                liczba_ocen: book.liczba_ocen || 0,
                                readingStatus: book.readingStatus || undefined
                            });
                        }
                    } else {
                        // Dodaj nową książkę do mapy
                        uniqueBooksMap.set(key, {
                            source: ensureSourceType(book.source),
                            googleBooksId: book.googleBooksId || undefined,
                            existingBookId: book.existingBookId || null,
                            isInUserLibrary: Boolean(book.isInUserLibrary),
                            tytul: book.tytul || 'Brak tytułu',
                            autorzy: Array.isArray(book.autorzy) ? book.autorzy : ['Autor nieznany'],
                            isbn: book.isbn || '',
                            opis: book.opis || 'Brak opisu',
                            liczba_stron: book.liczba_stron || null,
                            data_wydania: book.data_wydania || '',
                            wydawnictwo: book.wydawnictwo || '',
                            gatunek: book.gatunek || 'Inne',
                            jezyk: book.jezyk || 'pl',
                            url_okladki: book.url_okladki || '',
                            previewLink: book.previewLink || '',
                            rating: book.rating || null,
                            ratingsCount: book.ratingsCount || 0,
                            srednia_ocena: book.srednia_ocena || null,
                            liczba_ocen: book.liczba_ocen || 0,
                            readingStatus: book.readingStatus || undefined
                        });
                    }
                });

                // Konwertuj mapę z powrotem na tablicę
                const processedResults = Array.from(uniqueBooksMap.values());

                console.log(`🔄 Filtered duplicates: ${rawBooks.length} -> ${processedResults.length} books`);

                setResults(processedResults);
                setTotalResults(response.data.totalResults || 0);
                setCurrentPage(page);
                setExpandedDescriptions(new Set());
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
        console.log('📖 ===== START ADDING BOOK =====');
        console.log('📖 Book data:', {
            source: book.source,
            googleBooksId: book.googleBooksId,
            existingBookId: book.existingBookId,
            isInUserLibrary: book.isInUserLibrary,
            title: book.tytul,
            authors: book.autorzy
        });

        if (book.isInUserLibrary) {
            alert('✅ Ta książka jest już w Twojej bibliotece');
            return;
        }

        const bookKey = book.googleBooksId || `local-${book.existingBookId || 'temp'}`;
        setAddingBooks(prev => new Set(prev).add(bookKey));

        try {
            const bookData = {
                title: book.tytul?.trim() || '',
                authors: Array.isArray(book.autorzy) ? book.autorzy : [book.autorzy || 'Autor nieznany'],
                isbn: book.isbn || '',
                description: book.opis || 'Brak opisu',
                pageCount: book.liczba_stron || 0,
                publishedDate: book.data_wydania || '',
                publisher: book.wydawnictwo || 'Nieznane wydawnictwo',
                genre: book.gatunek || 'Inne',
                language: book.jezyk || 'pl',
                coverUrl: book.url_okladki || '',
                googleBooksId: book.googleBooksId || null,
                existingBookId: book.existingBookId || null
            };

            console.log('📤 Sending book data to server:', bookData);

            const response = await api.post('/search/add-book', bookData, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📨 Server response:', response.data);

            if (response.data.success) {
                setResults(prev => {
                    const updatedResults = prev.map(b => {
                        const isSameBook = (b.googleBooksId && b.googleBooksId === book.googleBooksId) ||
                            (b.existingBookId && b.existingBookId === book.existingBookId) ||
                            (b.isbn === book.isbn && b.isbn) ||
                            (b.tytul === book.tytul && b.autorzy[0] === book.autorzy[0]);

                        if (isSameBook) {
                            return {
                                ...b,
                                isInUserLibrary: true,
                                existingBookId: response.data.bookId || b.existingBookId,
                                source: 'local' as const
                            };
                        }
                        return b;
                    });

                    return updatedResults;
                });

                alert('✅ ' + response.data.message);
            } else {
                alert('❌ ' + response.data.message);
            }

        } catch (err: any) {
            console.error('💥 ERROR adding book:', err);

            let errorMessage = 'Nie udało się dodać książki';

            if (err.response) {
                console.error('Response error:', err.response.data);
                errorMessage = err.response.data?.message ||
                    err.response.data?.error ||
                    `Błąd ${err.response.status}`;
            } else if (err.request) {
                console.error('Request error:', err.request);
                errorMessage = 'Nie udało się połączyć z serwerem';
            } else {
                errorMessage = err.message || 'Nieznany błąd';
            }

            alert('❌ ' + errorMessage);
        } finally {
            setAddingBooks(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookKey);
                return newSet;
            });

            console.log('📖 ===== END ADDING BOOK =====');
        }
    };

    const handleRemoveFromLibrary = async (book: SearchResult) => {
        console.log('🗑️ ===== START REMOVING BOOK =====');
        console.log('🗑️ Book data for removal:', {
            existingBookId: book.existingBookId,
            title: book.tytul,
            isInUserLibrary: book.isInUserLibrary
        });

        if (!book.existingBookId) {
            alert('❌ Nie można usunąć książki bez ID z bazy danych');
            return;
        }

        const bookKey = book.existingBookId.toString();
        setRemovingBooks(prev => new Set(prev).add(bookKey));

        try {
            console.log('🗑️ Removing book from library:', {
                bookId: book.existingBookId,
                title: book.tytul
            });

            const response = await api.delete(`/books/${book.existingBookId}`);

            console.log('📨 Remove response:', response.data);

            if (response.data.success) {
                setResults(prev => {
                    const updatedResults = prev.map(b => {
                        if (b.existingBookId === book.existingBookId) {
                            return {
                                ...b,
                                isInUserLibrary: false
                            };
                        }
                        return b;
                    });

                    return updatedResults;
                });

                alert('✅ ' + response.data.message);
            } else {
                alert('❌ ' + (response.data.message || 'Nie udało się usunąć książki'));
            }
        } catch (err: any) {
            console.error('💥 Remove book error:', err);

            let errorMessage = 'Nie udało się usunąć książki. Spróbuj ponownie.';

            if (err.response?.data) {
                console.error('Error response:', err.response.data);
                errorMessage = err.response.data.message || err.response.data.error || errorMessage;
            } else if (err.request) {
                console.error('No response received:', err.request);
                errorMessage = 'Problem z połączeniem. Sprawdź internet.';
            } else {
                console.error('Error setting up request:', err.message);
                errorMessage = err.message || 'Nieznany błąd';
            }

            alert('❌ ' + errorMessage);
        } finally {
            setRemovingBooks(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookKey);
                return newSet;
            });

            console.log('🗑️ ===== END REMOVING BOOK =====');
        }
    };

    const handlePageChange = (page: number) => {
        performSearch(query, page);
    };

    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

    const isAddingBook = (book: SearchResult) => {
        const bookKey = book.googleBooksId || `local-${book.existingBookId || 'temp'}`;
        return addingBooks.has(bookKey);
    };

    const isRemovingBook = (book: SearchResult) => {
        const bookKey = book.existingBookId?.toString() || '';
        return removingBooks.has(bookKey);
    };

    const isDescriptionLong = (description: string) => {
        return description.length > 150;
    };

    const getShortDescription = (description: string) => {
        if (description.length <= 150) return description;
        return description.substring(0, 150) + '...';
    };

    // Funkcja do formatowania średniej oceny
    const formatAverageRating = (rating: string | number | null | undefined): string => {
        if (!rating) return '0.0';

        if (typeof rating === 'string') {
            const num = parseFloat(rating);
            return isNaN(num) ? '0.0' : num.toFixed(1);
        } else if (typeof rating === 'number') {
            return rating.toFixed(1);
        }

        return '0.0';
    };

    // Sprawdź czy książka ma ocenę
    const hasRating = (book: SearchResult): boolean => {
        if (book.srednia_ocena) {
            const rating = parseFloat(String(book.srednia_ocena));
            return !isNaN(rating) && rating > 0;
        }
        return false;
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
                                Znaleziono {results.length} książek dla "{query}"
                            </ResultsCount>
                        </ResultsInfo>

                        <BooksGrid>
                            {results.map((book, index) => {
                                const bookKey = book.googleBooksId || `local-${book.existingBookId || 'temp'}-${index}`;
                                const isBeingAdded = isAddingBook(book);
                                const isBeingRemoved = isRemovingBook(book);
                                const isExpanded = expandedDescriptions.has(bookKey);
                                const needsExpandButton = isDescriptionLong(book.opis);

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

                                        <DescriptionContainer>
                                            <BookDescription $expanded={isExpanded}>
                                                {isExpanded ? book.opis : getShortDescription(book.opis)}
                                            </BookDescription>
                                            {needsExpandButton && (
                                                <ExpandButton onClick={() => toggleDescription(bookKey)}>
                                                    {isExpanded ? 'Zwiń opis' : 'Rozwiń opis'}
                                                </ExpandButton>
                                            )}
                                        </DescriptionContainer>

                                        <BookMeta>
                                            <MetaRow>
                                                <span>
                                                    {book.liczba_stron ? `${book.liczba_stron} str.` : 'Brak danych'}
                                                </span>

                                                {/* ŚREDNIA OCENA Z BAZY/GOOGLE */}
                                                {hasRating(book) && (
                                                    <AverageRating>
                                                        <Icon name="FiStar" size={12} />
                                                        <span>{formatAverageRating(book.srednia_ocena)}</span>
                                                        <RatingCount>({book.liczba_ocen || 0})</RatingCount>
                                                    </AverageRating>
                                                )}
                                            </MetaRow>

                                            {/* OCENA UŻYTKOWNIKA JEŚLI KSIĄŻKA JEST W BIBLIOTECE */}
                                            {book.isInUserLibrary && book.readingStatus?.ocena && (
                                                <UserRating>
                                                    <Icon name="FiStar" size={12} />
                                                    <span>Twoja ocena: {book.readingStatus.ocena}/5</span>
                                                </UserRating>
                                            )}

                                            <span>{formatDate(book.data_wydania)}</span>
                                        </BookMeta>

                                        <ActionButtons>
                                            {book.isInUserLibrary ? (
                                                <RemoveButton
                                                    onClick={() => handleRemoveFromLibrary(book)}
                                                    disabled={isBeingRemoved}
                                                >
                                                    {isBeingRemoved ? 'Usuwanie...' : 'Usuń z biblioteki'}
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