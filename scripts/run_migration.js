const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually configuring connection based on .env content seen:
// DATABASE_URL="postgresql://postgres:doosan9809%2A@db.tyrsmujlycxvuwbwffgn.supabase.co:5432/postgres"

const client = new Client({
    user: 'postgres',
    host: 'db.tyrsmujlycxvuwbwffgn.supabase.co',
    database: 'postgres',
    password: 'doosan9809*', // Decoded from %2A
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully!');

        const sqlPath = path.resolve(__dirname, 'add_project_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing migration...');
        await client.query(sql);

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
