const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: '*', // Permitir todas as origens (idealmente, trocar pelo domínio da Hostinger em produção)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json());

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'studio_que_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to attach db to request
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Health Check
app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

const prospectRoutes = require('./routes/prospectRoutes');
const interactionRoutes = require('./routes/interactionRoutes');

// Routes
app.use('/api/prospects', prospectRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Basic Routes (Placeholder)
app.get('/', (req, res) => {
  res.send('Studio Que CRM API');
});

const { startScheduler } = require('./scheduler');

// Start Appointment Scheduler
startScheduler();

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
