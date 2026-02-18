const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sanitizeMessage = (msg) => {
    // Escape characters for MarkdownV2 if needed, or just keep simple text
    // For now, we'll use HTML parse mode for bolding
    return msg;
};

const sendMessage = async (text) => {
    if (!process.env.TELEGRAM_BOT_TOKEN || !CHAT_ID) {
        console.warn('⚠️ Telegram credentials not configured.');
        return;
    }

    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: CHAT_ID,
            text: text,
            parse_mode: 'HTML'
        });
        console.log('📨 Telegram message sent.');
    } catch (error) {
        console.error('❌ Failed to send Telegram message:', error?.response?.data || error.message);
    }
};

module.exports = { sendMessage };
