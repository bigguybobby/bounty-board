"use client";
import { useState } from "react";
import { ConnectKitButton } from "connectkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { BOUNTY_BOARD_ADDRESS, BOUNTY_BOARD_ABI } from "@/config/contract";

const STATUS_LABELS = ["Open", "Submitted", "Approved", "Cancelled"];
const STATUS_COLORS = [
  "text-emerald-400",
  "text-yellow-400",
  "text-blue-400",
  "text-gray-500",
];
const STATUS_BG = [
  "bg-emerald-900/20 border-emerald-800",
  "bg-yellow-900/20 border-yellow-800",
  "bg-blue-900/20 border-blue-800",
  "bg-gray-900/20 border-gray-700",
];

type Tab = "browse" | "create" | "submit" | "manage" | "stats";

export default function BountyDashboard() {
  const [tab, setTab] = useState<Tab>("browse");
  const { isConnected } = useAccount();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "browse", label: "Browse", icon: "🎯" },
    { id: "create", label: "Create Bounty", icon: "➕" },
    { id: "submit", label: "Submit Work", icon: "📝" },
    { id: "manage", label: "My Bounties", icon: "⚙️" },
    { id: "stats", label: "Stats", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h1 className="text-xl font-bold">BountyBoard</h1>
              <p className="text-xs text-gray-400">
                On-Chain Bug Bounty Platform
              </p>
            </div>
          </div>
          <ConnectKitButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                tab === t.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {!isConnected && tab !== "browse" && tab !== "stats" && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              Connect your wallet to interact with bounties
            </p>
            <ConnectKitButton />
          </div>
        )}

        {(tab === "browse" || isConnected) && tab === "browse" && (
          <BrowseTab />
        )}
        {isConnected && tab === "create" && <CreateTab />}
        {isConnected && tab === "submit" && <SubmitTab />}
        {isConnected && tab === "manage" && <ManageTab />}
        {(tab === "stats" || isConnected) && tab === "stats" && <StatsTab />}
      </div>
    </div>
  );
}

