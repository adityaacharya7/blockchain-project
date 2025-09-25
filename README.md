# Blockchain-based Auction and Provenance System

This project is a decentralized application (DApp) that implements a transparent and secure auction system with a provenance tracker for high-value assets. It leverages blockchain technology to ensure the integrity of the auction process and to provide an immutable record of an asset's history.

## Tech Stack

### Blockchain
- **Ethereum:** The smart contracts are built for the Ethereum blockchain.
- **Solidity:** The smart contracts are written in Solidity.
- **Hardhat:** The project uses Hardhat for Ethereum development, testing, and deployment.
- **Ethers.js:** The frontend and backend interact with the Ethereum blockchain using Ethers.js.

### Frontend
- **Vite:** The frontend is built with Vite, a modern and fast build tool.
- **Ethers.js:** Used to interact with the smart contracts from the frontend.
- **Chart.js:** To visualize auction data and provenance history.

### Backend
- **Node.js:** The backend is built with Node.js.
- **Express.js:** A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **PostgreSQL:** A powerful, open-source object-relational database system.

### Testing
- **Waffle:** A library for writing and testing smart contracts.
- **Chai:** A BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.

## Project Structure

```
.
├── contracts
│   ├── Auction.sol
│   └── Provenance.sol
├── frontend
│   ├── src
│   │   └── main.js
│   └── index.html
├── src
│   └── backend
│       └── server.js
├── scripts
│   ├── deploy.js
│   └── test-connection.js
├── test
│   ├── auction.js
│   └── provenance.js
├── hardhat.config.cjs
└── package.json
```

- **`contracts/`**: Contains the Solidity smart contracts, `Auction.sol` and `Provenance.sol`.
- **`frontend/`**: Contains the frontend application built with Vite.
- **`src/backend/`**: Contains the backend server built with Node.js and Express.
- **`scripts/`**: Contains scripts for deployment and testing the connection.
- **`test/`**: Contains tests for the smart contracts.

## Getting Started

### Prerequisites

- Node.js and npm
- A PostgreSQL database
- An Ethereum wallet (e.g., MetaMask)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Install backend dependencies:**
   ```bash
   cd src/backend
   npm install
   cd ../..
   ```

### Configuration

1. **Create a `.env` file in the root directory and add the following:**
   ```
   PRIVATE_KEY=<your-ethereum-wallet-private-key>
   ```

2. **Create a `.env` file in the `src/backend` directory and add the following:**
   ```
   DB_USER=<your-postgresql-username>
   DB_HOST=localhost
   DB_DATABASE=<your-postgresql-database-name>
   DB_PASSWORD=<your-postgresql-password>
   DB_PORT=5432
   ```

3. **Configure Hardhat:**
   - Open `hardhat.config.cjs` and configure the network you want to deploy to (e.g., `localhost`, `rinkeby`, `mainnet`).

### Running the Application

1. **Deploy the smart contracts:**
   ```bash
   npx hardhat run scripts/deploy.js --network <your-network>
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```

3. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

1. **Register a new batch of assets:**
   - Use the `Provenance` contract to register a new batch of assets. This will create a new token with a unique ID and record the creator as the first owner.

2. **Create an auction:**
   - Use the `Auction` contract to create a new auction for a batch of assets. You will need to provide the batch ID, starting price, and auction duration.

3. **Bid on an auction:**
   - Participants can bid on an auction by sending a transaction to the `bid` function of the `Auction` contract. The bid must be higher than the current highest bid.

4. **End an auction:**
   - After the auction duration has passed, anyone can call the `endAuction` function to end the auction. The highest bidder will be transferred ownership of the asset, and the seller will receive the highest bid.

## Testing

To run the tests for the smart contracts, run the following command:

```bash
npm test
```
