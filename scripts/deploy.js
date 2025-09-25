const fs = require('fs');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Provenance = await ethers.getContractFactory("Provenance");
  const provenance = await Provenance.deploy();

  console.log("Provenance contract deployed to:", provenance.address);

  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(provenance.address);

  console.log("Auction contract deployed to:", auction.address);

  const config = `
export const provenanceAddress = "${provenance.address}"
export const auctionAddress = "${auction.address}"
`

  fs.writeFileSync("frontend/src/contract-config.js", config);

  // Copy the ABI files
  fs.copyFileSync("artifacts/contracts/Provenance.sol/Provenance.json", "frontend/src/contracts/Provenance.json");
  fs.copyFileSync("artifacts/contracts/Auction.sol/Auction.json", "frontend/src/contracts/Auction.json");

  console.log("Configuration and ABI files copied to the frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
