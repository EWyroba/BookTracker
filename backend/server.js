const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/search', require('./routes/search'));
app.use('/api/stats', require('./routes/stats'));

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
    try {
        const db = require('./config/database');

        // Test podstawowego połączenia
        const [result] = await db.promisePool.execute('SELECT 1 as test_value');

        // Sprawdź tabele w bazie
        const [tables] = await db.promisePool.execute('SHOW TABLES');

        res.json({
            status: 'SUCCESS',
            message: 'Połączenie z bazą danych działa poprawnie!',
            databaseTest: result[0],
            tables: tables,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Błąd połączenia z bazą danych',
            error: error.message,
            errorCode: error.code,
            config: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                database: process.env.DB_NAME
            }
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'BookTracker API'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 BookTracker API: http://localhost:${PORT}/api`);
});