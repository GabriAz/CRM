const { logAction } = require('../middleware/logger');
const { notifyAll } = require('../utils/notifier');
const { sendMessage } = require('../services/telegramService');

const getProspects = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        (SELECT date FROM interactions WHERE prospect_id = p.id ORDER BY date DESC LIMIT 1) as last_interaction_date,
        (SELECT type FROM interactions WHERE prospect_id = p.id ORDER BY date DESC LIMIT 1) as last_interaction_type
      FROM prospects p
      ORDER BY p.created_at DESC
    `;
    const [rows] = await req.db.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar prospectos' });
  }
};

const createProspect = async (req, res) => {
  const { name, phone, email, notes, priority, status, column_id, estimated_value, next_action, action_date } = req.body;
  const userId = req.headers['x-user-id'];

  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const [result] = await req.db.query(
      'INSERT INTO prospects (name, phone, email, notes, priority, status, column_id, estimated_value, next_action, action_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, phone, email, notes || '', priority || 'Media', status || 'Lead', column_id || 1, estimated_value || 0, next_action || '', req.body.action_date || null]
    );

    // Log
    if (userId) {
      await logAction(req.db, userId, 'CREATE_PROSPECT', `Criou prospecto: ${name}`);
    }

    // Notify
    await notifyAll(req.db, 'NEW_PROSPECT', `Novo prospecto adicionado: ${name}`, result.insertId);

    // Telegram
    await sendMessage(`<b>🆕 Novo Prospecto</b>\n👤 ${name}\n📱 ${phone}\n💰 Valor: R$ ${estimated_value || 0}`);

    // Fetch the created prospect to return it
    const [newProspect] = await req.db.query('SELECT * FROM prospects WHERE id = ?', [result.insertId]);
    res.status(201).json(newProspect[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar prospecto' });
  }
};

const updateProspect = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, notes, priority, estimated_value, next_action, action_date } = req.body;
  const userId = req.headers['x-user-id'];

  try {
    await req.db.query(
      'UPDATE prospects SET name = ?, phone = ?, email = ?, notes = ?, priority = ?, estimated_value = ?, next_action = ?, action_date = ? WHERE id = ?',
      [name, phone, email, notes, priority, estimated_value, next_action, action_date || null, id]
    );

    if (userId) {
      await logAction(req.db, userId, 'UPDATE_PROSPECT', `Atualizou prospecto ID ${id}: ${name}`);
    }

    await notifyAll(req.db, 'UPDATE_PROSPECT', `Prospecto atualizado: ${name}`, id);

    // Telegram
    await sendMessage(`<b>✏️ Prospecto Atualizado</b>\n👤 ${name}\n📝 ${next_action || 'Sem próxima ação'}`);

    res.json({ success: true, id, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar prospecto' });
  }
};

const updateProspectStatus = async (req, res) => {
  const { id } = req.params;
  const { column_id, status } = req.body; // Expecting new column ID and status name
  const userId = req.headers['x-user-id'];

  try {
    await req.db.query(
      'UPDATE prospects SET column_id = ?, status = ? WHERE id = ?',
      [column_id, status, id]
    );

    if (userId) {
      await logAction(req.db, userId, 'MOVE_CARD', `Moveu prospecto ID ${id} para ${status}`);
    }

    await notifyAll(req.db, 'MOVE_CARD', `Prospecto movido para ${status}`, id);

    // Telegram
    await sendMessage(`<b>🔄 Card Movido</b>\n👤 ID: ${id}\n📍 Nova Fase: ${status}`);

    res.json({ success: true, id, column_id, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status do prospecto' });
  }
};

const deleteProspect = async (req, res) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'];

  try {
    await req.db.query('DELETE FROM prospects WHERE id = ?', [id]);

    if (userId) {
      await logAction(req.db, userId, 'DELETE_PROSPECT', `Deletou prospecto ID ${id}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar prospecto' });
  }
};

module.exports = {
  getProspects,
  createProspect,
  updateProspect,
  updateProspectStatus,
  deleteProspect
};
