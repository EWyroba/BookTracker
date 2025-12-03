const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken, verifyUserExists } = require('../middleware/authMiddleware');

const router = express.Router();

// Rejestracja
router.post('/register', authController.register);

// Logowanie
router.post('/login', authController.login);

// Pobierz dane obecnego użytkownika
router.get('/me', authenticateToken, verifyUserExists, authController.getCurrentUser);

// Aktualizuj profil
router.put('/profile', authenticateToken, verifyUserExists, authController.updateProfile);

// Zmień hasło
router.put('/password', authenticateToken, verifyUserExists, authController.updatePassword);

// Aktualizuj avatar
router.put('/avatar', authenticateToken, verifyUserExists, authController.updateAvatar);

// Usuń konto
router.delete('/account', authenticateToken, verifyUserExists, authController.deleteAccount);

// Pobierz statystyki
router.get('/me/stats', authenticateToken, verifyUserExists, authController.getUserStats);

module.exports = router;