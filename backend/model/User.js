const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { nazwa_uzytkownika, email, password, nazwa_wyswietlana } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await promisePool.execute(
            'INSERT INTO uzytkownicy (nazwa_uzytkownika, email, hash_hasla, nazwa_wyswietlana, data_rejestracji) VALUES (?, ?, ?, ?, NOW())',
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
            'SELECT id, nazwa_uzytkownika, email, nazwa_wyswietlana, url_avatara, bio, cel_czytania, data_rejestracji FROM uzytkownicy WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async update(id, updateData) {
        const { nazwa_wyswietlana, bio, cel_czytania, url_avatara } = updateData;

        const fields = [];
        const values = [];

        if (nazwa_wyswietlana !== undefined) {
            fields.push('nazwa_wyswietlana = ?');
            values.push(nazwa_wyswietlana);
        }

        if (bio !== undefined) {
            fields.push('bio = ?');
            values.push(bio);
        }

        if (cel_czytania !== undefined) {
            fields.push('cel_czytania = ?');
            values.push(cel_czytania);
        }

        if (url_avatara !== undefined) {
            fields.push('url_avatara = ?');
            values.push(url_avatara);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id);

        const [result] = await promisePool.execute(
            `UPDATE uzytkownicy SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const [result] = await promisePool.execute(
            'UPDATE uzytkownicy SET hash_hasla = ? WHERE id = ?',
            [hashedPassword, id]
        );

        return result.affectedRows > 0;
    }
}

module.exports = User;