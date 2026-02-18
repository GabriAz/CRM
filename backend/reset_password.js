const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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

        const email = 'gabriel@studioque.com.br';
        const password = '123456';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Check if user exists
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log('Creating user...');
            await connection.query(
                'INSERT INTO users (name, email, password_hash, role, can_manage_users) VALUES (?, ?, ?, ?, ?)',
                ['Gabriel Azevedo', email, hash, 'admin', true]
            );
        } else {
            console.log('Updating user password...');
            await connection.query(
                'UPDATE users SET password_hash = ?, role = "admin", can_manage_users = TRUE WHERE email = ?',
                [hash, email]
            );
        }

        console.log(`User ${email} updated successfully.`);
        console.log(`Password set to: ${password}`);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

run();
