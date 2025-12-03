const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const axios = require('axios');
const db = require('../config/database');
const router = express.Router();

// Cache dla wyników wyszukiwania
const searchCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000;

// Funkcja do walidacji kompletności danych książki
const isValidBook = (volumeInfo) => {
    const hasRequiredFields = volumeInfo.title &&
        volumeInfo.authors &&
        volumeInfo.authors.length > 0 &&
        volumeInfo.imageLinks &&
        volumeInfo.imageLinks.thumbnail;

    return hasRequiredFields;
};

// Funkcja do sprawdzania czy książka jest w bibliotece użytkownika
const checkIfInUserLibrary = async (bookId, userId) => {
    try {
        const [result] = await db.promisePool.execute(
            'SELECT 1 FROM statusy_czytania WHERE ksiazka_id = ? AND uzytkownik_id = ?',
            [bookId, userId]
        );
        return result.length > 0;
    } catch (error) {
        console.error('Check user library error:', error);
        return false;
    }
};

// Funkcja do wyszukiwania książek w lokalnej bazie danych
const searchLocalDatabase = async (query, userId, maxResults = 12, startIndex = 0) => {
    try {
        const searchTerm = `%${query}%`;

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

        const formattedBooks = await Promise.all(books.map(async (book) => {
            const postep = book.liczba_stron && book.aktualna_strona ?
                Math.round((book.aktualna_strona / book.liczba_stron) * 100) : 0;

            return {
                source: 'local',
                existingBookId: book.id,
                googleBooksId: null,
                tytul: book.tytul,
                autorzy: book.autorzy ? book.autorzy.split(',') : [],
                isbn: book.isbn || '',
                opis: book.opis || 'Brak opisu',
                liczba_stron: book.liczba_stron,
                data_wydania: book.data_wydania,
                gatunek: book.gatunek,
                jezyk: book.jezyk,
                url_okladki: book.url_okladki,
                isInUserLibrary: !!book.status, // Jeśli ma status, jest w bibliotece
                readingStatus: {
                    status: book.status,
                    ocena: book.ocena,
                    aktualna_strona: book.aktualna_strona,
                    postep: postep,
                    data_rozpoczecia: book.data_rozpoczecia,
                    data_zakonczenia: book.data_zakonczenia
                }
            };
        }));

        return {
            books: formattedBooks,
            totalResults: totalCount,
            hasMore: (totalCount > (parseInt(startIndex) + parseInt(maxResults)))
        };
    } catch (error) {
        console.error('Local database search error:', error);
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

    // Sprawdź czy zapytanie wygląda jak ISBN
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

// Główna funkcja wyszukiwania
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { q, maxResults = 12, startIndex = 0, searchType = 'all', searchSource = 'both' } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter "q" is required'
            });
        }

        const cacheKey = `${q}-${maxResults}-${startIndex}-${searchType}-${searchSource}-${req.user.userId}`;
        const cached = searchCache.get(cacheKey);

        // Sprawdź cache
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return res.json({
                success: true,
                ...cached.data
            });
        }

        console.log('Searching for:', q, 'source:', searchSource, 'user:', req.user.userId);

        let googleResults = { books: [], totalResults: 0, hasMore: false };
        let localResults = { books: [], totalResults: 0, hasMore: false };

        // Wyszukiwanie w Google Books
        if (searchSource === 'google' || searchSource === 'both') {
            try {
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

                    // Ogranicz do żądanej liczby wyników
                    const limitedBooks = validBooks.slice(0, parseInt(maxResults));

                    const books = await Promise.all(
                        limitedBooks.map(async (item) => {
                            const volumeInfo = item.volumeInfo;

                            // Sprawdź czy książka już istnieje w naszej bazie
                            let existingBookId = null;
                            let isInUserLibrary = false;

                            try {
                                const [existingBooks] = await db.promisePool.execute(
                                    'SELECT id FROM ksiazki WHERE isbn = ? OR tytul = ? LIMIT 1',
                                    [
                                        volumeInfo.industryIdentifiers?.[0]?.identifier || '',
                                        volumeInfo.title || ''
                                    ]
                                );

                                if (existingBooks.length > 0) {
                                    existingBookId = existingBooks[0].id;
                                    // Sprawdź czy użytkownik ma tę książkę w swojej bibliotece
                                    isInUserLibrary = await checkIfInUserLibrary(existingBookId, req.user.userId);
                                }
                            } catch (dbError) {
                                console.error('Database check error:', dbError);
                            }

                            return {
                                source: 'google',
                                googleBooksId: item.id,
                                existingBookId: existingBookId,
                                isInUserLibrary: isInUserLibrary,
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
            success: true,
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
            success: false,
            message: 'Błąd podczas wyszukiwania książek',
            error: error.message
        });
    }
});

// NOWA FUNKCJA: Dodaj książkę do bazy lokalnej i biblioteki użytkownika
router.post('/add-book', authenticateToken, async (req, res) => {
    const connection = await db.promisePool.getConnection();

    try {
        const {
            // Dane książki
            title,
            authors,
            isbn,
            description,
            pageCount,
            publishedDate,
            publisher,
            genre,
            language,
            coverUrl,
            // Identyfikatory
            googleBooksId,
            existingBookId
        } = req.body;

        const userId = req.user.userId;

        console.log('📥 Add-book request received:', {
            title: title,
            existingBookId: existingBookId,
            googleBooksId: googleBooksId,
            userId: userId
        });

        await connection.beginTransaction();

        let bookId = existingBookId;
        let isNewBook = false;
        let isNewInLibrary = false;

        // KROK 1: Sprawdź czy książka już istnieje w bazie
        if (!bookId) {
            // Szukaj książki po ISBN
            if (isbn) {
                const [booksByISBN] = await connection.execute(
                    'SELECT id FROM ksiazki WHERE isbn = ?',
                    [isbn]
                );
                if (booksByISBN.length > 0) {
                    bookId = booksByISBN[0].id;
                }
            }

            // Jeśli nie znaleziono po ISBN, szukaj po tytule i pierwszym autorze
            if (!bookId && title && authors && authors.length > 0) {
                const [booksByTitle] = await connection.execute(
                    `SELECT k.id FROM ksiazki k 
                     LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id 
                     LEFT JOIN autorzy a ON ka.autor_id = a.id 
                     WHERE k.tytul = ? AND a.imie_nazwisko = ? 
                     LIMIT 1`,
                    [title, authors[0]]
                );
                if (booksByTitle.length > 0) {
                    bookId = booksByTitle[0].id;
                }
            }
        }

        // KROK 2: Jeśli książka nie istnieje, dodaj ją do bazy
        if (!bookId) {
            console.log('📚 Adding new book to database:', title);

            // Przygotuj dane do wstawienia
            const bookData = [
                title || 'Brak tytułu',
                isbn || '',
                description || 'Brak opisu',
                pageCount || 0,
                publishedDate ? publishedDate.substring(0, 10) : null,
                publisher || 'Nieznane wydawnictwo',
                genre || 'Inne',
                language || 'pl',
                coverUrl || ''
            ];

            const [bookResult] = await connection.execute(
                `INSERT INTO ksiazki 
                 (tytul, isbn, opis, liczba_stron, data_wydania, wydawnictwo, gatunek, jezyk, url_okladki) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                bookData
            );
            bookId = bookResult.insertId;
            isNewBook = true;

            // Dodaj autorów
            if (authors && authors.length > 0) {
                for (const authorName of authors) {
                    if (!authorName || authorName.trim() === '') continue;

                    // Sprawdź czy autor już istnieje
                    const [existingAuthors] = await connection.execute(
                        'SELECT id FROM autorzy WHERE imie_nazwisko = ?',
                        [authorName.trim()]
                    );

                    let authorId;

                    if (existingAuthors.length > 0) {
                        authorId = existingAuthors[0].id;
                    } else {
                        const [authorResult] = await connection.execute(
                            'INSERT INTO autorzy (imie_nazwisko) VALUES (?)',
                            [authorName.trim()]
                        );
                        authorId = authorResult.insertId;
                    }

                    // Połącz książkę z autorem
                    await connection.execute(
                        'INSERT IGNORE INTO ksiazka_autorzy (ksiazka_id, autor_id) VALUES (?, ?)',
                        [bookId, authorId]
                    );
                }
            }

            console.log('✅ Book added to database with ID:', bookId);
        } else {
            console.log('📖 Book already exists in database with ID:', bookId);
        }

        // KROK 3: Sprawdź czy użytkownik już ma tę książkę w bibliotece
        const [existingStatus] = await connection.execute(
            'SELECT id FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        if (existingStatus.length === 0) {
            // Dodaj książkę do biblioteki użytkownika
            await connection.execute(
                'INSERT INTO statusy_czytania (uzytkownik_id, ksiazka_id, status) VALUES (?, ?, ?)',
                [userId, bookId, 'chce_przeczytac']
            );
            isNewInLibrary = true;
            console.log('📚 Book added to user library');
        } else {
            console.log('ℹ️ Book already in user library');
        }

        await connection.commit();

        // Wyczyść cache wyszukiwania
        searchCache.clear();

        // Przygotuj odpowiedź
        let message = '';
        if (isNewBook && isNewInLibrary) {
            message = 'Książka została dodana do bazy danych i Twojej biblioteki';
        } else if (isNewBook) {
            message = 'Książka została dodana do bazy danych';
        } else if (isNewInLibrary) {
            message = 'Książka została dodana do Twojej biblioteki';
        } else {
            message = 'Książka już znajduje się w Twojej bibliotece';
        }

        res.status(201).json({
            success: true,
            message: message,
            bookId: bookId,
            isNewBook: isNewBook,
            isNewInLibrary: isNewInLibrary
        });

    } catch (error) {
        await connection.rollback();
        console.error('💥 Add-book error:', error);

        let errorMessage = 'Błąd podczas dodawania książki';
        let statusCode = 500;

        if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Książka już istnieje w bazie danych';
            statusCode = 409;
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            errorMessage = 'Błąd relacji w bazie danych';
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: error.message,
            errorCode: error.code
        });
    } finally {
        connection.release();
    }
});

// Usuwanie książki z biblioteki użytkownika
router.delete('/books/:bookId/remove-from-library', authenticateToken, async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.userId;

        if (!bookId || isNaN(bookId)) {
            return res.status(400).json({
                success: false,
                message: 'Nieprawidłowy identyfikator książki'
            });
        }

        // Sprawdź czy książka jest w bibliotece użytkownika
        const [existingStatus] = await db.promisePool.execute(
            'SELECT id FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        if (existingStatus.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Książka nie znajduje się w Twojej bibliotece'
            });
        }

        // Usuń status czytania
        await db.promisePool.execute(
            'DELETE FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        // Wyczyść cache wyszukiwania
        searchCache.clear();

        res.json({
            success: true,
            message: 'Książka została usunięta z Twojej biblioteki'
        });

    } catch (error) {
        console.error('Remove from library error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas usuwania książki z biblioteki',
            error: error.message
        });
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

    res.json({
        success: true,
        suggestions: popularSearches
    });
});

module.exports = router;