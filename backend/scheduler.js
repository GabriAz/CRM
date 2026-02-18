const cron = require('node-cron');
const { sendMessage } = require('./services/telegramService');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
};

// Reminder thresholds in minutes
const REMINDERS = [
    { label: '24h', minutes: 24 * 60, text: '⏰ Lembrete: Compromisso em 1 dia!' },
    { label: '48h', minutes: 48 * 60, text: '⏰ Lembrete: Compromisso em 2 dias!' },
    { label: '2h', minutes: 2 * 60, text: '⚠️ Atenção: Compromisso em 2 horas!' },
    { label: '1h', minutes: 60, text: '⚠️ Atenção: Compromisso em 1 hora!' },
    { label: '30m', minutes: 30, text: '🚨 URGENTE: Compromisso em 30 minutos!' }
];

async function checkAppointments() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Ensure reminder_logs table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reminder_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                prospect_id INT NOT NULL,
                reminder_type VARCHAR(10) NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_reminder (prospect_id, reminder_type)
            )
        `);

        // Fetch prospects with future action_date
        const [rows] = await connection.query(`
            SELECT id, name, action_date, next_action 
            FROM prospects 
            WHERE action_date IS NOT NULL AND action_date > NOW()
        `);

        const now = new Date();

        for (const prospect of rows) {
            const actionDate = new Date(prospect.action_date);
            const diffMs = actionDate - now;
            const diffMinutes = Math.floor(diffMs / 1000 / 60);

            for (const r of REMINDERS) {
                // Check if within window (e.g., matching minute +/- 5 mins tolerance)
                // We use a range to avoid missing if cron skips a minute, but verify with logs
                if (diffMinutes >= r.minutes - 5 && diffMinutes <= r.minutes + 5) {

                    // Check if already sent
                    const [logs] = await connection.query(
                        'SELECT id FROM reminder_logs WHERE prospect_id = ? AND reminder_type = ?',
                        [prospect.id, r.label]
                    );

                    if (logs.length === 0) {
                        // Send notification
                        const msg = `
<b>${r.text}</b>
👤 <b>${prospect.name}</b>
📅 ${actionDate.toLocaleString('pt-BR')}
📝 ${prospect.next_action || 'Sem descrição'}
                        `;
                        await sendMessage(msg);

                        // Log actions
                        await connection.query(
                            'INSERT INTO reminder_logs (prospect_id, reminder_type) VALUES (?, ?)',
                            [prospect.id, r.label]
                        );
                        console.log(`✅ Reminder ${r.label} sent for prospect ${prospect.id}`);
                    }
                }
            }
        }

    } catch (error) {
        console.error('Scheduler Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

// Run every minute
const startScheduler = () => {
    console.log('⏳ Scheduler started...');
    cron.schedule('* * * * *', () => {
        checkAppointments();
    });
};

module.exports = { startScheduler };
