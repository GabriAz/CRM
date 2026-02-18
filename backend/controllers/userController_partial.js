exports.getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await req.db.query('SELECT id, name, email, role, can_manage_users, created_at FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
