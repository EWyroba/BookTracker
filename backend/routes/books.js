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
                s.recenzja,
                GROUP_CONCAT(DISTINCT a.imie_nazwisko) as autorzy,
                COALESCE(AVG(s2.ocena), 0) as srednia_ocena,
                COUNT(DISTINCT s2.ocena) as liczba_ocen
            FROM ksiazki k
                     LEFT JOIN statusy_czytania s ON k.id = s.ksiazka_id AND s.uzytkownik_id = ?
                     LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
                     LEFT JOIN autorzy a ON ka.autor_id = a.id
                     LEFT JOIN statusy_czytania s2 ON k.id = s2.ksiazka_id AND s2.ocena IS NOT NULL
            WHERE s.uzytkownik_id = ?
            GROUP BY k.id, s.status, s.aktualna_strona, s.ocena, s.recenzja, s.data_rozpoczecia, s.data_zakonczenia
            ORDER BY k.id DESC
        `, [userId, userId]);

        const formattedBooks = books.map(book => ({
            ...book,
            autorzy: book.autorzy ? book.autorzy.split(',') : [],
            autor: book.autorzy ? book.autorzy.split(',')[0] : 'Autor nieznany',
            srednia_ocena: parseFloat(book.srednia_ocena).toFixed(1),
            liczba_ocen: book.liczba_ocen
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
                srednia_ocena: null,
                liczba_ocen: 0,
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
                GROUP_CONCAT(DISTINCT a.imie_nazwisko) as autorzy,
                COALESCE(AVG(s.ocena), 0) as srednia_ocena,
                COUNT(DISTINCT CASE WHEN s.ocena IS NOT NULL THEN s.uzytkownik_id END) as liczba_ocen
            FROM ksiazki k
                     LEFT JOIN wydawnictwa w ON k.wydawnictwo_id = w.id
                     LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
                     LEFT JOIN autorzy a ON ka.autor_id = a.id
                     LEFT JOIN statusy_czytania s ON k.id = s.ksiazka_id AND s.ocena IS NOT NULL
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
            srednia_ocena: parseFloat(book.srednia_ocena).toFixed(1),
            liczba_ocen: book.liczba_ocen,
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

// Aktualizuj status czytania z oceną
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

        // Pobierz zaktualizowane średnie oceny
        const [ratingStats] = await db.promisePool.execute(`
            SELECT 
                COALESCE(AVG(ocena), 0) as srednia_ocena,
                COUNT(DISTINCT CASE WHEN ocena IS NOT NULL THEN uzytkownik_id END) as liczba_ocen
            FROM statusy_czytania 
            WHERE ksiazka_id = ? AND ocena IS NOT NULL
        `, [bookId]);

        res.json({
            message: 'Status zaktualizowany pomyślnie',
            status: finalStatus,
            aktualna_strona: finalAktualnaStrona,
            ocena: finalOcena,
            srednia_ocena: parseFloat(ratingStats[0]?.srednia_ocena || 0).toFixed(1),
            liczba_ocen: ratingStats[0]?.liczba_ocen || 0
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Nowy endpoint do aktualizacji tylko oceny
router.post('/:id/rating', authenticateToken, async (req, res) => {
    try {
        const { ocena, recenzja } = req.body;
        const bookId = req.params.id;
        const userId = req.user.userId;

        if (!ocena || ocena < 0 || ocena > 5) {
            return res.status(400).json({ message: 'Ocena musi być w zakresie 0-5' });
        }

        const [existingStatus] = await db.promisePool.execute(
            'SELECT * FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        if (existingStatus.length > 0) {
            await db.promisePool.execute(
                `UPDATE statusy_czytania 
                 SET ocena = ?, recenzja = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE uzytkownik_id = ? AND ksiazka_id = ?`,
                [ocena, recenzja || null, userId, bookId]
            );
        } else {
            await db.promisePool.execute(
                'INSERT INTO statusy_czytania (uzytkownik_id, ksiazka_id, ocena, recenzja, status) VALUES (?, ?, ?, ?, ?)',
                [userId, bookId, ocena, recenzja || null, 'przeczytana']
            );
        }

        // Pobierz zaktualizowane średnie oceny
        const [ratingStats] = await db.promisePool.execute(`
            SELECT 
                COALESCE(AVG(ocena), 0) as srednia_ocena,
                COUNT(DISTINCT CASE WHEN ocena IS NOT NULL THEN uzytkownik_id END) as liczba_ocen
            FROM statusy_czytania 
            WHERE ksiazka_id = ? AND ocena IS NOT NULL
        `, [bookId]);

        res.json({
            message: 'Ocena została zapisana',
            ocena: ocena,
            srednia_ocena: parseFloat(ratingStats[0]?.srednia_ocena || 0).toFixed(1),
            liczba_ocen: ratingStats[0]?.liczba_ocen || 0
        });

    } catch (error) {
        console.error('Update rating error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Pobierz oceny książki
router.get('/:id/ratings', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;

        const [ratings] = await db.promisePool.execute(`
            SELECT 
                s.ocena,
                s.recenzja,
                s.updated_at,
                u.nazwa_wyswietlana,
                u.url_avatara
            FROM statusy_czytania s
            JOIN uzytkownicy u ON s.uzytkownik_id = u.id
            WHERE s.ksiazka_id = ? AND s.ocena IS NOT NULL
            ORDER BY s.updated_at DESC
        `, [bookId]);

        const [stats] = await db.promisePool.execute(`
            SELECT 
                COALESCE(AVG(ocena), 0) as srednia_ocena,
                COUNT(DISTINCT CASE WHEN ocena IS NOT NULL THEN uzytkownik_id END) as liczba_ocen,
                COUNT(CASE WHEN ocena = 1 THEN 1 END) as ocena_1,
                COUNT(CASE WHEN ocena = 2 THEN 1 END) as ocena_2,
                COUNT(CASE WHEN ocena = 3 THEN 1 END) as ocena_3,
                COUNT(CASE WHEN ocena = 4 THEN 1 END) as ocena_4,
                COUNT(CASE WHEN ocena = 5 THEN 1 END) as ocena_5
            FROM statusy_czytania 
            WHERE ksiazka_id = ? AND ocena IS NOT NULL
        `, [bookId]);

        res.json({
            ratings: ratings,
            stats: {
                srednia_ocena: parseFloat(stats[0]?.srednia_ocena || 0).toFixed(1),
                liczba_ocen: stats[0]?.liczba_ocen || 0,
                distribution: {
                    '1': stats[0]?.ocena_1 || 0,
                    '2': stats[0]?.ocena_2 || 0,
                    '3': stats[0]?.ocena_3 || 0,
                    '4': stats[0]?.ocena_4 || 0,
                    '5': stats[0]?.ocena_5 || 0
                }
            }
        });

    } catch (error) {
        console.error('Get ratings error:', error);
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

// Usuń książkę z biblioteki użytkownika
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId;

        console.log(`🗑️ Removing book ${bookId} from user ${userId}'s library`);

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

