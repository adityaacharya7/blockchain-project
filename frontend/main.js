import { ethers } from 'ethers';

// --- Contract Details ---
const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        }
      ],
      "name": "BatchRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "batchCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "batches",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "getBatch",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        }
      ],
      "name": "registerBatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// --- Global State ---
let provider;
let signer;
let contract;

// --- UI Elements ---
const connectButton = document.getElementById('connectButton');
const statusEl = document.getElementById('status');
const accountEl = document.getElementById('account');
const registerBatchButton = document.getElementById('registerBatchButton');
const getBatchButton = document.getElementById('getBatchButton');
const transferButton = document.getElementById('transferButton');
const getBatchCountButton = document.getElementById('getBatchCountButton'); // New line
const batchDetailsEl = document.getElementById('batchDetails');

// --- Functions ---

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed!');
        return;
    }

    try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Set up provider and signer
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        window.contract = contract; // Expose contract globally for debugging

        const address = await signer.getAddress();
        
        // Update UI
        statusEl.textContent = 'Connected';
        accountEl.textContent = address;
        connectButton.textContent = 'Wallet Connected';
        connectButton.disabled = true;

        console.log('Wallet connected:', address);
        console.log('Contract instance:', contract); // New line for debugging
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet.');
    }
}

async function registerBatch() {
    if (!contract) {
        alert('Please connect your wallet first.');
        return;
    }

    const ipfsHash = document.getElementById('ipfsHash').value;
    if (!ipfsHash) {
        alert('Please enter an IPFS hash.');
        return;
    }

    try {
        const tx = await contract.registerBatch(ipfsHash);
        batchDetailsEl.textContent = `Transaction sent: ${tx.hash}...\nWaiting for confirmation...`;
        await tx.wait();
        batchDetailsEl.textContent = `Batch registered successfully!\nTransaction hash: ${tx.hash}`;
        document.getElementById('ipfsHash').value = ''; // Clear input
    } catch (error) {
        console.error('Error registering batch:', error);
        batchDetailsEl.textContent = `Error: ${error.message}`;
    }
}

async function getBatch() {
    if (!contract) {
        alert('Please connect your wallet first.');
        return;
    }

    const batchId = document.getElementById('batchId').value;
    if (!batchId) {
        alert('Please enter a Batch ID.');
        return;
    }

    try {
        const result = await contract.getBatch(batchId);
        const [id, farmer, ipfsHash, owners, timestamps] = result;

        const formattedOwners = owners.join('\n  ');
        const formattedTimestamps = timestamps.map(ts => new Date(Number(ts) * 1000).toLocaleString()).join('\n  ');

        batchDetailsEl.textContent = 
`Batch Details (ID: ${id}):\n` +
`---------------------------\n` +
`Farmer: ${farmer}\n` +
`IPFS Hash: ${ipfsHash}\n\n` +
`Ownership History:\n  ${formattedOwners}\n\n` +
`Timestamps:\n  ${formattedTimestamps}`;

    } catch (error) {
        console.error('Error fetching batch:', error);
        batchDetailsEl.textContent = `Error: ${error.message}`;
    }
}

async function transferOwnership() {
    if (!contract) {
        alert('Please connect your wallet first.');
        return;
    }

    const batchId = document.getElementById('transferBatchId').value;
    const toAddress = document.getElementById('toAddress').value;

    if (!batchId || !toAddress) {
        alert('Please enter both Batch ID and a valid address.');
        return;
    }

    if (!ethers.isAddress(toAddress)) {
        alert('Invalid Ethereum address.');
        return;
    }

    try {
        const tx = await contract.transferOwnership(batchId, toAddress);
        batchDetailsEl.textContent = `Transfer transaction sent: ${tx.hash}...\nWaiting for confirmation...`;
        await tx.wait();
        batchDetailsEl.textContent = `Ownership transferred successfully for batch ${batchId} to ${toAddress}`;
        document.getElementById('transferBatchId').value = '';
        document.getElementById('toAddress').value = '';
    } catch (error) {
        console.error('Error transferring ownership:', error);
        batchDetailsEl.textContent = `Error: ${error.message}`;
    }
}


// --- Functions ---

// New function to get batch count
async function getBatchCount() {
    if (!contract) {
        alert('Please connect your wallet first.');
        return;
    }
    try {
        const count = await contract.batchCount();
        batchDetailsEl.textContent = `Total Batches: ${count.toString()}`;
    } catch (error) {
        console.error('Error fetching batch count:', error);
        batchDetailsEl.textContent = `Error: ${error.message}`;
    }
}

// --- Event Listeners ---
connectButton.addEventListener('click', connectWallet);
registerBatchButton.addEventListener('click', registerBatch);
getBatchButton.addEventListener('click', getBatch);
transferButton.addEventListener('click', transferOwnership);
getBatchCountButton.addEventListener('click', getBatchCount); // New line
