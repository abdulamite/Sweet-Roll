#!/usr/bin/env node

/**
 * Database Migration Runner
 * Usage: node migrate.js [up|down|status|create <name>]
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'your_database',
  user: process.env.DB_USER || 'your_user',
  password: process.env.DB_PASSWORD || 'your_password',
});

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Create migrations tracking table
async function createMigrationsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
}

// Get list of migration files
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('No migrations directory found');
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

// Get executed migrations
async function getExecutedMigrations() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT filename FROM migrations ORDER BY filename'
    );
    return result.rows.map(row => row.filename);
  } finally {
    client.release();
  }
}

// Run a migration
async function runMigration(filename) {
  const client = await pool.connect();
  try {
    console.log(`Running migration: ${filename}`);

    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO migrations (filename) VALUES ($1)', [
      filename,
    ]);
    await client.query('COMMIT');

    console.log(`✓ Migration ${filename} completed`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Migration ${filename} failed:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Migrate up
async function migrateUp() {
  await createMigrationsTable();

  const allMigrations = getMigrationFiles();
  const executedMigrations = await getExecutedMigrations();
  const pendingMigrations = allMigrations.filter(
    file => !executedMigrations.includes(file)
  );

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }

  console.log(`Found ${pendingMigrations.length} pending migrations`);

  for (const migration of pendingMigrations) {
    await runMigration(migration);
  }

  console.log('All migrations completed successfully!');
}

// Show migration status
async function showStatus() {
  await createMigrationsTable();

  const allMigrations = getMigrationFiles();
  const executedMigrations = await getExecutedMigrations();

  console.log('\nMigration Status:');
  console.log('================');

  for (const migration of allMigrations) {
    const status = executedMigrations.includes(migration)
      ? '✓ Applied'
      : '✗ Pending';
    console.log(`${status} ${migration}`);
  }

  console.log(
    `\nTotal: ${allMigrations.length} migrations, ${executedMigrations.length} applied, ${allMigrations.length - executedMigrations.length} pending`
  );
}

// Create new migration
function createMigration(name) {
  if (!name) {
    console.error('Migration name is required');
    process.exit(1);
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:\.Z]/g, '')
    .slice(0, 14);
  const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const template = `-- Migration: ${filename}
-- Description: ${name}
-- Created: ${new Date().toISOString().split('T')[0]}

-- Add your SQL commands here
-- Example:
-- CREATE TABLE example (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL
-- );
`;

  fs.writeFileSync(filepath, template);
  console.log(`Created migration: ${filename}`);
}

// Main command handler
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'up':
        await migrateUp();
        break;
      case 'status':
        await showStatus();
        break;
      case 'create':
        const name = process.argv.slice(3).join(' ');
        createMigration(name);
        break;
      default:
        console.log(`
Database Migration Tool

Usage:
  node migrate.js up              - Run pending migrations
  node migrate.js status          - Show migration status  
  node migrate.js create <name>   - Create new migration file

Examples:
  node migrate.js up
  node migrate.js status
  node migrate.js create "add user profiles table"
        `);
    }
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
