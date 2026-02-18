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

async function addActionDateColumn() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🔌 Conectado ao banco de dados.');

        try {
            await connection.query(`
                ALTER TABLE prospects 
                ADD COLUMN action_date DATETIME;
            `);
            console.log('✅ Coluna "action_date" adicionada com sucesso.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Coluna "action_date" já existe.');
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

addActionDateColumn();