/* ─── Shared Components ───────────────────────────────────────────── */

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-xl p-6 ${className}`}
    >
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function BountyCard({ id }: { id: number }) {
  const { data } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "bounties",
    args: [BigInt(id)],
  });

  if (!data) return <div className="animate-pulse bg-gray-800 h-32 rounded-xl" />;

  const [creator, reward, deadline, status, hunter, description] =
    data as unknown as [string, bigint, bigint, number, string, string, string];
  const deadlineDate = new Date(Number(deadline) * 1000);
  const isExpired = deadlineDate < new Date();
  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <div className={`border rounded-xl p-5 space-y-3 ${STATUS_BG[status]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
            #{id}
          </span>
          <span className={`text-xs font-bold ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          {isExpired && status === 0 && (
            <span className="text-xs text-red-400">⏰ Expired</span>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {formatEther(reward)} ETH
          </div>
          <div className="text-xs text-gray-500">
            ${(Number(formatEther(reward)) * 2500).toFixed(0)} est.
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-300 line-clamp-3">{description}</p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span title={creator}>
          👤 Creator: <span className="font-mono">{short(creator)}</span>
        </span>
        {hunter !== "0x0000000000000000000000000000000000000000" && (
          <span title={hunter}>
            🔍 Hunter: <span className="font-mono">{short(hunter)}</span>
          </span>
        )}
        <span>⏰ {deadlineDate.toLocaleDateString()}</span>
      </div>
    </div>
  );
}

/* ─── Browse Tab ──────────────────────────────────────────────────── */

function BrowseTab() {
  const { data: bountyCount } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "bountyCount",
  });
  const [filter, setFilter] = useState<"all" | "open" | "submitted" | "done">(
    "all"
  );

  const count = Number(bountyCount || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {count} {count === 1 ? "Bounty" : "Bounties"} Posted
        </h2>
        <div className="flex gap-2">
          {(["all", "open", "submitted", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filter === f
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {count === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-gray-500 text-lg">
            No bounties yet. Be the first to post one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: count }, (_, i) => count - 1 - i).map(
            (id) => (
              <FilteredBountyCard key={id} id={id} filter={filter} />
            )
          )}
        </div>
      )}
    </div>
  );
}

function FilteredBountyCard({
  id,
  filter,
}: {
  id: number;
  filter: "all" | "open" | "submitted" | "done";
}) {
  const { data } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "bounties",
    args: [BigInt(id)],
  });

  if (!data) return <div className="animate-pulse bg-gray-800 h-32 rounded-xl" />;

  const status = (data as unknown as [string, bigint, bigint, number])[3];

  if (filter === "open" && status !== 0) return null;
  if (filter === "submitted" && status !== 1) return null;
  if (filter === "done" && status !== 2 && status !== 3) return null;

  return <BountyCard id={id} />;
}

/* ─── Create Tab ──────────────────────────────────────────────────── */

function CreateTab() {
  const [desc, setDesc] = useState("");
  const [reward, setReward] = useState("");
  const [days, setDays] = useState("7");

  const {
    writeContract,
    data: txHash,
    isPending,
  } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const deadline = Math.floor(Date.now() / 1000) + parseInt(days || "7") * 86400;

  const handleCreate = () => {
    if (!desc || !reward || parseFloat(reward) <= 0) return;
    writeContract({
      address: BOUNTY_BOARD_ADDRESS,
      abi: BOUNTY_BOARD_ABI,
      functionName: "create",
      args: [BigInt(deadline), desc],
      value: parseEther(reward),
    });
  };

  return (
    <Card title="Post a New Bounty">
      <div className="space-y-5 max-w-lg">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Bounty Description
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe the vulnerability to find, the feature to build, or the task to complete..."
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Reward (ETH)
            </label>
            <input
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              type="number"
              step="0.001"
              min="0"
              placeholder="0.1"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-mono focus:border-emerald-500 outline-none"
            />
            {reward && parseFloat(reward) > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ ${(parseFloat(reward) * 2500).toFixed(0)} at $2,500/ETH
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Deadline (days from now)
            </label>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 outline-none"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Expires:{" "}
              {new Date(deadline * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-xs text-gray-400 space-y-1">
          <p>
            💡 Your ETH will be held in escrow by the smart contract until you
            approve a submission or cancel the bounty.
          </p>
          <p>
            📋 A small platform fee is deducted from the reward on approval.
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={isPending || confirming || !desc || !reward}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition text-base"
        >
          {isPending
            ? "⏳ Signing…"
            : confirming
            ? "⛓️ Confirming…"
            : `Post Bounty (${reward || "0"} ETH)`}
        </button>

        {isSuccess && (
          <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-4 text-sm text-emerald-400">
            ✅ Bounty posted successfully!{" "}
            <a
              href={`https://sepolia.celoscan.io/tx/${txHash}`}
              target="_blank"
              className="underline"
            >
              View transaction
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ─── Submit Tab ──────────────────────────────────────────────────── */

function SubmitTab() {
  const [bountyId, setBountyId] = useState("");
  const [work, setWork] = useState("");

  const {
    writeContract,
    data: txHash,
    isPending,
  } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Preview the bounty being submitted to
  const { data: bountyData } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "bounties",
    args: bountyId ? [BigInt(bountyId)] : undefined,
  });

  const bounty = bountyData as
    | unknown
    | [string, bigint, bigint, number, string, string, string]
    | undefined;
  const b = bounty as [string, bigint, bigint, number, string, string, string] | undefined;

  const handleSubmit = () => {
    if (!bountyId || !work) return;
    writeContract({
      address: BOUNTY_BOARD_ADDRESS,
      abi: BOUNTY_BOARD_ABI,
      functionName: "submit",
      args: [BigInt(bountyId), work],
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Submit Work for a Bounty">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Bounty ID
            </label>
            <input
              value={bountyId}
              onChange={(e) => setBountyId(e.target.value)}
              type="number"
              min="0"
              placeholder="0"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-mono focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Your Submission
            </label>
            <textarea
              value={work}
              onChange={(e) => setWork(e.target.value)}
              placeholder="Describe the vulnerability found, include proof-of-concept, steps to reproduce, impact analysis, and recommended fix..."
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {work.length} chars •{" "}
              {work.length > 0
                ? "Tip: include severity, impact, and PoC"
                : ""}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending || confirming || !bountyId || !work}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition"
          >
            {isPending
              ? "⏳ Signing…"
              : confirming
              ? "⛓️ Confirming…"
              : "Submit Finding"}
          </button>

          {isSuccess && (
            <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 text-sm text-yellow-400">
              ✅ Submission sent!{" "}
              <a
                href={`https://sepolia.celoscan.io/tx/${txHash}`}
                target="_blank"
                className="underline"
              >
                View transaction
              </a>
            </div>
          )}
        </div>
      </Card>

      {b && b[1] > 0n && (
        <Card title="Bounty Preview">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">
                #{bountyId}
              </span>
              <span
                className={`text-xs font-bold ${STATUS_COLORS[b[3]]}`}
              >
                {STATUS_LABELS[b[3]]}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Reward</p>
              <p className="text-2xl font-bold text-white">
                {formatEther(b[1])} ETH
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Description</p>
              <p className="text-sm text-gray-300 mt-1">{b[5]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="text-sm text-gray-300">
                {new Date(Number(b[2]) * 1000).toLocaleString()}
              </p>
            </div>
            {b[3] !== 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-xs text-red-400">
                ⚠️ This bounty is not currently open for submissions
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─── Manage Tab ──────────────────────────────────────────────────── */

function ManageTab() {
  const { address } = useAccount();
  const [actionId, setActionId] = useState("");

  const {
    writeContract: approveSubmission,
    data: approveTx,
    isPending: approving,
  } = useWriteContract();
  const {
    writeContract: rejectSubmission,
    data: rejectTx,
    isPending: rejecting,
  } = useWriteContract();
  const {
    writeContract: cancelBounty,
    data: cancelTx,
    isPending: cancelling,
  } = useWriteContract();

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTx,
  });
  const { isSuccess: rejectSuccess } = useWaitForTransactionReceipt({
    hash: rejectTx,
  });
  const { isSuccess: cancelSuccess } = useWaitForTransactionReceipt({
    hash: cancelTx,
  });

  // Preview bounty for action
  const { data: bountyData } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "bounties",
    args: actionId ? [BigInt(actionId)] : undefined,
  });
  const b = bountyData as
    | [string, bigint, bigint, number, string, string, string]
    | undefined;

  const isCreator =
    b && address && b[0].toLowerCase() === address.toLowerCase();

  return (
    <div className="space-y-6">
      <Card title="Manage Your Bounties">
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Bounty ID
            </label>
            <input
              value={actionId}
              onChange={(e) => setActionId(e.target.value)}
              type="number"
              min="0"
              placeholder="Enter bounty ID..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-mono focus:border-emerald-500 outline-none"
            />
          </div>

          {b && b[1] > 0n && (
            <div className="space-y-4">
              <div
                className={`border rounded-xl p-4 space-y-3 ${
                  STATUS_BG[b[3]]
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${STATUS_COLORS[b[3]]}`}>
                    {STATUS_LABELS[b[3]]}
                  </span>
                  <span className="text-lg font-bold">
                    {formatEther(b[1])} ETH
                  </span>
                </div>
                <p className="text-sm text-gray-300">{b[5]}</p>
                {b[6] && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">
                      📝 Submission:
                    </p>
                    <p className="text-sm text-gray-300">{b[6]}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Hunter:{" "}
                      <span className="font-mono">
                        {b[4].slice(0, 6)}…{b[4].slice(-4)}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {!isCreator && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-xs text-red-400">
                  ⚠️ You are not the creator of this bounty
                </div>
              )}

              {isCreator && (
                <div className="flex gap-3">
                  {b[3] === 1 && (
                    <>
                      <button
                        onClick={() =>
                          approveSubmission({
                            address: BOUNTY_BOARD_ADDRESS,
                            abi: BOUNTY_BOARD_ABI,
                            functionName: "approve",
                            args: [BigInt(actionId)],
                          })
                        }
                        disabled={approving}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
                      >
                        {approving ? "…" : "✅ Approve & Pay"}
                      </button>
                      <button
                        onClick={() =>
                          rejectSubmission({
                            address: BOUNTY_BOARD_ADDRESS,
                            abi: BOUNTY_BOARD_ABI,
                            functionName: "reject",
                            args: [BigInt(actionId)],
                          })
                        }
                        disabled={rejecting}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
                      >
                        {rejecting ? "…" : "❌ Reject & Reopen"}
                      </button>
                    </>
                  )}
                  {b[3] === 0 && (
                    <button
                      onClick={() =>
                        cancelBounty({
                          address: BOUNTY_BOARD_ADDRESS,
                          abi: BOUNTY_BOARD_ABI,
                          functionName: "cancel",
                          args: [BigInt(actionId)],
                        })
                      }
                      disabled={cancelling}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
                    >
                      {cancelling ? "…" : "🚫 Cancel & Refund"}
                    </button>
                  )}
                </div>
              )}

              {approveSuccess && (
                <p className="text-sm text-emerald-400">
                  ✅ Submission approved! Payment sent to hunter.
                </p>
              )}
              {rejectSuccess && (
                <p className="text-sm text-yellow-400">
                  ↩️ Submission rejected. Bounty reopened.
                </p>
              )}
              {cancelSuccess && (
                <p className="text-sm text-gray-400">
                  🚫 Bounty cancelled. ETH refunded.
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ─── Stats Tab ───────────────────────────────────────────────────── */

function StatsTab() {
  const { data: bountyCount } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "bountyCount",
  });
  const { data: platformFee } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "platformFee",
  });
  const { data: feesCollected } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "feesCollected",
  });
  const { data: owner } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "owner",
  });

  const short = (a: string | undefined) =>
    a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Bounties">
          <Stat
            label="Posted"
            value={bountyCount?.toString() || "0"}
          />
        </Card>
        <Card title="Platform Fee">
          <Stat
            label="Per Approval"
            value={`${Number(platformFee || 0) / 100}%`}
            sub={`${platformFee?.toString() || "0"} bps`}
          />
        </Card>
        <Card title="Fees Collected">
          <Stat
            label="Total Revenue"
            value={
              feesCollected ? `${formatEther(feesCollected as bigint)} ETH` : "0"
            }
          />
        </Card>
        <Card title="Owner">
          <Stat label="Platform Admin" value={short(owner as string)} />
        </Card>
      </div>

      <Card title="About BountyBoard">
        <div className="prose prose-invert prose-sm max-w-none text-gray-400">
          <p>
            BountyBoard is a fully on-chain bug bounty platform. Projects post
            bounties with ETH rewards, security researchers submit findings, and
            payment happens trustlessly through smart contracts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-emerald-400 font-medium text-sm mb-2">
                For Projects
              </h4>
              <ul className="text-xs space-y-1">
                <li>• Post bounties with ETH escrow</li>
                <li>• Review submissions before paying</li>
                <li>• Reject & reopen for better submissions</li>
                <li>• Cancel & get full refund</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium text-sm mb-2">
                For Hunters
              </h4>
              <ul className="text-xs space-y-1">
                <li>• Browse open bounties</li>
                <li>• Submit security findings</li>
                <li>• Get paid instantly on approval</li>
                <li>• Non-custodial — no trust needed</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium text-sm mb-2">
                Contract Details
              </h4>
              <ul className="text-xs space-y-1">
                <li>• Solidity 0.8.20 + Foundry</li>
                <li>• 21/21 tests, 100% coverage</li>
                <li>• Slither clean</li>
                <li>• MIT License</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
