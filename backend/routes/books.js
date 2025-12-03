const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const db = require('../config/database');
const axios = require('axios');
const router = express.Router();

// Pobierz wszystkie książki użytkownika
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const [books] = await db.promisePool.execute(`
            SELECT
                k.*,
                s.status,
                s.aktualna_strona,
                s.ocena,
                s.data_rozpoczecia,
                s.data_zakonczenia,
                GROUP_CONCAT(DISTINCT a.imie_nazwisko) as autorzy
            FROM ksiazki k
                     LEFT JOIN statusy_czytania s ON k.id = s.ksiazka_id AND s.uzytkownik_id = ?
                     LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
                     LEFT JOIN autorzy a ON ka.autor_id = a.id
            WHERE s.uzytkownik_id = ?
            GROUP BY k.id, s.status, s.aktualna_strona, s.ocena, s.data_rozpoczecia, s.data_zakonczenia
            ORDER BY k.id DESC
        `, [userId, userId]);

        const formattedBooks = books.map(book => ({
            ...book,
            autorzy: book.autorzy ? book.autorzy.split(',') : [],
            autor: book.autorzy ? book.autorzy.split(',')[0] : 'Autor nieznany'
        }));

        res.json({ books: formattedBooks });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Szczegóły książki
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId;

        // Sprawdź czy to ID książki z Google Books
        if (bookId.startsWith('google_')) {
            const googleBooksId = bookId.replace('google_', '');

            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`, {
                params: {
                    key: process.env.GOOGLE_BOOKS_API_KEY
                },
                timeout: 10000
            });

            const volumeInfo = response.data.volumeInfo;

            let existingBookId = null;
            const isbn = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '';

            if (isbn) {
                const [existingBooks] = await db.promisePool.execute(
                    'SELECT id FROM ksiazki WHERE isbn = ? LIMIT 1',
                    [isbn]
                );
                existingBookId = existingBooks.length > 0 ? existingBooks[0].id : null;
            }

            const bookDetails = {
                source: 'google',
                id: bookId,
                googleBooksId: googleBooksId,
                existingBookId: existingBookId,
                tytul: volumeInfo.title,
                autorzy: volumeInfo.authors || [],
                isbn: isbn,
                opis: volumeInfo.description || 'Brak opisu',
                liczba_stron: volumeInfo.pageCount || null,
                data_wydania: volumeInfo.publishedDate || '',
                wydawnictwo: volumeInfo.publisher || '',
                gatunek: volumeInfo.categories?.[0] || '',
                jezyk: volumeInfo.language || 'pl',
                url_okladki: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '',
                rating: volumeInfo.averageRating || null,
                ratingsCount: volumeInfo.ratingsCount || 0,
                previewLink: volumeInfo.previewLink || '',
                status: null,
                aktualna_strona: 0,
                ocena: null,
                recenzja: null,
                data_rozpoczecia: null,
                data_zakonczenia: null,
                postep: 0,
                notatki: [],
                statystyki: {
                    liczba_notatek: 0,
                    ostatnia_strona_z_notatka: 0
                }
            };

            return res.json({ book: bookDetails });
        }

        // Dla lokalnych książek
        const [books] = await db.promisePool.execute(`
            SELECT
                k.*,
                w.nazwa as wydawnictwo_nazwa,
                GROUP_CONCAT(DISTINCT a.imie_nazwisko) as autorzy
            FROM ksiazki k
                     LEFT JOIN wydawnictwa w ON k.wydawnictwo_id = w.id
                     LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
                     LEFT JOIN autorzy a ON ka.autor_id = a.id
            WHERE k.id = ?
            GROUP BY k.id, w.nazwa
        `, [bookId]);

        if (books.length === 0) {
            return res.status(404).json({ message: 'Książka nie znaleziona' });
        }

        const book = books[0];

        const [status] = await db.promisePool.execute(
            'SELECT * FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        const [notes] = await db.promisePool.execute(
            'SELECT * FROM zakladki WHERE uzytkownik_id = ? AND ksiazka_id = ? ORDER BY numer_strony ASC',
            [userId, bookId]
        );

        const bookDetails = {
            ...book,
            autorzy: book.autorzy ? book.autorzy.split(',') : [],
            autor: book.autorzy ? book.autorzy.split(',')[0] : 'Autor nieznany',
            wydawnictwo: book.wydawnictwo_nazwa,
            status: status[0]?.status || null,
            aktualna_strona: status[0]?.aktualna_strona || 0,
            ocena: status[0]?.ocena || null,
            recenzja: status[0]?.recenzja || null,
            data_rozpoczecia: status[0]?.data_rozpoczecia || null,
            data_zakonczenia: status[0]?.data_zakonczenia || null,
            notatki: notes || [],
            statystyki: {
                liczba_notatek: notes.length,
                ostatnia_strona_z_notatka: notes.length > 0 ? Math.max(...notes.map(n => n.numer_strony)) : 0
            },
            postep: book.liczba_stron && status[0]?.aktualna_strona ?
                Math.round((status[0].aktualna_strona / book.liczba_stron) * 100) : 0
        };

        res.json({ book: bookDetails });

    } catch (error) {
        console.error('Get book details error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Dodaj nową książkę
router.post('/', authenticateToken, async (req, res) => {
    const connection = await db.promisePool.getConnection();

    try {
        const {
            tytul,
            autor,
            isbn,
            liczba_stron,
            gatunek,
            url_okladki,
            wydawnictwo,
            data_wydania,
            jezyk,
            opis
        } = req.body;

        const userId = req.user.userId;

        if (!tytul || !tytul.trim()) {
            return res.status(400).json({ message: 'Tytuł jest wymagany' });
        }

        if (!autor || !autor.trim()) {
            return res.status(400).json({ message: 'Autor jest wymagany' });
        }

        if (!wydawnictwo || !wydawnictwo.trim()) {
            return res.status(400).json({ message: 'Wydawnictwo jest wymagane' });
        }

        if (!isbn || !isbn.trim()) {
            return res.status(400).json({ message: 'ISBN jest wymagany' });
        }

        const pages = parseInt(liczba_stron);
        if (isNaN(pages) || pages <= 0) {
            return res.status(400).json({ message: 'Liczba stron musi być poprawną liczbą większą niż 0' });
        }

        await connection.beginTransaction();

        // Sprawdź czy książka już istnieje
        let existingBookId = null;

        if (isbn && isbn.trim()) {
            const [booksByISBN] = await connection.execute(
                `SELECT k.id
                 FROM ksiazki k
                 WHERE k.isbn = ?`,
                [isbn.trim()]
            );

            if (booksByISBN.length > 0) {
                existingBookId = booksByISBN[0].id;
            }
        }

        if (!existingBookId) {
            const [booksByTitleAuthor] = await connection.execute(
                `SELECT k.id
                 FROM ksiazki k
                          JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
                          JOIN autorzy a ON ka.autor_id = a.id
                 WHERE k.tytul = ? AND a.imie_nazwisko = ?`,
                [tytul.trim(), autor.trim()]
            );

            if (booksByTitleAuthor.length > 0) {
                existingBookId = booksByTitleAuthor[0].id;
            }
        }

        if (existingBookId) {
            const [existingStatus] = await connection.execute(
                'SELECT id FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
                [userId, existingBookId]
            );

            if (existingStatus.length === 0) {
                await connection.execute(
                    'INSERT INTO statusy_czytania (uzytkownik_id, ksiazka_id, status) VALUES (?, ?, ?)',
                    [userId, existingBookId, 'chce_przeczytac']
                );
            }

            await connection.commit();

            return res.status(200).json({
                message: 'Książka już istnieje w bazie. Dodano do Twojej biblioteki.',
                bookId: existingBookId,
                existingBook: true
            });
        }

        // Znajdź lub utwórz wydawnictwo
        let wydawnictwoId = null;
        const [existingWydawnictwa] = await connection.execute(
            'SELECT id FROM wydawnictwa WHERE nazwa = ?',
            [wydawnictwo.trim()]
        );

        if (existingWydawnictwa.length > 0) {
            wydawnictwoId = existingWydawnictwa[0].id;
        } else {
            const [newWydawnictwo] = await connection.execute(
                'INSERT INTO wydawnictwa (nazwa) VALUES (?)',
                [wydawnictwo.trim()]
            );
            wydawnictwoId = newWydawnictwo.insertId;
        }

        // Dodaj książkę
        const [bookResult] = await connection.execute(
            `INSERT INTO ksiazki
             (tytul, isbn, liczba_stron, gatunek, url_okladki, wydawnictwo_id, data_wydania, jezyk, opis)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tytul.trim(),
                isbn.trim(),
                pages,
                gatunek || '',
                url_okladki || '',
                wydawnictwoId,
                data_wydania || null,
                jezyk || 'polski',
                opis || ''
            ]
        );

        const bookId = bookResult.insertId;

        // Obsługa autora
        if (autor && autor.trim()) {
            const [existingAuthors] = await connection.execute(
                'SELECT id FROM autorzy WHERE imie_nazwisko = ?',
                [autor.trim()]
            );

            let authorId;
            if (existingAuthors.length > 0) {
                authorId = existingAuthors[0].id;
            } else {
                const [authorResult] = await connection.execute(
                    'INSERT INTO autorzy (imie_nazwisko) VALUES (?)',
                    [autor.trim()]
                );
                authorId = authorResult.insertId;
            }

            await connection.execute(
                'INSERT INTO ksiazka_autorzy (ksiazka_id, autor_id) VALUES (?, ?)',
                [bookId, authorId]
            );
        }

        // Dodaj domyślny status
        await connection.execute(
            'INSERT INTO statusy_czytania (uzytkownik_id, ksiazka_id, status) VALUES (?, ?, ?)',
            [userId, bookId, 'chce_przeczytac']
        );

        await connection.commit();

        res.status(201).json({
            message: 'Książka dodana pomyślnie',
            bookId: bookId,
            existingBook: false
        });

    } catch (error) {
        await connection.rollback();
        console.error('Add book error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    } finally {
        connection.release();
    }
});

