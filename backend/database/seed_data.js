const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const prospects = [
  { name: 'Empresa Alpha', status: 'Lead', priority: 'Alta', value: 15000.00 },
  { name: 'Tech Solutions', status: 'Contactado', priority: 'Media', value: 8500.00 },
  { name: 'Café do Mercado', status: 'Em Proposta', priority: 'Baixa', value: 2500.00 },
  { name: 'Construtora Silva', status: 'Negociação', priority: 'Alta', value: 45000.00 },
  { name: 'Dr. Roberto Med', status: 'Fechado', priority: 'Media', value: 12000.00 },
  { name: 'Startup Flow', status: 'Lead', priority: 'Alta', value: 22000.00 },
  { name: 'Oficina Master', status: 'Lead', priority: 'Baixa', value: 1800.00 },
  { name: 'Aadvocacia Pires', status: 'Contactado', priority: 'Media', value: 5000.00 },
  { name: 'Restaurante Sabor', status: 'Contactado', priority: 'Alta', value: 7500.00 },
  { name: 'Moda Fashion', status: 'Em Proposta', priority: 'Baixa', value: 3000.00 },
  { name: 'Consultoria RH', status: 'Em Proposta', priority: 'Media', value: 9000.00 },
  { name: 'Logística Express', status: 'Negociação', priority: 'Alta', value: 35000.00 },
  { name: 'Escola Aprender', status: 'Negociação', priority: 'Media', value: 15000.00 },
  { name: 'Petshop Amigo', status: 'Fechado', priority: 'Baixa', value: 1200.00 },
  { name: 'Academia Fit', status: 'Lead', priority: 'Media', value: 4000.00 },
  { name: 'Imobiliária House', status: 'Contactado', priority: 'Alta', value: 28000.00 },
  { name: 'Studio Design', status: 'Em Proposta', priority: 'Media', value: 6500.00 },
  { name: 'Clinica Sorriso', status: 'Negociação', priority: 'Alta', value: 18000.00 },
  { name: 'Auto Center', status: 'Lead', priority: 'Baixa', value: 2000.00 },
  { name: 'Marketing Digital', status: 'Fechado', priority: 'Alta', value: 10000.00 },
  { name: 'Barbearia Vintage', status: 'Lead', priority: 'Media', value: 2500.00 },
];

const interactions = [
  'Ligação de apresentação', 'Email enviado com portfólio', 'Reunião de alinhamento',
  'WhatsApp solicitando orçamento', 'Visita presencial', 'Call de fechamento',
  'Email de follow-up', 'Mensagem no LinkedIn'
];

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'studio_que_db',
    port: process.env.DB_PORT || 3306 // Mapping might be needed if running outside docker
  });

  console.log('Connected to DB');

  // Truncate
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE interactions');
  await connection.query('TRUNCATE TABLE prospects');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Tables truncated');

  // Insert Prospects
  for (const p of prospects) {
    const columnMap = { 'Lead': 1, 'Contactado': 2, 'Em Proposta': 3, 'Negociação': 4, 'Fechado': 5 };
    const [res] = await connection.query(
      'INSERT INTO prospects (name, status, priority, column_id, estimated_value, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [p.name, p.status, p.priority, columnMap[p.status], p.value]
    );
    const prospectId = res.insertId;

    // Add 0-3 random interactions
    const numInteractions = Math.floor(Math.random() * 4);
    for (let i = 0; i < numInteractions; i++) {
      const type = ['Ligação', 'Email', 'WhatsApp', 'Reunião'][Math.floor(Math.random() * 4)];
      const note = interactions[Math.floor(Math.random() * interactions.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      await connection.query(
        'INSERT INTO interactions (prospect_id, type, notes, date) VALUES (?, ?, ?, ?)',
        [prospectId, type, note, date]
      );
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
