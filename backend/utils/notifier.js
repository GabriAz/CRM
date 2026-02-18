const notifyAll = async (db, type, message, relatedId = null) => {
    try {
        // Fetch all users to notify (including the actor, per user request)
        const [users] = await db.query('SELECT id FROM users');

        if (users.length === 0) return;

        const values = users.map(user => [user.id, type, message, false, relatedId]);

        const query = 'INSERT INTO notifications (user_id, type, message, is_read, related_id) VALUES ?';
        await db.query(query, [values]);

        console.log(`🔔 Notified ${users.length} users about: ${type}`);
    } catch (error) {
        console.error('Failed to send notifications:', error);
    }
};

module.exports = { notifyAll };
