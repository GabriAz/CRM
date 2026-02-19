const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createAppointmentsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                date_start DATETIME NOT NULL,
                date_end DATETIME,
                prospect_id INT DEFAULT NULL,
                type ENUM('Reunião', 'Tarefa', 'Lembrete', 'Outro') DEFAULT 'Reunião',
                created_by INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ appointments table created successfully');
    } catch (error) {
        console.error('❌ Error creating appointments table:', error.message);
    } finally {
        await connection.end();
    }
}

createAppointmentsTable();
