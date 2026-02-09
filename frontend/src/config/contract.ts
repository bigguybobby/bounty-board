// BountyBoard contract — deployed on Celo Sepolia
// Replace with your deployment address
export const BOUNTY_BOARD_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export const BOUNTY_BOARD_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "_fee", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "bounties",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "reward", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "hunter", type: "address" },
      { name: "description", type: "string" },
      { name: "submission", type: "string" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "bountyCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "cancel",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "create",
    inputs: [
      { name: "_deadline", type: "uint256" },
      { name: "_desc", type: "string" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "feesCollected",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBounty",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "reward", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "hunter", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "platformFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "reject",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submit",
    inputs: [
      { name: "_id", type: "uint256" },
      { name: "_work", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawFees",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "Approved",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "hunter", type: "address", indexed: true },
      { name: "payout", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Cancelled",
    inputs: [{ name: "id", type: "uint256", indexed: true }],
    anonymous: false,
  },
  {
    type: "event",
    name: "Created",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "reward", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Rejected",
    inputs: [{ name: "id", type: "uint256", indexed: true }],
    anonymous: false,
  },
  {
    type: "event",
    name: "Submitted",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "hunter", type: "address", indexed: true },
    ],
    anonymous: false,
  },
] as const;
