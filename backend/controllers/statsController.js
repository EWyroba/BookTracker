const statsService = require('../services/statsService');
const User = require('../models/User');

const statsController = {
    getDashboardStats: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { period = 'year' } = req.query;

            const stats = await statsService.getDashboardStats(userId, period);

            res.json(stats);
        } catch (error) {
            console.error('Dashboard stats error:', error);
            res.status(500).json({
                message: 'Błąd serwera',
                error: error.message
            });
        }
    },

    getReadingAnalytics: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { year = new Date().getFullYear() } = req.query;

            const analytics = await statsService.getReadingAnalytics(userId, year);

            res.json(analytics);
        } catch (error) {
            console.error('Reading analytics error:', error);
            res.status(500).json({
                message: 'Błąd serwera',
                error: error.message
            });
        }
    },

    getReadingGoals: async (req, res) => {
        try {
            const userId = req.user.userId;
            const goals = await statsService.getReadingGoals(userId);

            res.json(goals);
        } catch (error) {
            console.error('Reading goals error:', error);
            res.status(500).json({
                message: 'Błąd serwera',
                error: error.message
            });
        }
    },

    updateReadingGoal: async (req, res) => {
        try {
            const { goal } = req.body;
            const userId = req.user.userId;

            if (!goal || goal < 0) {
                return res.status(400).json({ message: 'Cel musi być liczbą dodatnią' });
            }

            await User.updateReadingGoal(userId, goal);

            // Wyczyść cache statystyk
            statsService.clearCache(userId);

            res.json({
                message: 'Cel czytelniczy zaktualizowany',
                goal: goal
            });
        } catch (error) {
            console.error('Update reading goal error:', error);
            res.status(500).json({
                message: 'Błąd serwera',
                error: error.message
            });
        }
    }
};

module.exports = statsController;