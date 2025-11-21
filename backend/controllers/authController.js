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
                return res.status(400).json({ message: 'Użytkownik już istnieje' });
            }

            // Hash hasła
            const hashedPassword = await bcrypt.hash(password, 12);

            // Utwórz użytkownika
            const [result] = await db.promisePool.execute(
                'INSERT INTO uzytkownicy (nazwa_uzytkownika, email, hash_hasla, nazwa_wyswietlana) VALUES (?, ?, ?, ?)',
                [nazwa_uzytkownika, email, hashedPassword, nazwa_wyswietlana || nazwa_uzytkownika]
            );

            // Generuj token
            const token = jwt.sign(
                { userId: result.insertId },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            console.log('User registered successfully:', result.insertId);

            res.status(201).json({
                message: 'Użytkownik utworzony pomyślnie',
                token,
                userId: result.insertId
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Błąd serwera', error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            console.log('Login attempt:', { email });

            // Znajdź użytkownika
            const [users] = await db.promisePool.execute(
                'SELECT * FROM uzytkownicy WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(400).json({ message: 'Nieprawidłowy email lub hasło' });
            }

            const user = users[0];

            // Sprawdź hasło
            const isPasswordValid = await bcrypt.compare(password, user.hash_hasla);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Nieprawidłowy email lub hasło' });
            }

            // Generuj token
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            // Zwróć dane użytkownika (bez hasła)
            const userResponse = {
                id: user.id,
                nazwa_uzytkownika: user.nazwa_uzytkownika,
                email: user.email,
                nazwa_wyswietlana: user.nazwa_wyswietlana,
                url_avatara: user.url_avatara,
                bio: user.bio,
                cel_czytania: user.cel_czytania
            };

            console.log('User logged in successfully:', user.id);

            res.json({
                message: 'Logowanie udane',
                token,
                user: userResponse
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Błąd serwera', error: error.message });
        }
    }
};

module.exports = authController;