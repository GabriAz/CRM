const { sendMessage } = require('./services/telegramService');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

(async () => {
    console.log('Testing Telegram...');
    await sendMessage('🚀 <b>Teste de Unidade</b>: Integração Telegram funcionando!');
})();
