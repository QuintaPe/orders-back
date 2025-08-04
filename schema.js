import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function executeSchema() {
    try {
        // Read the schema file
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');

        // Split the schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        // Execute each statement
        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                await db.execute(statement);
            }
        }

        console.log('Schema executed successfully!');

        // Verify the tables were created
        const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables created:', tables.rows.map(row => row.name));

    } catch (error) {
        console.error('Error executing schema:', error);
    } finally {
        process.exit(0);
    }
}

executeSchema();