const db = require('../config/database');

const statsController = {
    // Rozszerzona wersja statystyk
    getDashboardStats: async (req, res) => {
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

            // Najlepiej oceniane książki
            const [topRated] = await db.promisePool.execute(
                `SELECT k.tytul, k.autor, s.ocena 
                 FROM statusy_czytania s 
                 JOIN ksiazki k ON s.ksiazka_id = k.id 
                 WHERE s.uzytkownik_id = ? AND s.ocena IS NOT NULL
                 ORDER BY s.ocena DESC 
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
                topRated: topRated
            });

        } catch (error) {
            console.error('Dashboard stats error:', error);
            res.status(500).json({ message: 'Błąd serwera', error: error.message });
        }
    },

    // Szczegółowe statystyki czytania
    getReadingAnalytics: async (req, res) => {
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

            // Tempo czytania (stron/dzień)
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
                 ORDER BY pages_per_day DESC
                 LIMIT 10`,
                [userId]
            );

            res.json({
                monthlyStats: monthlyStats,
                bookLengths: bookLengths,
                readingPace: readingPace
            });

        } catch (error) {
            console.error('Reading analytics error:', error);
            res.status(500).json({ message: 'Błąd serwera', error: error.message });
        }
    }
};

module.exports = statsController;