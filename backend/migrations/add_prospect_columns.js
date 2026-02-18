const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
};

async function addMissingColumns() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🔌 Conectado ao banco de dados.');

        // Add estimated_value
        try {
            await connection.query(`
                ALTER TABLE prospects 
                ADD COLUMN estimated_value DECIMAL(10, 2) DEFAULT 0;
            `);
            console.log('✅ Coluna "estimated_value" adicionada.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Coluna "estimated_value" já existe.');
            } else {
                throw err;
            }
        }

        // Add next_action
        try {
            await connection.query(`
                ALTER TABLE prospects 
                ADD COLUMN next_action VARCHAR(255);
            `);
            console.log('✅ Coluna "next_action" adicionada.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Coluna "next_action" já existe.');
            } else {
                throw err;
            }
        }

    } catch (error) {
        console.error('❌ Erro na migração:', error);
    } finally {
        if (connection) await connection.end();
    }
}

addMissingColumns();
