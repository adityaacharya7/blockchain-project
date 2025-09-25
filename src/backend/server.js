require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const { Pool } = require('pg'); // Import pg Pool
const ProvenanceABI = require('../../artifacts/contracts/Provenance.sol/Provenance.json').abi;

// PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test DB connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('PostgreSQL connected:', result.rows[0].now);
    });
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ethereum setup
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/"); // Hardhat Network default
const provenanceContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Replace with your deployed contract address
const provenanceContract = new ethers.Contract(provenanceContractAddress, ProvenanceABI, provider);

// Simple password hashing (for demonstration, use bcrypt in production)
const hashPassword = (password) => {
    // In a real application, use a strong hashing library like bcrypt
    return `hashed_${password}`;
};

// Routes
app.get('/', (req, res) => {
    res.send('Backend API is running!');
});

// Example route to interact with the contract (read batchCount)
app.get('/batchCount', async (req, res) => {
    try {
        const count = await provenanceContract.batchCount();
        res.json({ batchCount: count.toString() });
    } catch (error) {
        console.error("Error fetching batch count:", error);
        res.status(500).json({ error: "Failed to fetch batch count" });
    }
});

// Test DB endpoint
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({ message: 'Database connection successful', currentTime: result.rows[0].current_time });
    } catch (error) {
        console.error('Error testing DB connection:', error);
        res.status(500).json({ error: 'Failed to test database connection' });
    }
});

// POST /users - Create a new user
app.post('/users', async (req, res) => {
    const { username, password, role, wallet_address } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    try {
        const password_hash = hashPassword(password);
        const result = await pool.query(
            'INSERT INTO users (username, password_hash, role, wallet_address) VALUES ($1, $2, $3, $4) RETURNING id, username, role, wallet_address, created_at',
            [username, password_hash, role, wallet_address]
        );
        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') { // Unique violation error code
            return res.status(409).json({ error: 'Username or wallet address already exists' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// GET /users - Get all users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
        res.json({ users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /login - User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);

    if (!username || !password) {
        console.log('Login failed: Username or password not provided.');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        console.log(`Querying database for user: ${username}`);
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            console.log(`Login failed: User not found for username: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        console.log(`User found:`, user);

        const password_hash = hashPassword(password);
        console.log(`Comparing provided password hash: ${password_hash} with stored hash: ${user.password_hash}`);

        if (user.password_hash !== password_hash) {
            console.log(`Login failed: Password mismatch for username: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`Login successful for username: ${username}`);
        res.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to log in' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend API listening at http://localhost:${port}`);
});