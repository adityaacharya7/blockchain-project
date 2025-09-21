// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Provenance {
    struct Batch {
        uint id;
        address farmer;
        string ipfsHash;
        address[] custodians;
        uint[] timestamps;
    }

    mapping(uint => Batch) public batches;
    uint public batchCount;

    event BatchRegistered(uint indexed id, address indexed farmer);
    event OwnershipTransferred(uint indexed id, address indexed from, address indexed to);

    function registerBatch(string memory _ipfsHash) public {
        batchCount++;
        Batch storage newBatch = batches[batchCount];
        newBatch.id = batchCount;
        newBatch.farmer = msg.sender;
        newBatch.ipfsHash = _ipfsHash;
        newBatch.custodians.push(msg.sender);
        newBatch.timestamps.push(block.timestamp);

        emit BatchRegistered(batchCount, msg.sender);
    }

    function transferOwnership(uint _id, address _to) public {
        require(_id > 0 && _id <= batchCount, "Batch does not exist");
        require(batches[_id].custodians[batches[_id].custodians.length - 1] == msg.sender, "Only the current owner can transfer ownership");

        batches[_id].custodians.push(_to);
        batches[_id].timestamps.push(block.timestamp);

        emit OwnershipTransferred(_id, msg.sender, _to);
    }

    function getBatch(uint _id) public view returns (uint, address, string memory, address[] memory, uint[] memory) {
        require(_id > 0 && _id <= batchCount, "Batch does not exist");
        Batch storage batch = batches[_id];
        return (batch.id, batch.farmer, batch.ipfsHash, batch.custodians, batch.timestamps);
    }
}
