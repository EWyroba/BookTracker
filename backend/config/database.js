const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'booktracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

module.exports = {
    pool: pool,
    promisePool: promisePool,
    execute: (...args) => promisePool.execute(...args),
    query: (...args) => promisePool.query(...args)
};