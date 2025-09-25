const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auction", function () {
  let Provenance, provenance, Auction, auction, owner, seller, bidder1, bidder2;

  beforeEach(async function () {
    // Get signers
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // Deploy Provenance contract
    Provenance = await ethers.getContractFactory("Provenance");
    provenance = await Provenance.deploy();
    await provenance.deployed();

    // Deploy Auction contract
    Auction = await ethers.getContractFactory("Auction");
    auction = await Auction.deploy(provenance.address);
    await auction.deployed();
  });

  it("Should create an auction", async function () {
    // Seller registers a new batch
    await provenance.connect(seller).registerBatch("ipfs_hash_for_auction");
    const batchId = 1;

    // Seller transfers ownership to the Auction contract
    await provenance.connect(seller).transferOwnership(batchId, auction.address);

    // Seller creates an auction
    const startingPrice = ethers.utils.parseEther("1");
    const duration = 60 * 60; // 1 hour
    await auction.connect(seller).createAuction(batchId, startingPrice, duration);

    const auctionItem = await auction.auctions(batchId);
    expect(auctionItem.seller).to.equal(seller.address);
    expect(auctionItem.startingPrice).to.equal(startingPrice);
    expect(auctionItem.started).to.be.true;
  });

  it("Should allow placing a bid", async function () {
    // Setup auction
    await provenance.connect(seller).registerBatch("ipfs_hash_for_auction");
    const batchId = 1;
    await provenance.connect(seller).transferOwnership(batchId, auction.address);
    const startingPrice = ethers.utils.parseEther("1");
    await auction.connect(seller).createAuction(batchId, startingPrice, 60 * 60);

    // Bidder1 places a bid
    const bidAmount = ethers.utils.parseEther("1.5");
    await auction.connect(bidder1).bid(batchId, { value: bidAmount });

    const auctionItem = await auction.auctions(batchId);
    expect(auctionItem.highestBidder).to.equal(bidder1.address);
    expect(auctionItem.highestBid).to.equal(bidAmount);
  });

  it("Should not allow a bid lower than the highest bid", async function () {
    // Setup auction and first bid
    await provenance.connect(seller).registerBatch("ipfs_hash_for_auction");
    const batchId = 1;
    await provenance.connect(seller).transferOwnership(batchId, auction.address);
    const startingPrice = ethers.utils.parseEther("1");
    await auction.connect(seller).createAuction(batchId, startingPrice, 60 * 60);
    const bidAmount1 = ethers.utils.parseEther("1.5");
    await auction.connect(bidder1).bid(batchId, { value: bidAmount1 });

    // Bidder2 tries to place a lower bid
    const bidAmount2 = ethers.utils.parseEther("1.4");
    await expect(
      auction.connect(bidder2).bid(batchId, { value: bidAmount2 })
    ).to.be.revertedWith("Bid must be higher than current highest bid");
  });

  it("Should end an auction and transfer ownership and funds", async function () {
    // Setup auction and bid
    await provenance.connect(seller).registerBatch("ipfs_hash_for_auction");
    const batchId = 1;
    await provenance.connect(seller).transferOwnership(batchId, auction.address);
    const startingPrice = ethers.utils.parseEther("1");
    await auction.connect(seller).createAuction(batchId, startingPrice, 1); // 1 second duration for testing
    const bidAmount = ethers.utils.parseEther("2");
    await auction.connect(bidder1).bid(batchId, { value: bidAmount });

    // Wait for the auction to end
    await new Promise(resolve => setTimeout(resolve, 2000));

    const sellerBalanceBefore = await seller.getBalance();

    // End the auction
    await auction.endAuction(batchId);

    // Check ownership transfer
    const [, , , custodians, ] = await provenance.getBatch(batchId);
    expect(custodians[custodians.length - 1]).to.equal(bidder1.address);

    // Check fund transfer
    const sellerBalanceAfter = await seller.getBalance();
    expect(sellerBalanceAfter.sub(sellerBalanceBefore)).to.equal(bidAmount);
  });
  
  it("Should allow bidder to withdraw their outbid amount", async function () {
    // Setup auction
    await provenance.connect(seller).registerBatch("ipfs_hash_for_auction");
    const batchId = 1;
    await provenance.connect(seller).transferOwnership(batchId, auction.address);
    const startingPrice = ethers.utils.parseEther("1");
    await auction.connect(seller).createAuction(batchId, startingPrice, 60 * 60);

    // Bidder1 places a bid
    const bid1Amount = ethers.utils.parseEther("1.5");
    await auction.connect(bidder1).bid(batchId, { value: bid1Amount });

    // Bidder2 outbids bidder1
    const bid2Amount = ethers.utils.parseEther("2");
    await auction.connect(bidder2).bid(batchId, { value: bid2Amount });

    // Bidder1 withdraws their bid
    const bidder1BalanceBefore = await bidder1.getBalance();
    const tx = await auction.connect(bidder1).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed.mul(tx.gasPrice);
    
    const bidder1BalanceAfter = await bidder1.getBalance();

    expect(bidder1BalanceAfter.add(gasUsed).sub(bidder1BalanceBefore)).to.equal(bid1Amount);
  });

  it("Should transfer batch back to seller if no bids are placed", async function () {
    // Setup auction
    await provenance.connect(seller).registerBatch("ipfs_hash_for_auction");
    const batchId = 1;
    await provenance.connect(seller).transferOwnership(batchId, auction.address);
    const startingPrice = ethers.utils.parseEther("1");
    await auction.connect(seller).createAuction(batchId, startingPrice, 1); // 1 second duration

    // Wait for auction to end
    await new Promise(resolve => setTimeout(resolve, 2000));

    // End the auction
    await auction.endAuction(batchId);

    // Check ownership transfer back to seller
    const [, , , custodians, ] = await provenance.getBatch(batchId);
    expect(custodians[custodians.length - 1]).to.equal(seller.address);
  });

});
