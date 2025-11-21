const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { nazwa_uzytkownika, email, password, nazwa_wyswietlana } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await promisePool.execute(
            'INSERT INTO uzytkownicy (nazwa_uzytkownika, email, hash_hasla, nazwa_wyswietlana) VALUES (?, ?, ?, ?)',
            [nazwa_uzytkownika, email, hashedPassword, nazwa_wyswietlana]
        );

        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await promisePool.execute(
            'SELECT * FROM uzytkownicy WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await promisePool.execute(
            'SELECT id, nazwa_uzytkownika, email, nazwa_wyswietlana, url_avatara, bio, cel_czytania FROM uzytkownicy WHERE id = ?',
            [id]
        );
        return rows[0];
    }
}

module.exports = User;