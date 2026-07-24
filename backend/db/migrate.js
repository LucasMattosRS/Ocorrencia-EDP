const fs = require('fs');
const path = require('path');
const db = require('./pool'); // Usa o pool de conexões centralizado
require('dotenv').config();

const runMigration = async () => {
  // O schema.sql agora está no mesmo diretório
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

  console.log('Applying schema from schema.sql...');
  await db.query(schemaSQL);
  console.log('✅ Database migration successful.');
};

// Só roda sozinho (com process.exit em caso de erro) quando chamado direto via
// "node db/migrate.js" / "npm run db:migrate". Quando importado por server.js na subida do
// servidor, quem chama runMigration() decide o que fazer com o erro.
if (require.main === module) {
  console.log('Starting database migration...');
  runMigration()
    .catch((error) => {
      console.error('❌ Error during database migration:', error);
      process.exit(1);
    })
    .finally(() => {
      console.log('Migration script finished.');
    });
}

module.exports = { runMigration };
