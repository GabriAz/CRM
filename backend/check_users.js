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

        const [rows] = await connection.query('SELECT id, name, email, role FROM users');
        console.log('Users found:', rows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

run();
