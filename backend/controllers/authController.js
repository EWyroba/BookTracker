const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    register: async (req, res) => {
        try {
            const { nazwa_uzytkownika, email, password, nazwa_wyswietlana } = req.body;

            console.log('Register attempt:', { nazwa_uzytkownika, email });

            // Sprawdź czy użytkownik już istnieje
            const [existingUser] = await db.promisePool.execute(
                'SELECT id FROM uzytkownicy WHERE email = ? OR nazwa_uzytkownika = ?',
                [email, nazwa_uzytkownika]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({
                    message: 'Użytkownik już istnieje',
                    code: 'USER_EXISTS'
                });
            }

            // Hash hasła
            const hashedPassword = await bcrypt.hash(password, 12);

            // Utwórz użytkownika
            const [result] = await db.promisePool.execute(
                'INSERT INTO uzytkownicy (nazwa_uzytkownika, email, hash_hasla, nazwa_wyswietlana, data_rejestracji) VALUES (?, ?, ?, ?, NOW())',
                [nazwa_uzytkownika, email, hashedPassword, nazwa_wyswietlana || nazwa_uzytkownika]
            );

            // Generuj token
            const token = jwt.sign(
                { userId: result.insertId },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '7d' }
            );

            // Pobierz utworzonego użytkownika
            const [users] = await db.promisePool.execute(
                'SELECT id, nazwa_uzytkownika, email, nazwa_wyswietlana, url_avatara, bio, cel_czytania, data_rejestracji FROM uzytkownicy WHERE id = ?',
                [result.insertId]
            );

            const user = users[0];

            console.log('User registered successfully:', user.id);

            res.status(201).json({
                message: 'Użytkownik utworzony pomyślnie',
                token,
                user: user,
                userId: result.insertId
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                message: 'Błąd serwera podczas rejestracji',
                error: error.message,
                code: 'REGISTRATION_ERROR'
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            console.log('Login attempt:', { email });

            if (!email || !password) {
                return res.status(400).json({
                    message: 'Email i hasło są wymagane',
                    code: 'MISSING_CREDENTIALS'
                });
            }

            // Znajdź użytkownika
            const [users] = await db.promisePool.execute(
                'SELECT * FROM uzytkownicy WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(400).json({
                    message: 'Nieprawidłowy email lub hasło',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            const user = users[0];

            // Sprawdź hasło
            const isPasswordValid = await bcrypt.compare(password, user.hash_hasla);
            if (!isPasswordValid) {
                return res.status(400).json({
                    message: 'Nieprawidłowy email lub hasło',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Generuj token
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '7d' }
            );

            // Zwróć dane użytkownika (bez hasła)
            const userResponse = {
                id: user.id,
                nazwa_uzytkownika: user.nazwa_uzytkownika,
                email: user.email,
                nazwa_wyswietlana: user.nazwa_wyswietlana,
                url_avatara: user.url_avatara,
                bio: user.bio,
                cel_czytania: user.cel_czytania,
                data_rejestracji: user.data_rejestracji
            };

            console.log('User logged in successfully:', user.id);

            res.json({
                message: 'Logowanie udane',
                token,
                user: userResponse
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                message: 'Błąd serwera podczas logowania',
                error: error.message,
                code: 'LOGIN_ERROR'
            });
        }
    },

    getCurrentUser: async (req, res) => {
        try {
            const userId = req.user.userId;

            console.log('Getting current user:', userId);

            const [users] = await db.promisePool.execute(
                'SELECT id, nazwa_uzytkownika, email, nazwa_wyswietlana, url_avatara, bio, cel_czytania, data_rejestracji FROM uzytkownicy WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: 'Użytkownik nie znaleziony',
                    code: 'USER_NOT_FOUND'
                });
            }

            console.log('Current user retrieved:', users[0].email);

            res.json({
                user: users[0],
                code: 'USER_RETRIEVED'
            });
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                message: 'Błąd serwera podczas pobierania danych użytkownika',
                error: error.message,
                code: 'GET_USER_ERROR'
            });
        }
    },

    updateProfile: async (req, res) => {
        const connection = await db.promisePool.getConnection();

        try {
            await connection.beginTransaction();

            const userId = req.user.userId;
            const { nazwa_wyswietlana, bio, cel_czytania } = req.body;

            console.log('Updating profile for user:', userId, { nazwa_wyswietlana, bio, cel_czytania });

            // Walidacja
            if (!nazwa_wyswietlana || nazwa_wyswietlana.trim().length === 0) {
                return res.status(400).json({
                    message: 'Nazwa wyświetlana jest wymagana',
                    code: 'MISSING_DISPLAY_NAME'
                });
            }

            if (nazwa_wyswietlana.length > 100) {
                return res.status(400).json({
                    message: 'Nazwa wyświetlana nie może przekraczać 100 znaków',
                    code: 'DISPLAY_NAME_TOO_LONG'
                });
            }

            if (bio && bio.length > 500) {
                return res.status(400).json({
                    message: 'Bio nie może przekraczać 500 znaków',
                    code: 'BIO_TOO_LONG'
                });
            }

            // Walidacja cel_czytania
            let validatedCelCzytania = null;
            if (cel_czytania !== undefined && cel_czytania !== null) {
                const celNumber = parseInt(cel_czytania);
                if (isNaN(celNumber) || celNumber < 0) {
                    return res.status(400).json({
                        message: 'Cel czytania musi być liczbą dodatnią',
                        code: 'INVALID_READING_GOAL'
                    });
                }
                validatedCelCzytania = celNumber;
            }

            // Sprawdź unikalność nazwy wyświetlanej
            const [existingUsers] = await connection.execute(
                'SELECT id FROM uzytkownicy WHERE nazwa_wyswietlana = ? AND id != ?',
                [nazwa_wyswietlana.trim(), userId]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    message: 'Nazwa wyświetlana jest już używana',
                    code: 'DISPLAY_NAME_EXISTS'
                });
            }

            // Aktualizuj profil
            await connection.execute(
                'UPDATE uzytkownicy SET nazwa_wyswietlana = ?, bio = ?, cel_czytania = ? WHERE id = ?',
                [
                    nazwa_wyswietlana.trim(),
                    bio ? bio.trim() : null,
                    validatedCelCzytania,
                    userId
                ]
            );

            // Pobierz zaktualizowane dane
            const [users] = await connection.execute(
                'SELECT id, nazwa_uzytkownika, email, nazwa_wyswietlana, url_avatara, bio, cel_czytania, data_rejestracji FROM uzytkownicy WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    message: 'Użytkownik nie znaleziony po aktualizacji',
                    code: 'USER_NOT_FOUND_AFTER_UPDATE'
                });
            }

            await connection.commit();

            console.log('Profile updated for user:', userId);

            res.json({
                message: 'Profil zaktualizowany pomyślnie',
                user: users[0],
                code: 'PROFILE_UPDATED'
            });

        } catch (error) {
            await connection.rollback();
            console.error('Update profile error:', error);
            res.status(500).json({
                message: 'Błąd serwera podczas aktualizacji profilu',
                error: error.message,
                code: 'PROFILE_UPDATE_ERROR'
            });
        } finally {
            connection.release();
        }
    },

    updatePassword: async (req, res) => {
        const connection = await db.promisePool.getConnection();

        try {
            await connection.beginTransaction();

            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            console.log('Updating password for user:', userId);

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    message: 'Obecne hasło i nowe hasło są wymagane',
                    code: 'MISSING_PASSWORDS'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    message: 'Nowe hasło musi mieć co najmniej 6 znaków',
                    code: 'PASSWORD_TOO_SHORT'
                });
            }

            if (newPassword.length > 100) {
                return res.status(400).json({
                    message: 'Nowe hasło nie może przekraczać 100 znaków',
                    code: 'PASSWORD_TOO_LONG'
                });
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({
                    message: 'Nowe hasło musi być różne od obecnego',
                    code: 'SAME_PASSWORD'
                });
            }

            // Pobierz aktualne hasło użytkownika
            const [users] = await connection.execute(
                'SELECT id, hash_hasla FROM uzytkownicy WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: 'Użytkownik nie znaleziony',
                    code: 'USER_NOT_FOUND'
                });
            }

            const user = users[0];

            // Sprawdź obecne hasło
            const isPasswordValid = await bcrypt.compare(currentPassword, user.hash_hasla);
            if (!isPasswordValid) {
                return res.status(400).json({
                    message: 'Obecne hasło jest nieprawidłowe',
                    code: 'INVALID_CURRENT_PASSWORD'
                });
            }

            // Hash nowego hasła
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            // Zaktualizuj hasło
            await connection.execute(
                'UPDATE uzytkownicy SET hash_hasla = ? WHERE id = ?',
                [hashedPassword, userId]
            );

            // Pobierz zaktualizowane dane użytkownika
            const [updatedUsers] = await connection.execute(
                'SELECT id, nazwa_uzytkownika, email, nazwa_wyswietlana, url_avatara, bio, cel_czytania, data_rejestracji FROM uzytkownicy WHERE id = ?',
                [userId]
            );

            await connection.commit();

            res.json({
                message: 'Hasło zostało zmienione pomyślnie',
                user: updatedUsers[0],
                code: 'PASSWORD_UPDATED'
            });

        } catch (error) {
            await connection.rollback();
            console.error('Update password error:', error);
            res.status(500).json({
                message: 'Błąd serwera podczas zmiany hasła',
                error: error.message,
                code: 'PASSWORD_UPDATE_ERROR'
            });
        } finally {
            connection.release();
        }
    },

    updateAvatar: async (req, res) => {
        const connection = await db.promisePool.getConnection();

        try {
            await connection.beginTransaction();

            const userId = req.user.userId;
            const { avatarUrl } = req.body;

            console.log('Updating avatar for user:', userId, { avatarUrl });

            // Jeśli avatarUrl jest pusty lub null, ustaw jako null
            const finalAvatarUrl = avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : null;

            // Walidacja URL jeśli podany
            if (finalAvatarUrl) {
                if (finalAvatarUrl.length > 500) {
                    return res.status(400).json({
                        message: 'URL avatara nie może przekraczać 500 znaków',
                        code: 'AVATAR_URL_TOO_LONG'
                    });
                }

                try {
                    const url = new URL(finalAvatarUrl);
                    if (!['http:', 'https:'].includes(url.protocol)) {
                        return res.status(400).json({
                            message: 'URL avatara musi zaczynać się od http:// lub https://',
                            code: 'INVALID_AVATAR_PROTOCOL'
                        });
                    }
                } catch (err) {
                    return res.status(400).json({
                        message: 'Nieprawidłowy URL avatara',
                        code: 'INVALID_AVATAR_URL'
                    });
                }
            }

            // Aktualizuj avatar
            await connection.execute(
                'UPDATE uzytkownicy SET url_avatara = ? WHERE id = ?',
                [finalAvatarUrl, userId]
            );

            // Pobierz zaktualizowane dane
            const [users] = await connection.execute(
                'SELECT id, nazwa_uzytkownika, email, nazwa_wyswietlana, url_avatara, bio, cel_czytania, data_rejestracji FROM uzytkownicy WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    message: 'Użytkownik nie znaleziony po aktualizacji avatara',
                    code: 'USER_NOT_FOUND_AFTER_AVATAR_UPDATE'
                });
            }

            await connection.commit();

            res.json({
                message: finalAvatarUrl ? 'Avatar zaktualizowany pomyślnie' : 'Avatar usunięty pomyślnie',
                user: users[0],
                code: 'AVATAR_UPDATED'
            });

        } catch (error) {
            await connection.rollback();
            console.error('Update avatar error:', error);
            res.status(500).json({
                message: 'Błąd serwera podczas aktualizacji avatara',
                error: error.message,
                code: 'AVATAR_UPDATE_ERROR'
            });
        } finally {
            connection.release();
        }
    },

    deleteAccount: async (req, res) => {
        const connection = await db.promisePool.getConnection();

        try {
            const userId = req.user.userId;
            const { password } = req.body;

            console.log('Delete account attempt for user:', userId);

            if (!password) {
                return res.status(400).json({
                    message: 'Hasło jest wymagane do usunięcia konta',
                    code: 'MISSING_PASSWORD'
                });
            }

            await connection.beginTransaction();

            // Sprawdź hasło
            const [users] = await connection.execute(
                'SELECT hash_hasla FROM uzytkownicy WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: 'Użytkownik nie znaleziony',
                    code: 'USER_NOT_FOUND'
                });
            }

            const user = users[0];
            const isPasswordValid = await bcrypt.compare(password, user.hash_hasla);

            if (!isPasswordValid) {
                return res.status(400).json({
                    message: 'Nieprawidłowe hasło',
                    code: 'INVALID_PASSWORD'
                });
            }

            // Usuń dane użytkownika w odpowiedniej kolejności
            await connection.execute(
                'DELETE FROM zakladki WHERE uzytkownik_id = ?',
                [userId]
            );

            await connection.execute(
                'DELETE FROM statusy_czytania WHERE uzytkownik_id = ?',
                [userId]
            );

            await connection.execute(
                'DELETE FROM ksiazki_na_polkach WHERE polka_id IN (SELECT id FROM polki WHERE uzytkownik_id = ?)',
                [userId]
            );

            await connection.execute(
                'DELETE FROM polki WHERE uzytkownik_id = ?',
                [userId]
            );

            await connection.execute(
                'DELETE FROM uzytkownicy WHERE id = ?',
                [userId]
            );

            await connection.commit();

            console.log('Account deleted successfully for user:', userId);

            res.json({
                message: 'Konto zostało usunięte pomyślnie',
                success: true,
                code: 'ACCOUNT_DELETED'
            });

        } catch (error) {
            await connection.rollback();
            console.error('Delete account error:', error);
            res.status(500).json({
                message: 'Błąd serwera podczas usuwania konta',
                error: error.message,
                code: 'DELETE_ACCOUNT_ERROR'
            });
        } finally {
            connection.release();
        }
    },

    getUserStats: async (req, res) => {
        try {
            const userId = req.user.userId;

            console.log('Getting stats for user:', userId);

            // Statystyki czytania
            const [readBooks] = await db.promisePool.execute(
                `SELECT COUNT(*) as count FROM statusy_czytania 
                 WHERE uzytkownik_id = ? AND status = 'przeczytana'`,
                [userId]
            );

            const [currentlyReading] = await db.promisePool.execute(
                `SELECT COUNT(*) as count FROM statusy_czytania 
                 WHERE uzytkownik_id = ? AND status = 'aktualnie_czytam'`,
                [userId]
            );

            const [totalPages] = await db.promisePool.execute(
                `SELECT COALESCE(SUM(k.liczba_stron), 0) as total 
                 FROM statusy_czytania s
                 JOIN ksiazki k ON s.ksiazka_id = k.id
                 WHERE s.uzytkownik_id = ? AND s.status = 'przeczytana'`,
                [userId]
            );

            const [averageRating] = await db.promisePool.execute(
                `SELECT COALESCE(AVG(s.ocena), 0) as avg_rating 
                 FROM statusy_czytania s
                 WHERE s.uzytkownik_id = ? AND s.ocena IS NOT NULL`,
                [userId]
            );

            // Liczba notatek
            const [notesCount] = await db.promisePool.execute(
                `SELECT COUNT(*) as count FROM zakladki WHERE uzytkownik_id = ?`,
                [userId]
            );

            // Rok rejestracji
            const [userData] = await db.promisePool.execute(
                `SELECT DATE_FORMAT(data_rejestracji, '%Y') as registration_year 
                 FROM uzytkownicy WHERE id = ?`,
                [userId]
            );

            const registrationYear = userData[0]?.registration_year || new Date().getFullYear().toString();

            // Liczba książek na półkach
            const [shelfCount] = await db.promisePool.execute(
                `SELECT COUNT(*) as count 
                 FROM ksiazki_na_polkach knp
                 JOIN polki p ON knp.polka_id = p.id
                 WHERE p.uzytkownik_id = ?`,
                [userId]
            );

            res.json({
                stats: {
                    booksRead: parseInt(readBooks[0].count) || 0,
                    currentlyReading: parseInt(currentlyReading[0].count) || 0,
                    totalPages: parseInt(totalPages[0].total) || 0,
                    averageRating: parseFloat(averageRating[0].avg_rating || 0).toFixed(1),
                    notesCount: parseInt(notesCount[0].count) || 0,
                    shelfCount: parseInt(shelfCount[0].count) || 0,
                    registrationYear: registrationYear
                },
                code: 'STATS_RETRIEVED'
            });

        } catch (error) {
            console.error('Get user stats error:', error);
            res.status(500).json({
                message: 'Błąd serwera podczas pobierania statystyk',
                error: error.message,
                code: 'GET_STATS_ERROR'
            });
        }
    }
};

module.exports = authController;