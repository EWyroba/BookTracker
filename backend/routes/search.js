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

// Funkcja do pobierania średniej oceny z bazy dla książki
const getBookRatingStats = async (bookId) => {
    try {
        const [ratingStats] = await db.promisePool.execute(`
            SELECT 
                COALESCE(AVG(ocena), 0) as srednia_ocena,
                COUNT(DISTINCT CASE WHEN ocena IS NOT NULL THEN uzytkownik_id END) as liczba_ocen
            FROM statusy_czytania 
            WHERE ksiazka_id = ? AND ocena IS NOT NULL
        `, [bookId]);

        return {
            srednia_ocena: parseFloat(ratingStats[0]?.srednia_ocena || 0).toFixed(1),
            liczba_ocen: ratingStats[0]?.liczba_ocen || 0
        };
    } catch (error) {
        console.error('Error fetching book rating stats:', error);
        return {
            srednia_ocena: '0.0',
            liczba_ocen: 0
        };
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
                 s.ocena as user_rating,
                 s.aktualna_strona,
                 s.data_rozpoczecia,
                 s.data_zakonczenia,
                 COALESCE(AVG(s2.ocena), 0) as srednia_ocena,
                 COUNT(DISTINCT s2.ocena) as liczba_ocen
             FROM ksiazki k
                      LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
                      LEFT JOIN autorzy a ON ka.autor_id = a.id
                      LEFT JOIN statusy_czytania s ON k.id = s.ksiazka_id AND s.uzytkownik_id = ?
                      LEFT JOIN statusy_czytania s2 ON k.id = s2.ksiazka_id AND s2.ocena IS NOT NULL
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
                isInUserLibrary: !!book.status,
                srednia_ocena: parseFloat(book.srednia_ocena || 0).toFixed(1),
                liczba_ocen: book.liczba_ocen || 0,
                readingStatus: {
                    status: book.status,
                    ocena: book.user_rating,
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

// Funkcja do pobierania statystyk ocen dla wielu książek
const getBooksRatingStatsBatch = async (bookIds) => {
    try {
        if (bookIds.length === 0) {
            return {};
        }

        const [ratingStats] = await db.promisePool.execute(`
            SELECT 
                ksiazka_id,
                COALESCE(AVG(ocena), 0) as srednia_ocena,
                COUNT(DISTINCT CASE WHEN ocena IS NOT NULL THEN uzytkownik_id END) as liczba_ocen
            FROM statusy_czytania 
            WHERE ksiazka_id IN (${bookIds.join(',')}) AND ocena IS NOT NULL
            GROUP BY ksiazka_id
        `);

        const ratingMap = {};
        ratingStats.forEach(stat => {
            ratingMap[stat.ksiazka_id] = {
                srednia_ocena: parseFloat(stat.srednia_ocena || 0).toFixed(1),
                liczba_ocen: stat.liczba_ocen || 0
            };
        });

        return ratingMap;
    } catch (error) {
        console.error('Error fetching batch rating stats:', error);
        return {};
    }
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

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return res.json({
                success: true,
                ...cached.data
            });
        }

        console.log('🔍 Searching for:', q, 'source:', searchSource, 'user:', req.user.userId);

        let googleResults = { books: [], totalResults: 0, hasMore: false };
        let localResults = { books: [], totalResults: 0, hasMore: false };

        // WYSZUKIWANIE W GOOGLE BOOKS
        if (searchSource === 'google' || searchSource === 'both') {
            try {
                let searchQuery = q;

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
                        searchQuery = q.trim();
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
                    const validBooks = response.data.items.filter(item =>
                        item.volumeInfo && item.volumeInfo.title
                    );

                    const limitedBooks = validBooks.slice(0, parseInt(maxResults));

                    // Zbierz ID książek które istnieją w naszej bazie
                    const existingBookIds = [];

                    const books = await Promise.all(
                        limitedBooks.map(async (item) => {
                            const volumeInfo = item.volumeInfo;

                            let existingBookId = null;
                            let isInUserLibrary = false;
                            let srednia_ocena = '0.0';
                            let liczba_ocen = 0;

                            try {
                                const isbn = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                                    volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '';

                                if (isbn) {
                                    const [existingBooks] = await db.promisePool.execute(
                                        'SELECT id FROM ksiazki WHERE isbn = ? LIMIT 1',
                                        [isbn]
                                    );
                                    if (existingBooks.length > 0) {
                                        existingBookId = existingBooks[0].id;
                                        isInUserLibrary = await checkIfInUserLibrary(existingBookId, req.user.userId);

                                        // Pobierz statystyki ocen z naszej bazy
                                        const ratingStats = await getBookRatingStats(existingBookId);
                                        srednia_ocena = ratingStats.srednia_ocena;
                                        liczba_ocen = ratingStats.liczba_ocen;

                                        existingBookIds.push(existingBookId);
                                    }
                                }
                            } catch (dbError) {
                                console.error('Database check error:', dbError);
                            }

                            return {
                                source: 'google',
                                googleBooksId: item.id,
                                existingBookId: existingBookId,
                                isInUserLibrary: isInUserLibrary,
                                tytul: volumeInfo.title || 'Brak tytułu',
                                autorzy: volumeInfo.authors || ['Autor nieznany'],
                                isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                                    volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '',
                                opis: volumeInfo.description ?
                                    volumeInfo.description.substring(0, 500) + (volumeInfo.description.length > 500 ? '...' : '') :
                                    'Brak opisu',
                                liczba_stron: volumeInfo.pageCount || null,
                                data_wydania: volumeInfo.publishedDate || '',
                                wydawnictwo: volumeInfo.publisher || 'Nieznane wydawnictwo',
                                gatunek: volumeInfo.categories?.[0] || 'Inne',
                                jezyk: volumeInfo.language || 'pl',
                                url_okladki: volumeInfo.imageLinks?.thumbnail ||
                                    volumeInfo.imageLinks?.smallThumbnail || '',
                                previewLink: volumeInfo.previewLink || '',
                                rating: volumeInfo.averageRating || null,
                                ratingsCount: volumeInfo.ratingsCount || 0,
                                // Użyj oceny z Google tylko jeśli nie mamy własnej
                                srednia_ocena: srednia_ocena !== '0.0' ? srednia_ocena : (volumeInfo.averageRating || '0.0'),
                                liczba_ocen: liczba_ocen > 0 ? liczba_ocen : (volumeInfo.ratingsCount || 0),
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

        // WYSZUKIWANIE W LOKALNEJ BAZIE DANYCH
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

        // POŁĄCZ WYNIKI
        let combinedBooks = [];
        let totalResults = 0;

        if (searchSource === 'google') {
            combinedBooks = googleResults.books;
            totalResults = googleResults.totalResults;
        } else if (searchSource === 'local') {
            combinedBooks = localResults.books;
            totalResults = localResults.totalResults;
        } else {
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

// POPRAWIONE DODAWANIE KSIĄŻKI
router.post('/add-book', authenticateToken, async (req, res) => {
    console.log('📥 =========== ADD-BOOK REQUEST START ===========');
    console.log('📥 User ID:', req.user.userId);
    console.log('📥 Request body:', req.body);

    const connection = await db.promisePool.getConnection();

    try {
        const {
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
            googleBooksId,
            existingBookId
        } = req.body;

        const userId = req.user.userId;

        console.log('📥 Parsed data:', {
            title,
            authors,
            isbn,
            googleBooksId,
            existingBookId
        });

        // WALIDACJA DANYCH
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Tytuł książki jest wymagany'
            });
        }

        if (!authors || !Array.isArray(authors) || authors.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Autor książki jest wymagany'
            });
        }

        await connection.beginTransaction();

        let bookId = existingBookId;
        let isNewBook = false;
        let isNewInLibrary = false;

        // KROK 1: SPRAWDŹ CZY KSIĄŻKA JUŻ ISTNIEJE W BAZIE
        if (!bookId) {
            console.log('🔍 Checking if book exists in database...');

            // Spróbuj znaleźć po ISBN
            if (isbn && isbn.trim() !== '') {
                const [booksByISBN] = await connection.execute(
                    'SELECT id FROM ksiazki WHERE isbn = ?',
                    [isbn.trim()]
                );
                if (booksByISBN.length > 0) {
                    bookId = booksByISBN[0].id;
                    console.log(`✅ Found book by ISBN: ${isbn}, ID: ${bookId}`);
                }
            }

            // Jeśli nie znaleziono po ISBN, spróbuj po tytule i pierwszym autorze
            if (!bookId) {
                const cleanTitle = title.trim();
                const firstAuthor = authors[0]?.trim() || '';

                if (cleanTitle && firstAuthor) {
                    const [booksByTitle] = await connection.execute(
                        `SELECT k.id 
                         FROM ksiazki k 
                         LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id 
                         LEFT JOIN autorzy a ON ka.autor_id = a.id 
                         WHERE k.tytul = ? AND a.imie_nazwisko = ? 
                         LIMIT 1`,
                        [cleanTitle, firstAuthor]
                    );
                    if (booksByTitle.length > 0) {
                        bookId = booksByTitle[0].id;
                        console.log(`✅ Found book by title and author: ${cleanTitle}, ID: ${bookId}`);
                    }
                }
            }
        }

        // KROK 2: DODAJ KSIĄŻKĘ DO BAZY (JEŚLI NIE ISTNIEJE)
        if (!bookId) {
            console.log('📚 Adding new book to database...');

            // Przygotuj dane
            const cleanTitle = title.trim();
            const cleanIsbn = isbn ? isbn.trim() : '';
            const cleanDescription = description || 'Brak opisu';
            const cleanPageCount = pageCount || 0;
            const cleanPublishedDate = publishedDate ? publishedDate.substring(0, 10) : null;
            const cleanPublisher = publisher || 'Nieznane wydawnictwo';
            const cleanGenre = genre || 'Inne';
            const cleanLanguage = language || 'pl';
            const cleanCoverUrl = coverUrl || '';

            console.log('📚 Book data to insert:', {
                title: cleanTitle,
                isbn: cleanIsbn,
                pageCount: cleanPageCount,
                publishedDate: cleanPublishedDate
            });

            try {
                // Sprawdź czy jest wydawnictwo w bazie
                let wydawnictwoId = null;

                if (cleanPublisher && cleanPublisher.trim() !== '') {
                    const [wydawnictwa] = await connection.execute(
                        'SELECT id FROM wydawnictwa WHERE nazwa = ?',
                        [cleanPublisher]
                    );

                    if (wydawnictwa.length > 0) {
                        wydawnictwoId = wydawnictwa[0].id;
                    } else {
                        const [newWydawnictwo] = await connection.execute(
                            'INSERT INTO wydawnictwa (nazwa) VALUES (?)',
                            [cleanPublisher]
                        );
                        wydawnictwoId = newWydawnictwo.insertId;
                    }
                }

                // Dodaj książkę
                const [bookResult] = await connection.execute(
                    `INSERT INTO ksiazki 
                     (tytul, isbn, opis, liczba_stron, data_wydania, wydawnictwo_id, gatunek, jezyk, url_okladki, google_books_id) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        cleanTitle,
                        cleanIsbn,
                        cleanDescription,
                        cleanPageCount,
                        cleanPublishedDate,
                        wydawnictwoId,
                        cleanGenre,
                        cleanLanguage,
                        cleanCoverUrl,
                        googleBooksId || null
                    ]
                );
                bookId = bookResult.insertId;
                isNewBook = true;
                console.log(`✅ Book added to database with ID: ${bookId}`);

                // DODAJ AUTORÓW
                console.log(`👥 Adding ${authors.length} author(s)...`);
                for (const authorName of authors) {
                    if (!authorName || authorName.trim() === '') continue;

                    const cleanAuthorName = authorName.trim();

                    try {
                        // Sprawdź czy autor istnieje
                        const [existingAuthors] = await connection.execute(
                            'SELECT id FROM autorzy WHERE imie_nazwisko = ?',
                            [cleanAuthorName]
                        );

                        let authorId;

                        if (existingAuthors.length > 0) {
                            authorId = existingAuthors[0].id;
                            console.log(`✅ Author exists: ${cleanAuthorName}, ID: ${authorId}`);
                        } else {
                            // Dodaj nowego autora
                            const [authorResult] = await connection.execute(
                                'INSERT INTO autorzy (imie_nazwisko) VALUES (?)',
                                [cleanAuthorName]
                            );
                            authorId = authorResult.insertId;
                            console.log(`✅ Author added: ${cleanAuthorName}, ID: ${authorId}`);
                        }

                        // Połącz książkę z autorem
                        await connection.execute(
                            'INSERT IGNORE INTO ksiazka_autorzy (ksiazka_id, autor_id) VALUES (?, ?)',
                            [bookId, authorId]
                        );
                        console.log(`✅ Linked book ${bookId} with author ${authorId}`);

                    } catch (authorError) {
                        console.error(`❌ Error processing author ${cleanAuthorName}:`, authorError);
                        // Kontynuuj mimo błędu autora
                    }
                }
            } catch (insertError) {
                console.error('❌ Error inserting book:', insertError);
                throw insertError;
            }
        }

        // KROK 3: DODAJ DO BIBLIOTEKI UŻYTKOWNIKA
        console.log(`📚 Checking if book ${bookId} is in user ${userId}'s library...`);

        const [existingStatus] = await connection.execute(
            'SELECT ksiazka_id FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        if (existingStatus.length === 0) {
            console.log(`📚 Adding book ${bookId} to user ${userId}'s library...`);
            await connection.execute(
                'INSERT INTO statusy_czytania (uzytkownik_id, ksiazka_id, status) VALUES (?, ?, ?)',
                [userId, bookId, 'chce_przeczytac']
            );
            isNewInLibrary = true;
            console.log(`✅ Book added to user library`);
        } else {
            console.log(`ℹ️ Book already in user library`);
        }

        await connection.commit();
        console.log('✅ Transaction committed successfully');

        // Wyczyść cache
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

        console.log('📤 Sending success response:', {
            success: true,
            bookId,
            message
        });

        res.status(201).json({
            success: true,
            message: message,
            bookId: bookId,
            isNewBook: isNewBook,
            isNewInLibrary: isNewInLibrary
        });

    } catch (error) {
        await connection.rollback();
        console.error('💥 =========== ADD-BOOK ERROR ===========');
        console.error('💥 Error:', error.message);
        console.error('💥 Stack:', error.stack);

        let errorMessage = 'Błąd podczas dodawania książki';
        let statusCode = 500;

        if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Książka już istnieje w bazie danych';
            statusCode = 409;
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            errorMessage = 'Błąd relacji w bazie danych';
            statusCode = 400;
        } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
            errorMessage = 'Nieprawidłowy format danych';
            statusCode = 400;
        } else if (error.code === 'ER_BAD_NULL_ERROR') {
            errorMessage = 'Brak wymaganych danych';
            statusCode = 400;
        } else if (error.code === 'ER_DATA_TOO_LONG') {
            errorMessage = 'Dane są zbyt długie';
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: error.message,
            errorCode: error.code,
            sqlMessage: error.sqlMessage
        });
    } finally {
        connection.release();
        console.log('🔚 =========== ADD-BOOK REQUEST END ===========');
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

        await db.promisePool.execute(
            'DELETE FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

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

// Popularne wyszukiwania
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