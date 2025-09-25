const { ethers } = require("hardhat");

async function main() {
  const provenanceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log(`Attempting to connect to Provenance contract at: ${provenanceAddress}`);

  const Provenance = await ethers.getContractFactory("Provenance");
  const provenance = Provenance.attach(provenanceAddress);

  try {
    console.log("Fetching batch count...");
    const batchCount = await provenance.batchCount();
    console.log(`Success! Batch count is: ${batchCount.toString()}`);
  } catch (error) {
    console.error("Failed to fetch batch count.");
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
