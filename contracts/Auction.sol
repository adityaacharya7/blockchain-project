// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProvenance {
    function transferOwnership(uint _id, address _to) external;
    function getBatch(uint _id) external view returns (uint, address, string memory, address[] memory, uint[] memory);
}

contract Auction {
    IProvenance public provenance;

    struct AuctionItem {
        uint batchId;
        address payable seller;
        uint startingPrice;
        uint endTime;
        address highestBidder;
        uint highestBid;
        bool started;
        bool ended;
    }

    mapping(uint => AuctionItem) public auctions;
    mapping(address => uint) public pendingReturns;

    event AuctionCreated(uint indexed batchId, address indexed seller, uint startingPrice, uint endTime);
    event BidPlaced(uint indexed batchId, address indexed bidder, uint amount);
    event AuctionEnded(uint indexed batchId, address winner, uint amount);

    constructor(address _provenanceAddress) {
        provenance = IProvenance(_provenanceAddress);
    }

    function createAuction(uint _batchId, uint _startingPrice, uint _duration) public {
        // Check that this contract is the owner of the batch
        (, , , address[] memory custodians, ) = provenance.getBatch(_batchId);
        require(custodians[custodians.length - 1] == address(this), "Contract is not the owner of the batch");

        auctions[_batchId] = AuctionItem({
            batchId: _batchId,
            seller: payable(msg.sender),
            startingPrice: _startingPrice,
            endTime: block.timestamp + _duration,
            highestBidder: address(0),
            highestBid: _startingPrice,
            started: true,
            ended: false
        });

        emit AuctionCreated(_batchId, msg.sender, _startingPrice, block.timestamp + _duration);
    }

    function bid(uint _batchId) public payable {
        AuctionItem storage auction = auctions[_batchId];
        require(auction.started, "Auction not started");
        require(!auction.ended, "Auction already ended");
        require(block.timestamp < auction.endTime, "Auction already ended");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest bid");

        if (auction.highestBidder != address(0)) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        emit BidPlaced(_batchId, msg.sender, msg.value);
    }

    function endAuction(uint _batchId) public {
        AuctionItem storage auction = auctions[_batchId];
        require(auction.started, "Auction not started");
        require(!auction.ended, "Auction already ended");
        require(block.timestamp >= auction.endTime, "Auction has not ended yet");

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            // Transfer ownership of the batch to the highest bidder
            provenance.transferOwnership(_batchId, auction.highestBidder);

            // Send the highest bid to the seller
            // auction.seller.transfer(auction.highestBid);

            // Fetch the farmer's address from the Provenance contract and send them the bid
            (, address farmer, , , ) = provenance.getBatch(_batchId);
            payable(farmer).transfer(auction.highestBid);

            emit AuctionEnded(_batchId, auction.highestBidder, auction.highestBid);
        } else {
            // If no one bid, transfer ownership back to the seller
            provenance.transferOwnership(_batchId, auction.seller);
            emit AuctionEnded(_batchId, address(0), 0);
        }
    }

    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }
}