// Pobierz statystyki czytania
router.get('/:id/stats', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId;

        const [book] = await db.promisePool.execute(
            'SELECT liczba_stron FROM ksiazki WHERE id = ?',
            [bookId]
        );

        const [status] = await db.promisePool.execute(
            'SELECT * FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        const [notesCount] = await db.promisePool.execute(
            'SELECT COUNT(*) as count FROM zakladki WHERE uzytkownik_id = ? AND ksiazka_id = ?',
            [userId, bookId]
        );

        const [ratingStats] = await db.promisePool.execute(`
            SELECT 
                COALESCE(AVG(ocena), 0) as srednia_ocena,
                COUNT(DISTINCT CASE WHEN ocena IS NOT NULL THEN uzytkownik_id END) as liczba_ocen
            FROM statusy_czytania 
            WHERE ksiazka_id = ? AND ocena IS NOT NULL
        `, [bookId]);

        const pages = book[0]?.liczba_stron || 0;
        const currentPage = status[0]?.aktualna_strona || 0;
        const progress = pages > 0 ? Math.round((currentPage / pages) * 100) : 0;

        res.json({
            totalPages: pages,
            currentPage: currentPage,
            progress: progress,
            notesCount: notesCount[0]?.count || 0,
            status: status[0]?.status || 'nie_przeczytana',
            rating: status[0]?.ocena || null,
            averageRating: parseFloat(ratingStats[0]?.srednia_ocena || 0).toFixed(1),
            totalRatings: ratingStats[0]?.liczba_ocen || 0,
            startDate: status[0]?.data_rozpoczecia,
            endDate: status[0]?.data_zakonczenia
        });

    } catch (error) {
        console.error('Get book stats error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

module.exports = router;