exports.getNotifications = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'User ID required' });

    try {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        const [notifications] = await req.db.query(query, [userId]);

        // Count unread
        const [countResult] = await req.db.query(
            'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );

        res.json({
            notifications,
            unreadCount: countResult[0].unread
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    try {
        if (id === 'all') {
            await req.db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
        } else {
            await req.db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
};
