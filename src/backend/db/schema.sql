
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- e.g., 'farmer', 'distributor', 'retailer'
    wallet_address VARCHAR(42) UNIQUE, -- Ethereum wallet address
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_requests (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    retailer_wallet_address VARCHAR(42) NOT NULL,
    distributor_wallet_address VARCHAR(42) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'completed', 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    blockchain_batch_id VARCHAR(255) UNIQUE NOT NULL, -- Link to on-chain batch ID
    ipfs_cid VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    ml_results JSONB, -- Store ML results as JSON
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batch_history (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id),
    event_type VARCHAR(255) NOT NULL, -- e.g., 'harvest', 'process', 'ship', 'quality_check'
    event_data JSONB, -- Detailed event data
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor_id INTEGER REFERENCES users(id)
);
