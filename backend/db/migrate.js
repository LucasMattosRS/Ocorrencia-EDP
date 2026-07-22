const fs = require('fs');
const path = require('path');
const db = require('./pool'); // Usa o pool de conexões centralizado
require('dotenv').config();

console.log('Starting database migration...');

const runMigration = async () => {
  try {
    // O schema.sql agora está no mesmo diretório
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Applying schema from schema.sql...');
    await db.query(schemaSQL);
    console.log('✅ Database migration successful.');
  } catch (error) {
    console.error('❌ Error during database migration:', error);
    process.exit(1);
  } finally {
    // A gestão do pool é centralizada, não precisamos fechar a conexão aqui.
    console.log('Migration script finished.');
  }
};

runMigration();
