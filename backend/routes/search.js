const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');
const db = require('../config/database');
const router = express.Router();

// Cache dla wyników wyszukiwania (prosty in-memory cache)
const searchCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minut

// Funkcja do walidacji kompletności danych książki
const isValidBook = (volumeInfo) => {
    const hasRequiredFields = volumeInfo.title &&
        volumeInfo.authors &&
        volumeInfo.authors.length > 0 &&
        volumeInfo.imageLinks &&
        volumeInfo.imageLinks.thumbnail &&
        volumeInfo.description;

    console.log('Book validation:', {
        title: volumeInfo.title,
        authors: volumeInfo.authors,
        hasThumbnail: !!volumeInfo.imageLinks?.thumbnail,
        hasDescription: !!volumeInfo.description,
        isValid: hasRequiredFields
    });

    return hasRequiredFields;
};

// Funkcja do wyszukiwania książek w lokalnej bazie danych - POPRAWIONA
const searchLocalDatabase = async (query, userId, maxResults = 12, startIndex = 0) => {
    try {
        const searchTerm = `%${query}%`;

        console.log('🔍 Local database search:', { query, userId, maxResults, startIndex });

        const [books] = await db.promisePool.execute(
            `SELECT 
                k.id,
                k.tytul,
                k.isbn,
                k.opis,
                k.liczba_stron,
                k.data_wydania,
                k.gatunek,
                k.jezyk,
                k.url_okladki,
                GROUP_CONCAT(DISTINCT a.imie_nazwisko) as autorzy,
                s.status,
                s.ocena,
                s.aktualna_strona,
                s.data_rozpoczecia,
                s.data_zakonczenia
            FROM ksiazki k
            LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
            LEFT JOIN autorzy a ON ka.autor_id = a.id
            LEFT JOIN statusy_czytania s ON k.id = s.ksiazka_id AND s.uzytkownik_id = ?
            WHERE k.tytul LIKE ? 
               OR a.imie_nazwisko LIKE ?
               OR k.gatunek LIKE ?
               OR k.isbn LIKE ?
            GROUP BY k.id, s.status, s.ocena, s.aktualna_strona, s.data_rozpoczecia, s.data_zakonczenia
            ORDER BY k.id DESC
            LIMIT ? OFFSET ?`,
            [userId, searchTerm, searchTerm, searchTerm, searchTerm, maxResults, startIndex]
        );

        console.log(`📚 Local search found ${books.length} books`);

        // Pobierz całkowitą liczbę wyników dla paginacji
        const [countResult] = await db.promisePool.execute(
            `SELECT COUNT(DISTINCT k.id) as total
            FROM ksiazki k
            LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
            LEFT JOIN autorzy a ON ka.autor_id = a.id
            WHERE k.tytul LIKE ? 
               OR a.imie_nazwisko LIKE ?
               OR k.gatunek LIKE ?
               OR k.isbn LIKE ?`,
            [searchTerm, searchTerm, searchTerm, searchTerm]
        );

        const totalCount = countResult[0]?.total || 0;
        console.log(`📊 Total local results: ${totalCount}`);

        const formattedBooks = books.map(book => {
            // Oblicz postęp na podstawie aktualnej strony i liczby stron
            const postep = book.liczba_stron && book.aktualna_strona ?
                Math.round((book.aktualna_strona / book.liczba_stron) * 100) : 0;

            return {
                source: 'local',
                id: book.id,
                tytul: book.tytul,
                autorzy: book.autorzy ? book.autorzy.split(',') : [],
                isbn: book.isbn,
                opis: book.opis,
                liczba_stron: book.liczba_stron,
                data_wydania: book.data_wydania,
                gatunek: book.gatunek,
                jezyk: book.jezyk,
                url_okladki: book.url_okladki,
                readingStatus: {
                    status: book.status,
                    ocena: book.ocena,
                    aktualna_strona: book.aktualna_strona,
                    postep: postep,
                    data_rozpoczecia: book.data_rozpoczecia,
                    data_zakonczenia: book.data_zakonczenia
                }
            };
        });

        return {
            books: formattedBooks,
            totalResults: totalCount,
            hasMore: (totalCount > (parseInt(startIndex) + parseInt(maxResults)))
        };
    } catch (error) {
        console.error('❌ Local database search error:', error);
        return {
            books: [],
            totalResults: 0,
            hasMore: false,
            error: error.message
        };
    }
};

