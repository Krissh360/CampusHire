/**
 * CampusHire - Database Bootstrap & Migrations Runner
 * Executes schema.sql, indexes.sql, and sample_data.sql sequentially
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'campushire_db';

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // Initial connection without database to ensure database exists
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log('Connected to MySQL server.');

    console.log(`Ensuring database '${database}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);

    // Helper to read and execute SQL file
    const executeSqlFile = async (filePath) => {
      console.log(`Executing ${path.basename(filePath)}...`);
      const sql = fs.readFileSync(filePath, 'utf-8');
      await connection.query(sql);
      console.log(`Successfully executed ${path.basename(filePath)}.`);
    };

    const dbDir = path.resolve(__dirname, '../../../database');

    await executeSqlFile(path.join(dbDir, 'schema.sql'));
    await executeSqlFile(path.join(dbDir, 'indexes.sql'));
    await executeSqlFile(path.join(dbDir, 'sample_data.sql'));

    console.log('\nAll database migrations & seed scripts executed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\nDatabase initialization failed:');
    console.error(err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('Hint: Make sure MySQL server service is running on ' + host + ':' + port);
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
