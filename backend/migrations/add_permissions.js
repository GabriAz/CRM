const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Load from parent dir likely

const run = async () => {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1', // Force localhost for script execution outside docker
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'studio_que_db',
            port: 3306
        });

        console.log('Connected to database.');

        // Add Column
        try {
            await connection.query('ALTER TABLE users ADD COLUMN can_manage_users BOOLEAN DEFAULT FALSE');
            console.log('Column `can_manage_users` added successfully.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column `can_manage_users` already exists.');
            } else {
                throw err;
            }
        }

        // Seed Gabriel Azevedo (Admin) if not exists
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['gabriel@studioque.com.br']); // Assuming email, using placeholder

        if (rows.length === 0) {
            // Create Gabriel
            // Note: Password hash logic missing here, simplified for migration or just update existing if simpler.
            // Let's just update permissions for any existing admin or insert a placeholder.
            console.log('User Gabriel not found, please create via API first or manually.');
        } else {
            await connection.query('UPDATE users SET role="admin", can_manage_users=TRUE WHERE email = ?', ['gabriel@studioque.com.br']);
            console.log('Updated Gabriel permissions.');
        }

        // Also ensure any existing Admin has permission
        await connection.query('UPDATE users SET can_manage_users=TRUE WHERE role="admin"');
        console.log('Updated existing admins permissions.');

        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

run();
