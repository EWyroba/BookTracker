const db = require('../config/database');

const booksController = {
    // Pobierz wszystkie książki użytkownika - POPRAWIONE
    getUserBooks: async (req, res) => {
        try {
            const userId = req.user.userId;

            console.log('📚 Fetching books for user:', userId);

            // POPRAWIONE ZAPYTANIE - książki użytkownika z autorami
            const [books] = await db.promisePool.execute(`
                SELECT 
                    k.*, 
                    s.status, 
                    s.aktualna_strona, 
                    s.ocena,
                    s.data_rozpoczecia,
                    s.data_zakonczenia,
                    GROUP_CONCAT(DISTINCT a.imie_nazwisko) as autorzy
                FROM statusy_czytania s 
                JOIN ksiazki k ON s.ksiazka_id = k.id 
                LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
                LEFT JOIN autorzy a ON ka.autor_id = a.id
                WHERE s.uzytkownik_id = ?
                GROUP BY k.id, s.status, s.aktualna_strona, s.ocena, s.data_rozpoczecia, s.data_zakonczenia
                ORDER BY k.id DESC
            `, [userId]);

            console.log('✅ Raw books from database:', books);

            // Formatuj książki - zamień string autorów na tablicę
            const formattedBooks = books.map(book => ({
                ...book,
                autorzy: book.autorzy ? book.autorzy.split(',') : [],
                // Dodaj pole autor dla kompatybilności (pierwszy autor)
                autor: book.autorzy ? book.autorzy.split(',')[0] : 'Autor nieznany'
            }));

            console.log('📖 Formatted books with authors:', formattedBooks);

            res.json({
                books: formattedBooks,
                debug: {
                    totalBooks: formattedBooks.length,
                    sampleBook: formattedBooks[0]
                }
            });
        } catch (error) {
            console.error('❌ Get books error:', error);
            res.status(500).json({ message: 'Błąd serwera', error: error.message });
        }
    },

    // Pobierz szczegóły książki - POPRAWIONE
    getBookDetails: async (req, res) => {
        try {
            const bookId = req.params.id;
            const userId = req.user.userId;

            console.log('Fetching book details for ID:', bookId);

            // Pobierz podstawowe informacje o książce z autorami
            const [books] = await db.promisePool.execute(`
                SELECT
                    k.*,
                    GROUP_CONCAT(DISTINCT a.imie_nazwisko) as autorzy
                FROM ksiazki k
                         LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
                         LEFT JOIN autorzy a ON ka.autor_id = a.id
                WHERE k.id = ?
                GROUP BY k.id
            `, [bookId]);

            if (books.length === 0) {
                return res.status(404).json({ message: 'Książka nie znaleziona' });
            }

            const book = books[0];

            // Pobierz status czytania
            const [status] = await db.promisePool.execute(
                'SELECT * FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
                [userId, bookId]
            );

            // Pobierz notatki
            const [notes] = await db.promisePool.execute(
                'SELECT * FROM zakladki WHERE uzytkownik_id = ? AND ksiazka_id = ? ORDER BY numer_strony ASC',
                [userId, bookId]
            );

            // Formatuj odpowiedź
            const bookDetails = {
                ...book,
                autorzy: book.autorzy ? book.autorzy.split(',') : [],
                autor: book.autorzy ? book.autorzy.split(',')[0] : 'Autor nieznany',
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

            console.log('✅ Sending book details with authors:', bookDetails.autorzy);

            res.json({ book: bookDetails });

        } catch (error) {
            console.error('❌ Get book details error:', error);
            res.status(500).json({ message: 'Błąd serwera', error: error.message });
        }
    },

    // Dodaj książkę do bazy
    addBook: async (req, res) => {
        const connection = await db.promisePool.getConnection();

        try {
            const { tytul, autor, isbn, liczba_stron, gatunek, url_okladki, opis } = req.body;
            const userId = req.user.userId;

            if (!tytul) {
                return res.status(400).json({ message: 'Tytuł jest wymagany' });
            }

            await connection.beginTransaction();

            // Dodaj książkę
            const [bookResult] = await connection.execute(
                'INSERT INTO ksiazki (tytul, isbn, liczba_stron, gatunek, url_okladki, opis) VALUES (?, ?, ?, ?, ?, ?)',
                [tytul, isbn || '', liczba_stron || null, gatunek || '', url_okladki || '', opis || '']
            );

            const bookId = bookResult.insertId;

            // Jeśli podano autora, dodaj go do bazy
            if (autor && autor.trim()) {
                // Sprawdź czy autor już istnieje
                const [existingAuthors] = await connection.execute(
                    'SELECT id FROM autorzy WHERE imie_nazwisko = ?',
                    [autor.trim()]
                );

                let authorId;

                if (existingAuthors.length > 0) {
                    authorId = existingAuthors[0].id;
                } else {
                    // Dodaj nowego autora
                    const [authorResult] = await connection.execute(
                        'INSERT INTO autorzy (imie_nazwisko) VALUES (?)',
                        [autor.trim()]
                    );
                    authorId = authorResult.insertId;
                }

                // Połącz książkę z autorem
                await connection.execute(
                    'INSERT INTO ksiazka_autorzy (ksiazka_id, autor_id) VALUES (?, ?)',
                    [bookId, authorId]
                );
            }

            // Dodaj domyślny status czytania
            await connection.execute(
                'INSERT INTO statusy_czytania (uzytkownik_id, ksiazka_id, status) VALUES (?, ?, ?)',
                [userId, bookId, 'chce_przeczytac']
            );

            await connection.commit();

            res.status(201).json({
                message: 'Książka dodana pomyślnie',
                bookId: bookId
            });

        } catch (error) {
            await connection.rollback();
            console.error('Add book error:', error);
            res.status(500).json({ message: 'Błąd serwera', error: error.message });
        } finally {
            connection.release();
        }
    },

    // Aktualizuj status czytania
    updateStatus: async (req, res) => {
        try {
            const { status, aktualna_strona, ocena, recenzja } = req.body;
            const bookId = req.params.id;
            const userId = req.user.userId;

            console.log('Update status request:', { userId, bookId, status, aktualna_strona });

            // Sprawdź czy książka istnieje i pobierz liczbę stron
            const [books] = await db.promisePool.execute(
                'SELECT id, liczba_stron FROM ksiazki WHERE id = ?',
                [bookId]
            );

            if (books.length === 0) {
                return res.status(404).json({ message: 'Książka nie znaleziona' });
            }

            const book = books[0];
            const finalAktualnaStrona = aktualna_strona || 0;

            // AUTOMATYCZNA ZMIANA STATUSU - TYLKO GDY OSIĄGNIĘTO 100%
            let finalStatus = status;
            let data_zakonczenia = null;

            if (book.liczba_stron && finalAktualnaStrona >= book.liczba_stron) {
                console.log('📚 Automatically marking book as read - reached 100%');
                finalStatus = 'przeczytana';
                data_zakonczenia = new Date().toISOString().split('T')[0];
            }

            // Sprawdź czy status już istnieje
            const [existingStatus] = await db.promisePool.execute(
                'SELECT * FROM statusy_czytania WHERE uzytkownik_id = ? AND ksiazka_id = ?',
                [userId, bookId]
            );

            let data_rozpoczecia = null;

            // Ustaw daty na podstawie statusu
            if (finalStatus === 'aktualnie_czytam') {
                data_rozpoczecia = new Date().toISOString().split('T')[0];
            } else if (finalStatus === 'przeczytana' && !data_zakonczenia) {
                data_zakonczenia = new Date().toISOString().split('T')[0];
            }

            // Ustaw domyślne wartości
            const finalOcena = ocena || null;
            const finalRecenzja = recenzja || null;

            console.log('Final values:', {
                finalStatus,
                finalAktualnaStrona,
                data_rozpoczecia,
                data_zakonczenia,
                totalPages: book.liczba_stron,
                progress: book.liczba_stron ? Math.round((finalAktualnaStrona / book.liczba_stron) * 100) : 0
            });

            if (existingStatus.length > 0) {
                // Aktualizuj istniejący status
                await db.promisePool.execute(
                    `UPDATE statusy_czytania
                     SET status = ?, aktualna_strona = ?, ocena = ?, recenzja = ?,
                         data_rozpoczecia = COALESCE(?, data_rozpoczecia),
                         data_zakonczenia = ?
                     WHERE uzytkownik_id = ? AND ksiazka_id = ?`,
                    [finalStatus, finalAktualnaStrona, finalOcena, finalRecenzja, data_rozpoczecia, data_zakonczenia, userId, bookId]
                );
            } else {
                // Dodaj nowy status
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
    }
};

module.exports = booksController;