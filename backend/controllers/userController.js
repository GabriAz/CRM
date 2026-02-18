const bcrypt = require('bcryptjs');

const { logAction } = require('../middleware/logger');

exports.getUsers = async (req, res) => {
    try {
        const [users] = await req.db.query('SELECT id, name, email, role, can_manage_users, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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

exports.createUser = async (req, res) => {
    const { name, email, password, role, can_manage_users } = req.body;
    const adminId = req.headers['x-user-id'];

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await req.db.query(
            'INSERT INTO users (name, email, password_hash, role, can_manage_users) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'user', can_manage_users || false]
        );

        if (adminId) {
            await logAction(req.db, adminId, 'CREATE_USER', `Criou usuário: ${name} (${email})`);
        }

        res.status(201).json({ id: result.insertId, name, email, role, can_manage_users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, can_manage_users } = req.body;
    const adminId = req.headers['x-user-id'];

    try {
        let query = 'UPDATE users SET name = ?, email = ?, role = ?, can_manage_users = ?';
        let params = [name, email, role, can_manage_users];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password_hash = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await req.db.query(query, params);

        if (adminId) {
            await logAction(req.db, adminId, 'UPDATE_USER', `Atualizou usuário ID ${id}: ${name}`);
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const adminId = req.headers['x-user-id'];

    try {
        await req.db.query('DELETE FROM users WHERE id = ?', [id]);

        if (adminId) {
            await logAction(req.db, adminId, 'DELETE_USER', `Deletou usuário ID ${id}`);
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
