const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth middleware - Token present:', !!token);

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({
            message: 'Token dostępu wymagany',
            code: 'NO_TOKEN'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);

            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Token wygasł',
                    code: 'TOKEN_EXPIRED'
                });
            }

            return res.status(403).json({
                message: 'Nieprawidłowy token',
                code: 'INVALID_TOKEN'
            });
        }

        console.log('Token verified for user:', user.userId);
        req.user = user;
        next();
    });
};

const verifyUserExists = async (req, res, next) => {
    try {
        const userId = req.user?.userId;

        console.log('Verifying user exists:', userId);

        if (!userId) {
            return res.status(401).json({
                message: 'Użytkownik nieznany',
                code: 'NO_USER_ID'
            });
        }

        const [users] = await db.promisePool.execute(
            'SELECT id, nazwa_wyswietlana, email FROM uzytkownicy WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            console.log('User not found in database:', userId);
            return res.status(404).json({
                message: 'Użytkownik nie istnieje',
                code: 'USER_NOT_FOUND'
            });
        }

        // Dodaj dane użytkownika do requestu dla ułatwienia
        req.userData = users[0];

        console.log('User verified successfully:', users[0].email);
        next();
    } catch (error) {
        console.error('User verification error:', error);
        res.status(500).json({
            message: 'Błąd serwera podczas weryfikacji użytkownika',
            error: error.message,
            code: 'VERIFICATION_ERROR'
        });
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Optional auth: No token, proceeding as guest');
        req.user = null;
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) {
            console.log('Optional auth: Invalid token, proceeding as guest');
            req.user = null;
            return next();
        }

        console.log('Optional auth: Valid token for user:', user.userId);
        req.user = user;
        next();
    });
};

module.exports = {
    authenticateToken,
    verifyUserExists,
    optionalAuth
};