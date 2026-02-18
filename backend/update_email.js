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

        // Update email
        const [result] = await connection.query(
            'UPDATE users SET email = ? WHERE email = ?',
            ['gabriel@studioque.cafe', 'gabriel@studioque.com.br']
        );

        if (result.affectedRows > 0) {
            console.log('✅ Email updated successfully to gabriel@studioque.cafe');
        } else {
            console.log('⚠️ No user found with email gabriel@studioque.com.br. Checking if already updated...');
            const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['gabriel@studioque.cafe']);
            if (rows.length > 0) {
                console.log('✅ User already has email gabriel@studioque.cafe');
            } else {
                console.log('❌ Could not find user to update.');
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

run();
