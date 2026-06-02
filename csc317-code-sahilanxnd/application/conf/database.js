var mysql = require('mysql2');
// Create a MySQL connection pool using environment variables and export it as a promise-based pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectTimeout: 15000,
    connectionLimit: 20
});

module.exports = pool.promise();