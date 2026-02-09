import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl text-center space-y-8">
        <div className="text-7xl">🎯</div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          BountyBoard
        </h1>
        <p className="text-xl text-gray-400 max-w-lg mx-auto">
          On-chain bug bounty platform. Post bounties with ETH, submit findings,
          get paid — all trustlessly via smart contracts.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            {
              icon: "💰",
              label: "ETH Rewards",
              desc: "Escrow-backed bounties",
            },
            {
              icon: "🔍",
              label: "Submit Findings",
              desc: "Hunters submit work",
            },
            {
              icon: "✅",
              label: "Approve & Pay",
              desc: "Instant settlement",
            },
            {
              icon: "⚖️",
              label: "Fair Process",
              desc: "Reject & reopen flow",
            },
            {
              icon: "⏰",
              label: "Deadlines",
              desc: "Auto-enforced expiry",
            },
            {
              icon: "🔐",
              label: "Non-Custodial",
              desc: "ETH stays in contract",
            },
            {
              icon: "💸",
              label: "Low Fees",
              desc: "Configurable platform fee",
            },
            {
              icon: "🔗",
              label: "Multi-Chain",
              desc: "Deploy on any EVM",
            },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-800 transition"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-medium text-white">{f.label}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/bounty"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3 rounded-xl transition text-lg"
          >
            🎯 Browse Bounties
          </Link>
          <a
            href="https://github.com/bigguybobby/bounty-board"
            target="_blank"
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-8 py-3 rounded-xl transition text-lg"
          >
            GitHub
          </a>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-left max-w-lg mx-auto">
          <h3 className="text-sm font-semibold text-emerald-400 mb-3">
            How It Works
          </h3>
          <ol className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">1.</span>
              <span>
                <strong className="text-white">Post a bounty</strong> — deposit
                ETH reward + set deadline
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">2.</span>
              <span>
                <strong className="text-white">Hunters submit work</strong> —
                security findings or bug reports
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">3.</span>
              <span>
                <strong className="text-white">Review & approve</strong> — ETH
                released instantly to hunter
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">4.</span>
              <span>
                <strong className="text-white">Or reject & reopen</strong> —
                bounty stays open for new submissions
              </span>
            </li>
          </ol>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>21/21 Tests Passing • 100% Coverage • Slither Clean</p>
          <p>Solidity 0.8.20 + Foundry + Next.js + wagmi + ConnectKit</p>
        </div>
      </div>
    </div>
  );
}
