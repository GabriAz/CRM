const bcrypt = require('bcryptjs');

const { logAction } = require('../middleware/logger');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const [users] = await req.db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        // Return user data (exclude password)
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            can_manage_users: user.can_manage_users ? true : false, // Ensure boolean
            created_at: user.created_at
        };

        // Log Login Action
        await logAction(req.db, user.id, 'LOGIN', 'Usuário realizou login no sistema.');

        res.json({ message: 'Login bem sucedido', user: userData });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