// Funkcja do budowania zaawansowanego zapytania
const buildAdvancedQuery = (query) => {
    const trimmedQuery = query.trim();

    // Sprawdź czy zapytanie wygląda jak ISBN (tylko cyfry i myślniki)
    const isbnRegex = /^(?:\d{10}|\d{13}|(?:\d{3}-)?\d{10}|(?:\d{3}-)?\d{13})$/;
    if (isbnRegex.test(trimmedQuery.replace(/-/g, ''))) {
        return `isbn:${trimmedQuery}`;
    }

    // Sprawdź czy zapytanie zawiera słowa kluczowe wskazujące na autora
    const authorKeywords = ['autor:', 'author:', 'pisarz', 'writer'];
    const hasAuthorKeyword = authorKeywords.some(keyword =>
        trimmedQuery.toLowerCase().includes(keyword)
    );

    if (hasAuthorKeyword) {
        const cleanQuery = trimmedQuery.replace(/autor:|author:|pisarz|writer/gi, '').trim();
        return `inauthor:"${cleanQuery}"`;
    }

    // Sprawdź czy zapytanie zawiera słowa kluczowe wskazujące na gatunek
    const genreKeywords = ['gatunek:', 'genre:', 'kategoria:', 'category:'];
    const hasGenreKeyword = genreKeywords.some(keyword =>
        trimmedQuery.toLowerCase().includes(keyword)
    );

    if (hasGenreKeyword) {
        const cleanQuery = trimmedQuery.replace(/gatunek:|genre:|kategoria:|category:/gi, '').trim();
        return `subject:"${cleanQuery}"`;
    }

    // Sprawdź czy zapytanie zawiera słowa kluczowe wskazujące na wydawnictwo
    const publisherKeywords = ['wydawnictwo:', 'publisher:', 'wyd:'];
    const hasPublisherKeyword = publisherKeywords.some(keyword =>
        trimmedQuery.toLowerCase().includes(keyword)
    );

    if (hasPublisherKeyword) {
        const cleanQuery = trimmedQuery.replace(/wydawnictwo:|publisher:|wyd:/gi, '').trim();
        return `inpublisher:"${cleanQuery}"`;
    }

    // Domyślnie: szukaj we wszystkich polach
    return trimmedQuery;
};

