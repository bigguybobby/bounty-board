// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BountyBoard — On-chain bounties with submissions, judging, and payouts
contract BountyBoard {
    enum Status { Open, Completed, Cancelled }

    struct Bounty {
        address creator;
        string title;
        uint256 reward;
        uint256 deadline;
        Status status;
        address winner;
        uint256 submissionCount;
    }

    struct Submission {
        address submitter;
        string details;
        uint256 timestamp;
    }

    uint256 public bountyCount;
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => mapping(uint256 => Submission)) public submissions;
    mapping(uint256 => mapping(address => bool)) public hasSubmitted;

    event BountyCreated(uint256 indexed id, address indexed creator, string title, uint256 reward, uint256 deadline);
    event SubmissionAdded(uint256 indexed bountyId, uint256 subId, address indexed submitter);
    event BountyAwarded(uint256 indexed id, address indexed winner, uint256 reward);
    event BountyCancelled(uint256 indexed id);

    function createBounty(string calldata _title, uint256 _deadline) external payable returns (uint256 id) {
        require(msg.value > 0, "zero reward");
        require(bytes(_title).length > 0, "empty title");
        require(_deadline > block.timestamp, "past deadline");

        id = bountyCount++;
        bounties[id] = Bounty(msg.sender, _title, msg.value, _deadline, Status.Open, address(0), 0);
        emit BountyCreated(id, msg.sender, _title, msg.value, _deadline);
    }

    function submit(uint256 _bountyId, string calldata _details) external {
        Bounty storage b = bounties[_bountyId];
        require(b.status == Status.Open, "not open");
        require(block.timestamp < b.deadline, "past deadline");
        require(msg.sender != b.creator, "creator cant submit");
        require(!hasSubmitted[_bountyId][msg.sender], "already submitted");
        require(bytes(_details).length > 0, "empty details");

        uint256 subId = b.submissionCount++;
        submissions[_bountyId][subId] = Submission(msg.sender, _details, block.timestamp);
        hasSubmitted[_bountyId][msg.sender] = true;
        emit SubmissionAdded(_bountyId, subId, msg.sender);
    }

    function award(uint256 _bountyId, uint256 _subId) external {
        Bounty storage b = bounties[_bountyId];
        require(msg.sender == b.creator, "not creator");
        require(b.status == Status.Open, "not open");
        require(_subId < b.submissionCount, "invalid submission");

        Submission storage s = submissions[_bountyId][_subId];
        b.status = Status.Completed;
        b.winner = s.submitter;

        (bool ok,) = s.submitter.call{value: b.reward}("");
        require(ok, "payout failed");
        emit BountyAwarded(_bountyId, s.submitter, b.reward);
    }

    function cancel(uint256 _bountyId) external {
        Bounty storage b = bounties[_bountyId];
        require(msg.sender == b.creator, "not creator");
        require(b.status == Status.Open, "not open");
        require(block.timestamp >= b.deadline, "not expired");

        b.status = Status.Cancelled;
        (bool ok,) = b.creator.call{value: b.reward}("");
        require(ok, "refund failed");
        emit BountyCancelled(_bountyId);
    }

    function getBounty(uint256 _id) external view returns (
        address creator, string memory title, uint256 reward, uint256 deadline, Status status, address winner, uint256 subCount
    ) {
        Bounty storage b = bounties[_id];
        return (b.creator, b.title, b.reward, b.deadline, b.status, b.winner, b.submissionCount);
    }

    function getSubmission(uint256 _bountyId, uint256 _subId) external view returns (address submitter, string memory details, uint256 timestamp) {
        Submission storage s = submissions[_bountyId][_subId];
        return (s.submitter, s.details, s.timestamp);
    }
}
