const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const run = async () => {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'studio_que_db',
            port: 3306
        });

        console.log('Connected to database.');

        const [rows] = await connection.query('SHOW TABLES');
        console.log('Tables:', rows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

run();