// Główna funkcja wyszukiwania - teraz szuka zarówno w Google Books jak i lokalnej bazie
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { q, maxResults = 12, startIndex = 0, searchType = 'all', searchSource = 'both' } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: 'Query parameter "q" is required' });
        }

        const cacheKey = `${q}-${maxResults}-${startIndex}-${searchType}-${searchSource}-${req.user.userId}`;
        const cached = searchCache.get(cacheKey);

        // Sprawdź cache
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('Serving from cache:', cacheKey);
            return res.json(cached.data);
        }

        console.log('Searching for:', q, 'source:', searchSource, 'user:', req.user.userId);

        let googleResults = { books: [], totalResults: 0, hasMore: false };
        let localResults = { books: [], totalResults: 0, hasMore: false };

        // Wyszukiwanie w Google Books
        if (searchSource === 'google' || searchSource === 'both') {
            try {
                // Zbuduj zaawansowane zapytanie
                let searchQuery;

                switch (searchType) {
                    case 'author':
                        searchQuery = `inauthor:"${q.trim()}"`;
                        break;
                    case 'title':
                        searchQuery = `intitle:"${q.trim()}"`;
                        break;
                    case 'isbn':
                        searchQuery = `isbn:${q.trim().replace(/-/g, '')}`;
                        break;
                    case 'publisher':
                        searchQuery = `inpublisher:"${q.trim()}"`;
                        break;
                    case 'subject':
                        searchQuery = `subject:"${q.trim()}"`;
                        break;
                    default:
                        searchQuery = buildAdvancedQuery(q);
                }

                console.log('Google search query:', searchQuery);

                const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
                    params: {
                        q: searchQuery,
                        maxResults: Math.min(parseInt(maxResults) * 2, 40),
                        startIndex: parseInt(startIndex),
                        printType: 'books',
                        langRestrict: 'pl',
                        orderBy: 'relevance',
                        key: process.env.GOOGLE_BOOKS_API_KEY
                    },
                    timeout: 10000
                });

                if (response.data.items) {
                    // Filtruj książki - tylko te z kompletnymi danymi
                    const validBooks = response.data.items.filter(item =>
                        item.volumeInfo && isValidBook(item.volumeInfo)
                    );

                    console.log(`Google: Found ${response.data.items.length} books, ${validBooks.length} valid after filtering`);

                    // Ogranicz do żądanej liczby wyników
                    const limitedBooks = validBooks.slice(0, parseInt(maxResults));

                    const books = await Promise.all(
                        limitedBooks.map(async (item) => {
                            const volumeInfo = item.volumeInfo;

                            // Sprawdź czy książka już istnieje w naszej bazie
                            let existingBookId = null;
                            try {
                                const [existingBooks] = await db.promisePool.execute(
                                    'SELECT id FROM ksiazki WHERE isbn = ? OR tytul = ? LIMIT 1',
                                    [
                                        volumeInfo.industryIdentifiers?.[0]?.identifier || '',
                                        volumeInfo.title || ''
                                    ]
                                );
                                existingBookId = existingBooks.length > 0 ? existingBooks[0].id : null;
                            } catch (dbError) {
                                console.error('Database check error:', dbError);
                            }

                            return {
                                source: 'google',
                                googleBooksId: item.id,
                                existingBookId: existingBookId,
                                tytul: volumeInfo.title,
                                autorzy: volumeInfo.authors,
                                isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                                    volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '',
                                opis: volumeInfo.description ?
                                    volumeInfo.description.substring(0, 500) + (volumeInfo.description.length > 500 ? '...' : '') :
                                    'Brak opisu',
                                liczba_stron: volumeInfo.pageCount || null,
                                data_wydania: volumeInfo.publishedDate || '',
                                wydawnictwo: volumeInfo.publisher || '',
                                gatunek: volumeInfo.categories?.[0] || '',
                                jezyk: volumeInfo.language || 'pl',
                                url_okladki: volumeInfo.imageLinks?.thumbnail || '',
                                previewLink: volumeInfo.previewLink || '',
                                rating: volumeInfo.averageRating || null,
                                ratingsCount: volumeInfo.ratingsCount || 0,
                                searchType: searchType
                            };
                        })
                    );

                    googleResults = {
                        books: books,
                        totalResults: books.length,
                        totalGoogleResults: response.data.totalItems || 0,
                        hasMore: (response.data.totalItems || 0) > (parseInt(startIndex) + parseInt(maxResults)) &&
                            validBooks.length >= parseInt(maxResults)
                    };
                }
            } catch (googleError) {
                console.error('Google Books API error:', googleError);
                googleResults = {
                    books: [],
                    totalResults: 0,
                    hasMore: false,
                    error: 'Google Books API temporarily unavailable'
                };
            }
        }

        // Wyszukiwanie w lokalnej bazie danych
        if (searchSource === 'local' || searchSource === 'both') {
            try {
                localResults = await searchLocalDatabase(q, req.user.userId, maxResults, startIndex);
                console.log(`Local: Found ${localResults.books.length} books`);
            } catch (localError) {
                console.error('Local database search error:', localError);
                localResults = {
                    books: [],
                    totalResults: 0,
                    hasMore: false,
                    error: 'Local database search failed'
                };
            }
        }

        // Połącz wyniki w zależności od źródła
        let combinedBooks = [];
        let totalResults = 0;

        if (searchSource === 'google') {
            combinedBooks = googleResults.books;
            totalResults = googleResults.totalResults;
        } else if (searchSource === 'local') {
            combinedBooks = localResults.books;
            totalResults = localResults.totalResults;
        } else {
            // Oba źródła - najpierw książki z bazy, potem z Google
            combinedBooks = [...localResults.books, ...googleResults.books];
            totalResults = localResults.totalResults + googleResults.totalResults;
        }

        const result = {
            books: combinedBooks,
            totalResults: totalResults,
            sourceBreakdown: {
                google: googleResults,
                local: localResults
            },
            searchQuery: q,
            searchType: searchType,
            searchSource: searchSource
        };

        // Zapisz w cache
        searchCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        res.json(result);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            message: 'Błąd podczas wyszukiwania książek',
            error: error.message
        });
    }
});

