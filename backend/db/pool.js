const { Pool } = require('pg');
require('dotenv').config();

// A biblioteca 'pg' automaticamente usará a variável de ambiente DATABASE_URL se estiver definida.
// Formato: postgres://USER:PASSWORD@HOST:PORT/DATABASE
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Para ambientes de produção que exigem SSL (como Heroku, Render)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
