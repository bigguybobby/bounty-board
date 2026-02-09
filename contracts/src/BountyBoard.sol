// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BountyBoard — Post bounties, submit work, approve & pay
contract BountyBoard {
    enum Status { Open, Submitted, Approved, Cancelled }

    struct Bounty {
        address creator;
        uint256 reward;
        uint256 deadline;
        Status status;
        address hunter;
        string description;
        string submission;
    }

    uint256 public bountyCount;
    mapping(uint256 => Bounty) public bounties;
    uint256 public platformFee; // bps
    address public owner;
    uint256 public feesCollected;

    event Created(uint256 indexed id, address indexed creator, uint256 reward);
    event Submitted(uint256 indexed id, address indexed hunter);
    event Approved(uint256 indexed id, address indexed hunter, uint256 payout);
    event Rejected(uint256 indexed id);
    event Cancelled(uint256 indexed id);

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    constructor(uint256 _fee) {
        require(_fee <= 500, "fee too high");
        owner = msg.sender;
        platformFee = _fee;
    }

    function create(uint256 _deadline, string calldata _desc) external payable returns (uint256 id) {
        require(msg.value > 0, "no reward");
        require(_deadline > block.timestamp, "past deadline");
        require(bytes(_desc).length > 0, "empty desc");

        id = bountyCount++;
        bounties[id] = Bounty(msg.sender, msg.value, _deadline, Status.Open, address(0), _desc, "");
        emit Created(id, msg.sender, msg.value);
    }

    function submit(uint256 _id, string calldata _work) external {
        Bounty storage b = bounties[_id];
        require(b.status == Status.Open, "not open");
        require(block.timestamp <= b.deadline, "expired");
        require(msg.sender != b.creator, "creator cant submit");
        require(bytes(_work).length > 0, "empty work");

        b.hunter = msg.sender;
        b.submission = _work;
        b.status = Status.Submitted;
        emit Submitted(_id, msg.sender);
    }

    function approve(uint256 _id) external {
        Bounty storage b = bounties[_id];
        require(msg.sender == b.creator, "not creator");
        require(b.status == Status.Submitted, "not submitted");

        b.status = Status.Approved;
        uint256 fee = (b.reward * platformFee) / 10000;
        uint256 payout = b.reward - fee;
        feesCollected += fee;

        (bool ok,) = b.hunter.call{value: payout}("");
        require(ok, "payout failed");
        emit Approved(_id, b.hunter, payout);
    }

    function reject(uint256 _id) external {
        Bounty storage b = bounties[_id];
        require(msg.sender == b.creator, "not creator");
        require(b.status == Status.Submitted, "not submitted");
        b.status = Status.Open;
        b.hunter = address(0);
        b.submission = "";
        emit Rejected(_id);
    }

    function cancel(uint256 _id) external {
        Bounty storage b = bounties[_id];
        require(msg.sender == b.creator, "not creator");
        require(b.status == Status.Open, "not open");
        b.status = Status.Cancelled;
        (bool ok,) = b.creator.call{value: b.reward}("");
        require(ok, "refund failed");
        emit Cancelled(_id);
    }

    function withdrawFees() external onlyOwner {
        uint256 f = feesCollected;
        require(f > 0, "no fees");
        feesCollected = 0;
        (bool ok,) = owner.call{value: f}("");
        require(ok, "withdraw failed");
    }

    function getBounty(uint256 _id) external view returns (address creator, uint256 reward, uint256 deadline, Status status, address hunter) {
        Bounty storage b = bounties[_id];
        return (b.creator, b.reward, b.deadline, b.status, b.hunter);
    }
}
