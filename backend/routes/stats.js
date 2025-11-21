const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const router = express.Router();

// Rozszerzone statystyki dashboardu
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { period = 'year' } = req.query; // month, year, all_time

        // Podstawowe statystyki
        const [readBooks] = await db.promisePool.execute(
            `SELECT COUNT(*) as count 
             FROM statusy_czytania 
             WHERE uzytkownik_id = ? AND status = 'przeczytana'`,
            [userId]
        );

        const [readingBooks] = await db.promisePool.execute(
            `SELECT COUNT(*) as count 
             FROM statusy_czytania 
             WHERE uzytkownik_id = ? AND status = 'aktualnie_czytam'`,
            [userId]
        );

        const [totalPages] = await db.promisePool.execute(
            `SELECT SUM(k.liczba_stron) as total 
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             WHERE s.uzytkownik_id = ? AND s.status = 'przeczytana'`,
            [userId]
        );

        // Statystyki gatunków
        const [genres] = await db.promisePool.execute(
            `SELECT k.gatunek, COUNT(*) as count 
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             WHERE s.uzytkownik_id = ? AND s.status = 'przeczytana' AND k.gatunek IS NOT NULL
             GROUP BY k.gatunek 
             ORDER BY count DESC 
             LIMIT 10`,
            [userId]
        );

        // Czytanie w czasie (dla wykresu)
        let dateCondition = '';
        if (period === 'month') {
            dateCondition = 'AND s.data_zakonczenia >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
        } else if (period === 'year') {
            dateCondition = 'AND s.data_zakonczenia >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
        }

        const [readingTimeline] = await db.promisePool.execute(
            `SELECT 
                DATE_FORMAT(s.data_zakonczenia, '%Y-%m') as period,
                COUNT(*) as books_read,
                SUM(k.liczba_stron) as pages_read
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             WHERE s.uzytkownik_id = ? 
               AND s.status = 'przeczytana' 
               AND s.data_zakonczenia IS NOT NULL
               ${dateCondition}
             GROUP BY DATE_FORMAT(s.data_zakonczenia, '%Y-%m')
             ORDER BY period`,
            [userId]
        );

        // Średnia ocen
        const [averageRating] = await db.promisePool.execute(
            `SELECT AVG(s.ocena) as avg_rating 
             FROM statusy_czytania s 
             WHERE s.uzytkownik_id = ? AND s.ocena IS NOT NULL`,
            [userId]
        );

        // Najlepiej oceniane książki - POPRAWIONE ZAPYTANIE
        const [topRated] = await db.promisePool.execute(
            `SELECT 
                k.tytul,
                k.id,
                GROUP_CONCAT(DISTINCT a.imie_nazwisko) as autorzy,
                s.ocena 
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
             LEFT JOIN autorzy a ON ka.autor_id = a.id
             WHERE s.uzytkownik_id = ? AND s.ocena IS NOT NULL
             GROUP BY k.id, k.tytul, s.ocena
             ORDER BY s.ocena DESC 
             LIMIT 5`,
            [userId]
        );

        // Ostatnio przeczytane książki - POPRAWIONE ZAPYTANIE
        const [recentBooks] = await db.promisePool.execute(
            `SELECT 
                k.tytul,
                k.id,
                k.url_okladki,
                GROUP_CONCAT(DISTINCT a.imie_nazwisko) as autorzy,
                s.data_zakonczenia
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             LEFT JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
             LEFT JOIN autorzy a ON ka.autor_id = a.id
             WHERE s.uzytkownik_id = ? AND s.status = 'przeczytana'
             GROUP BY k.id, k.tytul, k.url_okladki, s.data_zakonczenia
             ORDER BY s.data_zakonczenia DESC 
             LIMIT 5`,
            [userId]
        );

        res.json({
            overview: {
                booksRead: readBooks[0].count || 0,
                currentlyReading: readingBooks[0].count || 0,
                totalPages: totalPages[0].total || 0,
                readingTime: Math.round((totalPages[0].total || 0) * 2.5 / 60), // 2.5 min na stronę
                averageRating: parseFloat(averageRating[0].avg_rating || 0).toFixed(1),
                booksPerMonth: readingTimeline.length > 0 ?
                    (readBooks[0].count / readingTimeline.length).toFixed(1) : 0
            },
            genres: genres,
            readingTimeline: readingTimeline,
            topRated: topRated,
            recentBooks: recentBooks
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Szczegółowe analityki czytania
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { year = new Date().getFullYear() } = req.query;

        // Miesięczne statystyki
        const [monthlyStats] = await db.promisePool.execute(
            `SELECT 
                MONTH(s.data_zakonczenia) as month,
                COUNT(*) as books_read,
                SUM(k.liczba_stron) as pages_read,
                AVG(s.ocena) as avg_rating
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             WHERE s.uzytkownik_id = ? 
               AND s.status = 'przeczytana' 
               AND YEAR(s.data_zakonczenia) = ?
             GROUP BY MONTH(s.data_zakonczenia)
             ORDER BY month`,
            [userId, year]
        );

        // Długość książek
        const [bookLengths] = await db.promisePool.execute(
            `SELECT 
                CASE 
                    WHEN k.liczba_stron < 200 THEN 'Krótkie (<200 str)'
                    WHEN k.liczba_stron BETWEEN 200 AND 400 THEN 'Średnie (200-400 str)'
                    WHEN k.liczba_stron BETWEEN 401 AND 600 THEN 'Długie (401-600 str)'
                    ELSE 'Bardzo długie (>600 str)'
                END as length_category,
                COUNT(*) as count
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             WHERE s.uzytkownik_id = ? AND s.status = 'przeczytana'
             GROUP BY length_category
             ORDER BY count DESC`,
            [userId]
        );

        // Tempo czytania (stron/dzień) - POPRAWIONE ZAPYTANIE
        const [readingPace] = await db.promisePool.execute(
            `SELECT 
                k.id,
                k.tytul,
                k.liczba_stron,
                DATEDIFF(s.data_zakonczenia, s.data_rozpoczecia) as days_to_read,
                ROUND(k.liczba_stron / NULLIF(DATEDIFF(s.data_zakonczenia, s.data_rozpoczecia), 0), 2) as pages_per_day
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             WHERE s.uzytkownik_id = ? 
               AND s.status = 'przeczytana'
               AND s.data_rozpoczecia IS NOT NULL 
               AND s.data_zakonczenia IS NOT NULL
               AND DATEDIFF(s.data_zakonczenia, s.data_rozpoczecia) > 0
             ORDER BY pages_per_day DESC
             LIMIT 10`,
            [userId]
        );

        // Ulubieni autorzy - POPRAWIONE ZAPYTANIE
        const [topAuthors] = await db.promisePool.execute(
            `SELECT 
                a.imie_nazwisko as autor,
                COUNT(DISTINCT k.id) as books_read,
                AVG(s.ocena) as avg_rating
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             JOIN ksiazka_autorzy ka ON k.id = ka.ksiazka_id
             JOIN autorzy a ON ka.autor_id = a.id
             WHERE s.uzytkownik_id = ? AND s.status = 'przeczytana'
             GROUP BY a.imie_nazwisko, a.id
             HAVING COUNT(DISTINCT k.id) >= 1
             ORDER BY books_read DESC, avg_rating DESC
             LIMIT 10`,
            [userId]
        );

        res.json({
            monthlyStats: monthlyStats,
            bookLengths: bookLengths,
            readingPace: readingPace,
            topAuthors: topAuthors
        });

    } catch (error) {
        console.error('Reading analytics error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Cele czytelnicze
router.get('/reading-goals', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Pobierz cel użytkownika
        const [userGoals] = await db.promisePool.execute(
            'SELECT cel_czytania FROM uzytkownicy WHERE id = ?',
            [userId]
        );

        const yearlyGoal = userGoals[0]?.cel_czytania || 0;

        // Przeczytane książki w tym roku
        const [yearlyProgress] = await db.promisePool.execute(
            `SELECT COUNT(*) as count 
             FROM statusy_czytania 
             WHERE uzytkownik_id = ? 
               AND status = 'przeczytana' 
               AND YEAR(data_zakonczenia) = YEAR(CURDATE())`,
            [userId]
        );

        // Postęp w poprzednich miesiącach
        const [monthlyProgress] = await db.promisePool.execute(
            `SELECT 
                MONTH(data_zakonczenia) as month,
                COUNT(*) as books_read
             FROM statusy_czytania 
             WHERE uzytkownik_id = ? 
               AND status = 'przeczytana' 
               AND YEAR(data_zakonczenia) = YEAR(CURDATE())
             GROUP BY MONTH(data_zakonczenia)
             ORDER BY month`,
            [userId]
        );

        const booksThisYear = yearlyProgress[0].count || 0;
        const progress = yearlyGoal > 0 ? Math.min((booksThisYear / yearlyGoal) * 100, 100) : 0;

        res.json({
            goal: yearlyGoal,
            current: booksThisYear,
            progress: progress,
            remaining: Math.max(yearlyGoal - booksThisYear, 0),
            monthlyProgress: monthlyProgress,
            onTrack: booksThisYear >= (yearlyGoal * (new Date().getMonth() + 1) / 12)
        });
    } catch (error) {
        console.error('Reading goals error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Aktualizacja celu czytelniczego
router.put('/reading-goals', authenticateToken, async (req, res) => {
    try {
        const { goal } = req.body;
        const userId = req.user.userId;

        if (!goal || goal < 0) {
            return res.status(400).json({ message: 'Cel musi być liczbą dodatnią' });
        }

        await db.promisePool.execute(
            'UPDATE uzytkownicy SET cel_czytania = ? WHERE id = ?',
            [goal, userId]
        );

        res.json({
            message: 'Cel czytelniczy zaktualizowany',
            goal: goal
        });
    } catch (error) {
        console.error('Update reading goal error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Timeline czytania
router.get('/reading-timeline', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { period = 'year' } = req.query; // month, year

        let dateFormat, groupBy, dateRange;

        if (period === 'month') {
            dateFormat = '%Y-%m-%d';
            groupBy = 'DATE(s.data_zakonczenia)';
            dateRange = 'AND s.data_zakonczenia >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        } else {
            dateFormat = '%Y-%m';
            groupBy = 'CONCAT(YEAR(s.data_zakonczenia), "-", LPAD(MONTH(s.data_zakonczenia), 2, "0"))';
            dateRange = 'AND s.data_zakonczenia >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
        }

        const [timeline] = await db.promisePool.execute(
            `SELECT 
                ${groupBy} as period,
                COUNT(*) as books_read,
                SUM(k.liczba_stron) as pages_read,
                AVG(s.ocena) as avg_rating
             FROM statusy_czytania s 
             JOIN ksiazki k ON s.ksiazka_id = k.id 
             WHERE s.uzytkownik_id = ? 
               AND s.status = 'przeczytana' 
               AND s.data_zakonczenia IS NOT NULL
               ${dateRange}
             GROUP BY period
             ORDER BY period`,
            [userId]
        );

        res.json({ timeline });
    } catch (error) {
        console.error('Reading timeline error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Statystyki porównawcze (tygodniowe/roczne)
router.get('/comparison', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type = 'yearly' } = req.query; // yearly, monthly

        if (type === 'yearly') {
            // Porównanie z poprzednimi latami
            const [yearlyComparison] = await db.promisePool.execute(
                `SELECT
                     YEAR(data_zakonczenia) as year,
                     COUNT(*) as books_read,
                     SUM(k.liczba_stron) as pages_read
                 FROM statusy_czytania s
                     JOIN ksiazki k ON s.ksiazka_id = k.id
                 WHERE s.uzytkownik_id = ?
                   AND s.status = 'przeczytana'
                   AND YEAR(data_zakonczenia) >= YEAR(CURDATE()) - 2
                 GROUP BY YEAR(data_zakonczenia)
                 ORDER BY year DESC`,
                [userId]
            );

            res.json({ comparison: yearlyComparison, type: 'yearly' });
        } else {
            // Porównanie miesięczne
            const [monthlyComparison] = await db.promisePool.execute(
                `SELECT
                     CONCAT(YEAR(data_zakonczenia), '-', LPAD(MONTH(data_zakonczenia), 2, '0')) as period,
                     COUNT(*) as books_read
                 FROM statusy_czytania
                 WHERE uzytkownik_id = ?
                   AND status = 'przeczytana'
                   AND data_zakonczenia >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                 GROUP BY YEAR(data_zakonczenia), MONTH(data_zakonczenia)
                 ORDER BY period DESC
                     LIMIT 6`,
                [userId]
            );

            res.json({ comparison: monthlyComparison, type: 'monthly' });
        }
    } catch (error) {
        console.error('Comparison stats error:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});

// Health check dla statystyk
router.get('/health', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Sprawdź czy użytkownik ma jakieś dane statystyczne
        const [hasData] = await db.promisePool.execute(
            'SELECT COUNT(*) as count FROM statusy_czytania WHERE uzytkownik_id = ?',
            [userId]
        );

        const [tableStats] = await db.promisePool.execute(
            `SELECT 
                (SELECT COUNT(*) FROM ksiazki) as total_books,
                (SELECT COUNT(*) FROM statusy_czytania WHERE uzytkownik_id = ?) as user_records,
                (SELECT COUNT(*) FROM statusy_czytania WHERE status = 'przeczytana' AND uzytkownik_id = ?) as read_books`,
            [userId, userId]
        );

        res.json({
            status: 'healthy',
            hasUserData: hasData[0].count > 0,
            statistics: tableStats[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stats health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Błąd sprawdzania zdrowia statystyk',
            error: error.message
        });
    }
});

module.exports = router;