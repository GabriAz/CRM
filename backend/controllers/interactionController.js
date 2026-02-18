const getInteractions = async (req, res) => {
  const { prospect_id } = req.query;
  try {
    let query = 'SELECT i.*, p.name as prospect_name FROM interactions i JOIN prospects p ON i.prospect_id = p.id';
    let params = [];

    if (prospect_id) {
      query += ' WHERE i.prospect_id = ?';
      params.push(prospect_id);
    }

    query += ' ORDER BY i.date DESC';

    const [rows] = await req.db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar interações' });
  }
};

const createInteraction = async (req, res) => {
  const { prospect_id, type, notes, date } = req.body;
  
  if (!prospect_id || !type) {
    return res.status(400).json({ error: 'Prospect ID e Tipo são obrigatórios' });
  }

  try {
    const [result] = await req.db.query(
      'INSERT INTO interactions (prospect_id, type, notes, date) VALUES (?, ?, ?, ?)',
      [prospect_id, type, notes || '', date || new Date()]
    );
    
    // Fetch created interaction
    const [newInteraction] = await req.db.query('SELECT * FROM interactions WHERE id = ?', [result.insertId]);
    res.status(201).json(newInteraction[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar interação' });
  }
};

module.exports = {
  getInteractions,
  createInteraction
};
