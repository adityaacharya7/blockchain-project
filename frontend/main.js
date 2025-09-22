import { ethers } from 'ethers';

// --- Contract Details ---
const contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3'; // <-- Updated Address
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
const hardhatNetworkId = '31337';


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

        // Check the network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (parseInt(chainId, 16).toString() !== hardhatNetworkId) {
            try {
                // Try to switch to the Hardhat network
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${parseInt(hardhatNetworkId, 10).toString(16)}` }],
                });
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: `0x${parseInt(hardhatNetworkId, 10).toString(16)}`,
                                    chainName: 'Hardhat Localhost',
                                    rpcUrls: ['http://127.0.0.1:8545'],
                                    nativeCurrency: {
                                        name: 'Ethereum',
                                        symbol: 'ETH',
                                        decimals: 18,
                                    },
                                },
                            ],
                        });
                    } catch (addError) {
                        console.error('Failed to add the Hardhat network:', addError);
                        alert('Failed to add the Hardhat network. Please add it manually.');
                        return;
                    }
                } else {
                    console.error('Failed to switch to the Hardhat network:', switchError);
                    alert('Failed to switch to the Hardhat network.');
                    return;
                }
            }
        }


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

// --- Database Interaction Functions ---
const messagesEl = document.getElementById('messages');
const testDbButton = document.getElementById('testDbButton');
const testDbStatusEl = document.getElementById('testDbStatus');
const createUserForm = document.getElementById('createUserForm');
const refreshUsersButton = document.getElementById('refreshUsersButton');
const userListEl = document.getElementById('userList');

function showMessage(message, type = 'success') {
    messagesEl.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        messagesEl.innerHTML = '';
    }, 5000);
}

async function testDbConnection() {
    try {
        const response = await fetch('http://localhost:3000/test-db');
        const data = await response.json();
        if (response.ok) {
            testDbStatusEl.textContent = `DB Status: ${data.message} (Time: ${new Date(data.currentTime).toLocaleString()})`;
            testDbStatusEl.style.color = 'green';
        } else {
            testDbStatusEl.textContent = `DB Status: Error - ${data.error}`;
            testDbStatusEl.style.color = 'red';
        }
    } catch (error) {
        console.error('Error testing DB connection:', error);
        testDbStatusEl.textContent = `DB Status: Network Error - ${error.message}`;
        testDbStatusEl.style.color = 'red';
    }
}

async function createUser(event) {
    event.preventDefault();
    const username = createUserForm.username.value;
    const password = createUserForm.password.value;
    const role = createUserForm.role.value;

    try {
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role }),
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(data.message, 'success');
            createUserForm.reset();
            fetchUsers(); // Refresh user list
        } else {
            showMessage(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showMessage(`Network Error: ${error.message}`, 'error');
    }
}

async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:3000/users');
        const data = await response.json();
        if (response.ok) {
            userListEl.innerHTML = ''; // Clear existing list
            if (data.users && data.users.length > 0) {
                const ul = document.createElement('ul');
                data.users.forEach(user => {
                    const li = document.createElement('li');
                    li.textContent = `ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Created: ${new Date(user.created_at).toLocaleString()}`;
                    ul.appendChild(li);
                });
                userListEl.appendChild(ul);
            } else {
                userListEl.innerHTML = '<p>No users yet.</p>';
            }
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        showMessage(`Network Error fetching users: ${error.message}`, 'error');
    }
}

// --- New Event Listeners for DB Interaction ---
testDbButton.addEventListener('click', testDbConnection);
createUserForm.addEventListener('submit', createUser);
refreshUsersButton.addEventListener('click', fetchUsers);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});
