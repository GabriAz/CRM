const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

async function initAuth() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db', // Adjust if running locally without docker network names
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'studio_que_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Connecting to database...');
    const connection = await pool.getConnection();
    console.log('Connected!');

    // Create Users Table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await connection.query(createTableQuery);
    console.log('Users table created or already exists.');

    // Check if admin exists
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['gabriel@studioque.com']);
    
    if (rows.length === 0) {
      console.log('Creating admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Gabriel', 'gabriel@studioque.com', hashedPassword, 'admin']
      );
      console.log('Admin user created: gabriel@studioque.com / admin123');
    } else {
      console.log('Admin user already exists.');
    }

    connection.release();
  } catch (error) {
    console.error('Error initializing auth:', error);
  } finally {
    await pool.end();
  }
}

initAuth();
