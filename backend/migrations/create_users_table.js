const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); // Need bcryptjs installed in node_modules
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

        // 1. Create Users Table if not exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL UNIQUE,
              password_hash VARCHAR(255) NOT NULL,
              role ENUM('admin', 'user') DEFAULT 'user',
              can_manage_users BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table checked/created.');

        // 2. Add column explicitly if table existed but column didn't (Safe double check)
        try {
            await connection.query('ALTER TABLE users ADD COLUMN can_manage_users BOOLEAN DEFAULT FALSE');
            console.log('Column `can_manage_users` added (if it was missing).');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                // Ignore
            } else {
                console.error(err);
            }
        }

        // 3. Seed Gabriel
        const email = 'gabriel@studioque.com.br';
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('123456', 10); // Default password
            await connection.query(
                `INSERT INTO users (name, email, password_hash, role, can_manage_users) VALUES (?, ?, ?, 'admin', TRUE)`,
                ['Gabriel Azevedo', email, hashedPassword]
            );
            console.log(`User ${email} created with password '123456'.`);
        } else {
            await connection.query('UPDATE users SET role="admin", can_manage_users=TRUE WHERE email = ?', [email]);
            console.log(`Updated permissions for ${email}.`);
        }

        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

run();
