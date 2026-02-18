const logAction = async (db, userId, action, details) => {
    try {
        if (!userId) {
            console.error('Logger: userId is required');
            return;
        }

        const query = 'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)';
        const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;

        await db.query(query, [userId, action, detailsString]);
    } catch (error) {
        console.error('Logger Error:', error);
    }
};

module.exports = { logAction };
