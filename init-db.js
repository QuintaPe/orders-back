import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from './src/db.js';

async function initDatabase() {
    try {
        console.log('Initializing database...');

        // Create users table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'waiter',
                created_at TEXT NOT NULL
            )
        `);

        // Check if users already exist
        const existingUsers = await db.execute('SELECT COUNT(*) as count FROM users');

        if (existingUsers.rows[0].count === 0) {
            console.log('Creating sample users...');

            const saltRounds = 10;
            const password = await bcrypt.hash('password123', saltRounds);
            const now = new Date().toISOString();

            // Create sample users
            const users = [
                {
                    id: uuidv4(),
                    username: 'admin',
                    password,
                    name: 'Administrator',
                    role: 'admin',
                    created_at: now
                },
                {
                    id: uuidv4(),
                    username: 'waiter1',
                    password,
                    name: 'Juan Pérez',
                    role: 'waiter',
                    created_at: now
                },
                {
                    id: uuidv4(),
                    username: 'waiter2',
                    password,
                    name: 'María García',
                    role: 'waiter',
                    created_at: now
                },
                {
                    id: uuidv4(),
                    username: 'manager',
                    password,
                    name: 'Carlos López',
                    role: 'manager',
                    created_at: now
                }
            ];

            for (const user of users) {
                await db.execute(`
                    INSERT INTO users (id, username, password, name, role, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [user.id, user.username, user.password, user.name, user.role, user.created_at]);
            }

            console.log('Sample users created successfully!');
            console.log('Default password for all users: password123');
        } else {
            console.log('Users table already has data, skipping sample user creation.');
        }

        console.log('Database initialization completed!');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        process.exit(0);
    }
}

initDatabase(); 