// Wyszukiwanie tylko w lokalnej bazie danych
router.get('/local', authenticateToken, async (req, res) => {
    try {
        const { q, maxResults = 12, startIndex = 0 } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: 'Query parameter "q" is required' });
        }

        const cacheKey = `local-${q}-${maxResults}-${startIndex}-${req.user.userId}`;
        const cached = searchCache.get(cacheKey);

        // Sprawdź cache
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('Serving local search from cache:', cacheKey);
            return res.json(cached.data);
        }

        console.log('Local search for:', q, 'user:', req.user.userId);

        const localResults = await searchLocalDatabase(q, req.user.userId, maxResults, startIndex);

        const result = {
            ...localResults,
            searchQuery: q,
            searchSource: 'local'
        };

        // Zapisz w cache
        searchCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        res.json(result);

    } catch (error) {
        console.error('Local search error:', error);
        res.status(500).json({
            message: 'Błąd podczas wyszukiwania w lokalnej bazie danych',
            error: error.message
        });
    }
});

// Pozostałe endpointy (quick-add, details, suggestions, advanced search) pozostają bez zmian
// ... (tutaj wklej pozostałą część kodu z poprzedniej wersji)

// Szybkie dodanie książki z Google Books
router.post('/quick-add', authenticateToken, async (req, res) => {
    const connection = await db.promisePool.getConnection();

    try {
        const { googleBooksId } = req.body;
        const userId = req.user.userId;

        if (!googleBooksId) {
            return res.status(400).json({
                message: 'Brak wymaganego parametru googleBooksId'
            });
        }

        console.log('Quick adding book:', googleBooksId, 'for user:', userId);

        // Pobierz szczegóły książki z Google Books
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`, {
            params: {
                key: process.env.GOOGLE_BOOKS_API_KEY
            },
            timeout: 10000
        });

        const volumeInfo = response.data.volumeInfo;
        console.log('Received book data:', {
            title: volumeInfo.title,
            authors: volumeInfo.authors,
            hasThumbnail: !!volumeInfo.imageLinks?.thumbnail,
            hasDescription: !!volumeInfo.description
        });

        // Sprawdź czy książka ma wszystkie wymagane dane
        if (!isValidBook(volumeInfo)) {
            return res.status(400).json({
                message: 'Książka nie posiada wszystkich wymaganych danych (tytuł, autor, okładka, opis)',
                missingFields: {
                    title: !volumeInfo.title,
                    authors: !volumeInfo.authors || volumeInfo.authors.length === 0,
                    thumbnail: !volumeInfo.imageLinks?.thumbnail,
                    description: !volumeInfo.description
                }
            });
        }

        await connection.beginTransaction();

        // Sprawdź czy książka już istnieje
        const isbn = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
            volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '';

        console.log('Checking for existing book with ISBN:', isbn, 'or title:', volumeInfo.title);

        const [existingBooks] = await connection.execute(
            'SELECT id FROM ksiazki WHERE isbn = ? OR tytul = ?',
            [isbn, volumeInfo.title]
        );

        let bookId;

        if (existingBooks.length > 0) {
            // Książka już istnieje - użyj istniejącego ID
            bookId = existingBooks[0].id;
            console.log('Book already exists, using ID:', bookId);
        } else {
            // Dodaj nową książkę
            console.log('Adding new book to database');
            const [bookResult] = await connection.execute(
                `INSERT INTO ksiazki 
                 (tytul, isbn, opis, liczba_stron, data_wydania, wydawnictwo, gatunek, jezyk, url_okladki) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    volumeInfo.title || '',
                    isbn,
                    volumeInfo.description || '',
                    volumeInfo.pageCount || null,
                    volumeInfo.publishedDate || '',
                    volumeInfo.publisher || '',
                    volumeInfo.categories?.[0] || '',
                    volumeInfo.language || 'pl',
                    volumeInfo.imageLinks.thumbnail || ''
                ]
            );
            bookId = bookResult.insertId;
            console.log('New book added with ID:', bookId);

            // Dodaj autorów
            if (volumeInfo.authors && volumeInfo.authors.length > 0) {
                console.log('Adding authors:', volumeInfo.authors);
                for (const authorName of volumeInfo.authors) {
                    // Sprawdź czy autor już istnieje
                    const [existingAuthors] = await connection.execute(
                        'SELECT id FROM autorzy WHERE imie_nazwisko = ?',
                        [authorName]
                    );

                    let authorId;

                    if (existingAuthors.length > 0) {
                        authorId = existingAuthors[0].id;
                        console.log('Author already exists:', authorName, 'ID:', authorId);
                    } else {
                        // Dodaj nowego autora
                        const [authorResult] = await connection.execute(
                            'INSERT INTO autorzy (imie_nazwisko) VALUES (?)',
                            [authorName]
                        );
                        authorId = authorResult.insertId;
                        console.log('New author added:', authorName, 'ID:', authorId);
                    }

                    // Połącz książkę z autorem
                    await connection.execute(
                        'INSERT INTO ksiazka_autorzy (ksiazka_id, autor_id) VALUES (?, ?)',
                        [bookId, authorId]
                    );
                    console.log('Linked book with author:', bookId, authorId);
                }
            }
        }

        // Sprawdź czy użytkownik już ma tę książkę
        const [existingStatus] = await connection.execute(
            'SELECT id FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        let statusMessage = 'Książka dodana do biblioteki';

        if (existingStatus.length === 0) {
            // Dodaj domyślny status "chcę przeczytać"
            await connection.execute(
                'INSERT INTO statusy_czytania (uzytkownik_id, ksiazka_id, status) VALUES (?, ?, ?)',
                [userId, bookId, 'chce_przeczytac']
            );
            statusMessage = 'Książka dodana do biblioteki (status: Chcę przeczytać)';
            console.log('Added reading status for user:', userId, 'book:', bookId);
        } else {
            statusMessage = 'Książka już znajduje się w Twojej bibliotece';
            console.log('Book already in user library');
        }

        await connection.commit();
        console.log('Transaction committed successfully');

        // Wyczyść cache wyszukiwania
        searchCache.clear();

        res.status(201).json({
            message: statusMessage,
            bookId: bookId,
            alreadyExists: existingStatus.length > 0
        });

    } catch (error) {
        await connection.rollback();
        console.error('Quick add error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            response: error.response?.data
        });

        // Bardziej szczegółowe komunikaty błędów
        let errorMessage = 'Błąd podczas dodawania książki';
        if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Książka już istnieje w bazie danych';
        } else if (error.response?.status === 404) {
            errorMessage = 'Książka nie została znaleziona w Google Books';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Przekroczono czas oczekiwania na połączenie';
        }

        res.status(500).json({
            message: errorMessage,
            error: error.message,
            details: error.response?.data || null
        });
    } finally {
        connection.release();
    }
});

// Popularne wyszukiwania (sugestie)
router.get('/suggestions', authenticateToken, async (req, res) => {
    const popularSearches = [
        'Harry Potter',
        'Wiedźmin',
        'Stephen King',
        'Olga Tokarczuk',
        'Agatha Christie',
        'Fantastyka',
        'Kryminał',
        'Romans',
        'Science Fiction',
        'Literatura polska'
    ];

    res.json({ suggestions: popularSearches });
});

module.exports = router;