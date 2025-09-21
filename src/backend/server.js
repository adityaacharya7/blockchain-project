import express from 'express';
import { ethers } from 'ethers';
import fs from 'fs';

const app = express();
app.use(express.json());

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const signer = provider.getSigner();

const contractArtifact = JSON.parse(fs.readFileSync('artifacts/contracts/Provenance.sol/Provenance.json'));
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your contract address
const contract = new ethers.Contract(contractAddress, contractArtifact.abi, signer);

app.post('/api/register', async (req, res) => {
  const { ipfsHash } = req.body;
  try {
    const tx = await contract.registerBatch(ipfsHash);
    await tx.wait();
    res.status(200).send({ message: 'Batch registered successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error registering batch', error });
  }
});

app.post('/api/transfer', async (req, res) => {
  const { id, to } = req.body;
  try {
    const tx = await contract.transferOwnership(id, to);
    await tx.wait();
    res.status(200).send({ message: 'Ownership transferred successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error transferring ownership', error });
  }
});

app.get('/api/batch/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const batch = await contract.getBatch(id);
    res.status(200).send(batch);
  } catch (error) {
    res.status(500).send({ message: 'Error getting batch', error });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
