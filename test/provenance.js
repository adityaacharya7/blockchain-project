const { expect } = require("chai");

describe("Provenance", function () {
  it("Should register a new batch", async function () {
    const Provenance = await ethers.getContractFactory("Provenance");
    const provenance = await Provenance.deploy();
    await provenance.deployed();

    await provenance.registerBatch("ipfs_hash_1");

    const [id, farmer, ipfsHash, custodians, timestamps] = await provenance.getBatch(1);
    expect(id).to.equal(1);
    expect(ipfsHash).to.equal("ipfs_hash_1");
  });

  it("Should transfer ownership of a batch", async function () {
    const Provenance = await ethers.getContractFactory("Provenance");
    const provenance = await Provenance.deploy();
    await provenance.deployed();

    const [owner, addr1] = await ethers.getSigners();

    await provenance.registerBatch("ipfs_hash_1");
    await provenance.transferOwnership(1, addr1.address);

    const [id, farmer, ipfsHash, custodians, timestamps] = await provenance.getBatch(1);
    expect(custodians[1]).to.equal(addr1.address);
  });
});
