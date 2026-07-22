const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

console.log('Starting database migration...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const runMigration = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Applying schema from schema.sql...');
    await pool.query(schemaSQL);
    console.log('✅ Database migration successful.');
  } catch (error) {
    console.error('❌ Error during database migration:', error);
    process.exit(1); // Exit with an error code to fail the deployment
  } finally {
    await pool.end();
  }
};

runMigration();