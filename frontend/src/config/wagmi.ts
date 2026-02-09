import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { celoAlfajores, optimismSepolia, sepolia } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    chains: [celoAlfajores, optimismSepolia, sepolia],
    transports: {
      [celoAlfajores.id]: http(),
      [optimismSepolia.id]: http(),
      [sepolia.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
    appName: "BountyBoard",
    appDescription: "On-Chain Bug Bounty Platform",
    appUrl: "https://github.com/bigguybobby/bounty-board",
  })
);