// Edytuj książkę
router.put('/:id', authenticateToken, async (req, res) => {
    const connection = await db.promisePool.getConnection();

    try {
        const bookId = req.params.id;
        const userId = req.user.userId;
        const {
            tytul,
            autor,
            isbn,
            opis,
            liczba_stron,
            gatunek,
            url_okladki,
            wydawnictwo,
            data_wydania,
            jezyk
        } = req.body;

        const [books] = await db.promisePool.execute(
            'SELECT id FROM ksiazki WHERE id = ?',
            [bookId]
        );

        if (books.length === 0) {
            return res.status(404).json({ message: 'Książka nie znaleziona' });
        }

        if (!tytul || !tytul.trim()) {
            return res.status(400).json({ message: 'Tytuł jest wymagany' });
        }

        if (!autor || !autor.trim()) {
            return res.status(400).json({ message: 'Autor jest wymagany' });
        }

        if (!wydawnictwo || !wydawnictwo.trim()) {
            return res.status(400).json({ message: 'Wydawnictwo jest wymagane' });
        }

        if (!isbn || !isbn.trim()) {
            return res.status(400).json({ message: 'ISBN jest wymagany' });
        }

        if (liczba_stron && liczba_stron <= 0) {
            return res.status(400).json({ message: 'Liczba stron musi być większa niż 0' });
        }

        await connection.beginTransaction();

        // Znajdź lub utwórz wydawnictwo
        let wydawnictwoId = null;
        const [existingWydawnictwa] = await connection.execute(
            'SELECT id FROM wydawnictwa WHERE nazwa = ?',
            [wydawnictwo.trim()]
        );

        if (existingWydawnictwa.length > 0) {
            wydawnictwoId = existingWydawnictwa[0].id;
        } else {
            const [newWydawnictwo] = await connection.execute(
                'INSERT INTO wydawnictwa (nazwa) VALUES (?)',
                [wydawnictwo.trim()]
            );
            wydawnictwoId = newWydawnictwo.insertId;
        }

        // Aktualizuj książkę
        await connection.execute(
            `UPDATE ksiazki
             SET tytul = ?, isbn = ?, opis = ?, liczba_stron = ?, gatunek = ?,
                 url_okladki = ?, wydawnictwo_id = ?, data_wydania = ?, jezyk = ?
             WHERE id = ?`,
            [
                tytul.trim(),
                isbn.trim(),
                opis || '',
                liczba_stron || null,
                gatunek || '',
                url_okladki || '',
                wydawnictwoId,
                data_wydania || null,
                jezyk || 'polski',
                bookId
            ]
        );

        // Aktualizuj autora
        if (autor && autor.trim()) {
            await connection.execute(
                'DELETE FROM ksiazka_autorzy WHERE ksiazka_id = ?',
                [bookId]
            );

            const [existingAuthors] = await connection.execute(
                'SELECT id FROM autorzy WHERE imie_nazwisko = ?',
                [autor.trim()]
            );

            let authorId;
            if (existingAuthors.length > 0) {
                authorId = existingAuthors[0].id;
            } else {
                const [authorResult] = await connection.execute(
                    'INSERT INTO autorzy (imie_nazwisko) VALUES (?)',
                    [autor.trim()]
                );
                authorId = authorResult.insertId;
            }

            await connection.execute(
                'INSERT INTO ksiazka_autorzy (ksiazka_id, autor_id) VALUES (?, ?)',
                [bookId, authorId]
            );
        }

        await connection.commit();

        res.json({
            message: 'Książka zaktualizowana pomyślnie',
            bookId: bookId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Update book error:', error);
        res.status(500).json({
            message: 'Błąd serwera podczas aktualizacji książki',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// Lista wydawnictw
router.get('/wydawnictwa/list', authenticateToken, async (req, res) => {
    try {
        const [wydawnictwa] = await db.promisePool.execute(
            'SELECT id, nazwa FROM wydawnictwa ORDER BY nazwa'
        );

        res.json({ wydawnictwa });
    } catch (error) {
        console.error('Get wydawnictwa list error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Aktualizuj status czytania
router.post('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status, aktualna_strona, ocena, recenzja } = req.body;
        const bookId = req.params.id;
        const userId = req.user.userId;

        const [books] = await db.promisePool.execute(
            'SELECT id, liczba_stron FROM ksiazki WHERE id = ?',
            [bookId]
        );

        if (books.length === 0) {
            return res.status(404).json({ message: 'Książka nie znaleziona' });
        }

        const book = books[0];
        const finalAktualnaStrona = aktualna_strona || 0;

        let finalStatus = status;
        let data_zakonczenia = null;

        if (book.liczba_stron && finalAktualnaStrona >= book.liczba_stron) {
            finalStatus = 'przeczytana';
            data_zakonczenia = new Date().toISOString().split('T')[0];
        } else if (finalStatus === 'przeczytana' && finalAktualnaStrona < book.liczba_stron) {
            data_zakonczenia = new Date().toISOString().split('T')[0];
        }

        const [existingStatus] = await db.promisePool.execute(
            'SELECT * FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        let data_rozpoczecia = null;

        if (finalStatus === 'aktualnie_czytam') {
            data_rozpoczecia = new Date().toISOString().split('T')[0];
        } else if (finalStatus === 'przeczytana' && !data_zakonczenia) {
            data_zakonczenia = new Date().toISOString().split('T')[0];
        }

        if (finalStatus === 'przeczytana' && book.liczba_stron && finalAktualnaStrona < book.liczba_stron) {
            finalStatus = 'aktualnie_czytam';
            data_zakonczenia = null;
        }

        const finalOcena = ocena || null;
        const finalRecenzja = recenzja || null;

        if (existingStatus.length > 0) {
            await db.promisePool.execute(
                `UPDATE statusy_czytania
                 SET status = ?, aktualna_strona = ?, ocena = ?, recenzja = ?,
                     data_rozpoczecia = COALESCE(?, data_rozpoczecia),
                     data_zakonczenia = ?
                 WHERE uzytkownik_id = ? AND ksiazka_id = ?`,
                [finalStatus, finalAktualnaStrona, finalOcena, finalRecenzja, data_rozpoczecia, data_zakonczenia, userId, bookId]
            );
        } else {
            await db.promisePool.execute(
                'INSERT INTO statusy_czytania (uzytkownik_id, ksiazka_id, status, aktualna_strona, ocena, recenzja, data_rozpoczecia, data_zakonczenia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, bookId, finalStatus, finalAktualnaStrona, finalOcena, finalRecenzja, data_rozpoczecia, data_zakonczenia]
            );
        }

        res.json({
            message: 'Status zaktualizowany pomyślnie',
            status: finalStatus,
            aktualna_strona: finalAktualnaStrona
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// System notatek
router.post('/:id/notes', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId;
        const { numer_strony, notatka, tekst_cytatu } = req.body;

        const [result] = await db.promisePool.execute(
            'INSERT INTO zakladki (uzytkownik_id, ksiazka_id, numer_strony, notatka, tekst_cytatu) VALUES (?, ?, ?, ?, ?)',
            [userId, bookId, numer_strony, notatka, tekst_cytatu || '']
        );

        res.status(201).json({
            message: 'Notatka dodana pomyślnie',
            noteId: result.insertId
        });

    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Pobierz notatki
router.get('/:id/notes', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId;

        const [notes] = await db.promisePool.execute(
            'SELECT * FROM zakladki WHERE uzytkownik_id = ? AND ksiazka_id = ? ORDER BY numer_strony ASC',
            [userId, bookId]
        );

        res.json({ notes });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Usuń notatkę
router.delete('/notes/:noteId', authenticateToken, async (req, res) => {
    try {
        const noteId = req.params.noteId;
        const userId = req.user.userId;

        const [notes] = await db.promisePool.execute(
            'SELECT id FROM zakladki WHERE id = ? AND uzytkownik_id = ?',
            [noteId, userId]
        );

        if (notes.length === 0) {
            return res.status(404).json({ message: 'Notatka nie znaleziona lub brak uprawnień' });
        }

        await db.promisePool.execute(
            'DELETE FROM zakladki WHERE id = ?',
            [noteId]
        );

        res.json({
            message: 'Notatka usunięta pomyślnie',
            success: true
        });

    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Endpoint do pobrania dostępnych gatunków
router.get('/genres/available', authenticateToken, async (req, res) => {
    try {
        const AVAILABLE_GENRES = [
            'Fantastyka', 'Science Fiction', 'Kryminał', 'Thriller', 'Romans', 'Horror',
            'Literatura piękna', 'Literatura popularnonaukowa', 'Biografia', 'Autobiografia',
            'Historical', 'Przygodowa', 'Dramat', 'Poezja', 'Komedia', 'Young Adult',
            'Dziecięca', 'Poradnik', 'Reportaż', 'Publicystyka', 'Klasyka', 'Obyczajowa',
            'Sensacja', 'Fantasy', 'Paranormal', 'Postapokaliptyczna', 'Urban Fantasy',
            'High Fantasy', 'Cyberpunk', 'Steampunk', 'Space Opera', 'Military SF',
            'Hard SF', 'Kryminał policyjny', 'Kryminał sądowy', 'Noir', 'Thriller psychologiczny',
            'Thriller polityczny', 'Thriller medyczny', 'Romans historyczny', 'Romans współczesny',
            'Romans erotyczny', 'New Adult', 'Literatura faktu', 'Podróżnicza', 'Kucharska',
            'Poradnik psychologiczny', 'Rozwój osobisty', 'Biznes', 'Inne'
        ];

        res.json({ genres: AVAILABLE_GENRES });
    } catch (error) {
        console.error('Get genres error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Edytuj notatkę
router.put('/notes/:noteId', authenticateToken, async (req, res) => {
    try {
        const noteId = req.params.noteId;
        const userId = req.user.userId;
        const { numer_strony, notatka, tekst_cytatu, czy_publiczna } = req.body;

        const [notes] = await db.promisePool.execute(
            'SELECT id FROM zakladki WHERE id = ? AND uzytkownik_id = ?',
            [noteId, userId]
        );

        if (notes.length === 0) {
            return res.status(404).json({ message: 'Notatka nie znaleziona lub brak uprawnień' });
        }

        if (!numer_strony || numer_strony < 0) {
            return res.status(400).json({ message: 'Numer strony jest wymagany i musi być liczbą dodatnią' });
        }

        if (!notatka || !notatka.trim()) {
            return res.status(400).json({ message: 'Notatka jest wymagana' });
        }

        await db.promisePool.execute(
            `UPDATE zakladki
             SET numer_strony = ?, notatka = ?, tekst_cytatu = ?, czy_publiczna = ?
             WHERE id = ?`,
            [numer_strony, notatka.trim(), tekst_cytatu || '', czy_publiczna || false, noteId]
        );

        res.json({
            message: 'Notatka zaktualizowana pomyślnie',
            noteId: noteId
        });

    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Pobierz pojedynczą notatkę
router.get('/notes/single/:noteId', authenticateToken, async (req, res) => {
    try {
        const noteId = req.params.noteId;
        const userId = req.user.userId;

        const [notes] = await db.promisePool.execute(
            `SELECT z.*, k.tytul as ksiazka_tytul
             FROM zakladki z
                      JOIN ksiazki k ON z.ksiazka_id = k.id
             WHERE z.id = ? AND z.uzytkownik_id = ?`,
            [noteId, userId]
        );

        if (notes.length === 0) {
            return res.status(404).json({ message: 'Notatka nie znaleziona' });
        }

        res.json({ note: notes[0] });

    } catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Usuwanie książki z biblioteki użytkownika
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId;

        await db.promisePool.execute(
            'DELETE FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        await db.promisePool.execute(
            'DELETE FROM zakladki WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        await db.promisePool.execute(
            'DELETE FROM ksiazki_na_polkach WHERE ksiazka_id = ? AND polka_id IN (SELECT id FROM polki WHERE uzytkownik_id = ?)',
            [bookId, userId]
        );

        res.json({
            message: 'Książka usunięta z Twojej biblioteki',
            success: true
        });

    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({
            message: 'Błąd serwera podczas usuwania książki',
            error: error.message
        });
    }
});

// Usuń książkę z biblioteki (dla wyszukiwarki)
router.delete('/:id/remove-from-library', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId;

        console.log('🗑️ Removing book from library:', { bookId, userId });

        // Usuń tylko status czytania (książka pozostaje w bazie)
        await db.promisePool.execute(
            'DELETE FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        // Usuń notatki użytkownika dla tej książki
        await db.promisePool.execute(
            'DELETE FROM zakladki WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        // Usuń z półek użytkownika
        await db.promisePool.execute(
            'DELETE FROM ksiazki_na_polkach WHERE ksiazka_id = ? AND polka_id IN (SELECT id FROM polki WHERE uzytkownik_id = ?)',
            [bookId, userId]
        );

        res.json({
            message: 'Książka usunięta z Twojej biblioteki',
            success: true
        });

    } catch (error) {
        console.error('Remove from library error:', error);
        res.status(500).json({
            message: 'Błąd podczas usuwania książki z biblioteki',
            error: error.message
        });
    }
});

module.exports = router;