exports.getLogs = async (req, res) => {
    try {
        const { search, action, limit } = req.query;
        let query = `
            SELECT 
                l.id, l.action, l.details, l.created_at,
                u.name as user_name, u.email as user_email
            FROM activity_logs l
            JOIN users u ON l.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (action) {
            query += ' AND l.action = ?';
            params.push(action);
        }

        if (search) {
            query += ' AND (l.details LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY l.created_at DESC LIMIT ?';
        params.push(parseInt(limit) || 100);

        const [logs] = await req.db.query(query, params);
        res.json(logs);
    } catch (error) {
        console.error('Fetch logs error:', error);
        res.status(500).json({ error: 'Erro ao buscar logs' });
    }
};
