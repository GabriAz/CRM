const { sendMessage } = require('../services/telegramService');

const getAppointments = async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT a.*, p.name as prospect_name 
            FROM appointments a 
            LEFT JOIN prospects p ON a.prospect_id = p.id 
            ORDER BY a.date_start ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar compromissos' });
    }
};

const createAppointment = async (req, res) => {
    const { title, description, date_start, date_end, prospect_id, type } = req.body;
    const userId = req.headers['x-user-id'];

    if (!title || !date_start) {
        return res.status(400).json({ error: 'Título e data são obrigatórios' });
    }

    try {
        const [result] = await req.db.query(
            'INSERT INTO appointments (title, description, date_start, date_end, prospect_id, type, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', date_start, date_end || null, prospect_id || null, type || 'Reunião', userId || null]
        );

        const [[appointment]] = await req.db.query(
            'SELECT a.*, p.name as prospect_name FROM appointments a LEFT JOIN prospects p ON a.prospect_id = p.id WHERE a.id = ?',
            [result.insertId]
        );

        const dateFormatted = new Date(date_start).toLocaleString('pt-BR');
        const prospectInfo = appointment.prospect_name ? `\n👤 ${appointment.prospect_name}` : '';
        await sendMessage(`<b>📅 Novo Compromisso</b>\n📌 ${title}${prospectInfo}\n🕐 ${dateFormatted}\n🏷️ ${type || 'Reunião'}`);

        res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar compromisso' });
    }
};

const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { title, description, date_start, date_end, prospect_id, type } = req.body;

    try {
        await req.db.query(
            'UPDATE appointments SET title = ?, description = ?, date_start = ?, date_end = ?, prospect_id = ?, type = ? WHERE id = ?',
            [title, description || '', date_start, date_end || null, prospect_id || null, type || 'Reunião', id]
        );

        const [[appointment]] = await req.db.query(
            'SELECT a.*, p.name as prospect_name FROM appointments a LEFT JOIN prospects p ON a.prospect_id = p.id WHERE a.id = ?',
            [id]
        );

        const dateFormatted = new Date(date_start).toLocaleString('pt-BR');
        await sendMessage(`<b>✏️ Compromisso Atualizado</b>\n📌 ${title}\n🕐 ${dateFormatted}`);

        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar compromisso' });
    }
};

const deleteAppointment = async (req, res) => {
    const { id } = req.params;

    try {
        const [[appointment]] = await req.db.query('SELECT title FROM appointments WHERE id = ?', [id]);
        await req.db.query('DELETE FROM appointments WHERE id = ?', [id]);

        if (appointment) {
            await sendMessage(`<b>🗑️ Compromisso Excluído</b>\n📌 ${appointment.title}`);
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir compromisso' });
    }
};

module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment };
