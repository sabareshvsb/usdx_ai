export interface KnowledgeSource {
  id: string;
  title: string;
  category: string;
  updated: string;
}

export interface KnowledgeCategory {
  id: string;
  title: string;
  description: string;
  icon:
    | "overview"
    | "staking"
    | "compounding"
    | "affiliate"
    | "ranks"
    | "swap"
    | "wallet"
    | "faq"
    | "docs"
    | "updates";
  docCount: number;
  anchor: string;
}

export const knowledgeCategories: KnowledgeCategory[] = [
  { id: "overview", title: "USDX Overview", description: "A high-level guide to the USDX ecosystem, its stablecoin and the value it delivers.", icon: "overview", docCount: 4, anchor: "overview" },
  { id: "staking", title: "Staking", description: "Understand how to stake USDX, requirements and expected returns.", icon: "staking", docCount: 6, anchor: "staking" },
  { id: "compounding", title: "Compounding", description: "How rewards auto-compound over time and how the multiplier grows.", icon: "compounding", docCount: 5, anchor: "compounding" },
  { id: "affiliate", title: "Affiliate System", description: "How referrals work, commission structure and ranking benefits.", icon: "affiliate", docCount: 3, anchor: "affiliate" },
  { id: "ranks", title: "Ranks", description: "The tiered rank system and what it takes to advance between levels.", icon: "ranks", docCount: 4, anchor: "ranks" },
  { id: "swap", title: "Swap Rules", description: "Rules and mechanics of the USDX to DAI swap and supported pairs.", icon: "swap", docCount: 4, anchor: "swap" },
  { id: "wallet", title: "Wallet Information", description: "Supported wallets, setup and security best practices for USDX.", icon: "wallet", docCount: 5, anchor: "wallet" },
  { id: "faq", title: "Frequently Asked Questions", description: "Quick answers to the most common questions about USDX.", icon: "faq", docCount: 12, anchor: "faq" },
  { id: "docs", title: "Documentation", description: "Full official documentation covering every aspect of the ecosystem.", icon: "docs", docCount: 18, anchor: "docs" },
  { id: "updates", title: "Project Updates", description: "Latest announcements, releases and roadmap milestones for USDX.", icon: "updates", docCount: 8, anchor: "updates" },
];

interface RawKnowledgeEntry {
  id: string;
  keywords: string[];
  category: string;
  sources: string[];
  text: string;
}

const knowledgeBase: RawKnowledgeEntry[] = [
  // ─── EXISTING ENTRIES ───────────────────────────────────────────────
  {
    id: "overview",
    keywords: ["overview", "usdx", "what is", "ecosystem", "introduction"],
    category: "USDX Overview",
    sources: ["USDX Documentation", "USDX Knowledge Base"],
    text: "## USDX Overview\n\nUSDX is a stable, yield-bearing digital asset designed for long-term stability and predictable returns. The ecosystem centres on a native stablecoin pegged to the US Dollar, combined with staking, compounding, swaps, an affiliate program and a tiered rank system.\n\nThe system is structured around holding and staking USDX over time, with rewards reinforced through an auto-compounding mechanism and a rank ladder that unlocks progressively higher returns."
  },
  {
    id: "staking",
    keywords: ["staking", "stake", "how to stake", "returns", "apy", "earn", "requirements"],
    category: "Staking",
    sources: ["USDX Documentation", "USDX Knowledge Base"],
    text: "## USDX Staking\n\nStaking lets you lock up USDX to earn yield. To begin, connect a supported wallet, acquire USDX, and deposit it into the staking pool.\n\n### Key points\n- Minimum holding period applies before rewards mature\n- Rewards accrue based on your staked balance and current rank\n- Higher ranks earn higher effective yields\n- You can monitor earned rewards in the dashboard\n\n**Note:** Specific rates, minimums and lock-up terms are defined in the current official USDX rules and may change. Always confirm against the live project rules before acting."
  },
  {
    id: "compounding",
    keywords: ["compounding", "compound", "auto", "multiplier", "grow"],
    category: "Compounding",
    sources: ["USDX Documentation", "USDX Knowledge Base"],
    text: "## USDX Compounding\n\nCompounding automatically reinvests earned rewards back into your staked balance, allowing your position to grow exponentially over time.\n\n### How it works\n- Rewards are calculated on your staked amount\n- Earned rewards are re-added to the principal automatically\n- The compounding schedule determines how frequently yields accrue\n- Longer staking horizons benefit most from the compounding effect\n\nCompounding is the primary driver of long-term growth in the USDX system."
  },
  {
    id: "swap",
    keywords: ["swap", "dai", "swap rules", "convert", "exchange"],
    category: "Swap Rules",
    sources: ["USDX Documentation", "Project Rules"],
    text: "## USDX to DAI Swap\n\nThe USDX → DAI swap allows you to convert your USDX holdings into DAI. Swaps follow a defined set of rules.\n\n### Swap rules\n- Swaps may be subject to a minimum amount and a maximum per transaction\n- A fee may apply depending on the direction and prevailing pool conditions\n- Completed swaps settle on-chain and cannot be reversed\n- Supported pairs currently include USDX → DAI\n\n**Important:** Rates and liquidity are dynamic. Always review the official swap rules for the current terms before converting."
  },
  {
    id: "ranks",
    keywords: ["ranks", "rank", "tiers", "level", "advance", "ladder"],
    category: "Ranks",
    sources: ["USDX Documentation", "Project Rules"],
    text: "## USDX Ranks\n\nUSDX features a tiered rank system. As you stake more and grow your network, you progress through ranks that unlock higher yields and additional benefits.\n\n### How ranks work\n- Your rank is determined by your cumulative staked volume and qualifying activity\n- Advancing requires meeting defined thresholds\n- Higher ranks increase reward multipliers\n- Ranks are automatically applied once thresholds are satisfied\n\n**Note:** Exact rank names and thresholds come from the official USDX rules and are not interpreted by this assistant."
  },
  {
    id: "affiliate",
    keywords: ["affiliate", "referral", "commission", "refer", "invite"],
    category: "Affiliate System",
    sources: ["USDX Documentation", "USDX Knowledge Base"],
    text: "## USDX Affiliate System\n\nThe USDX affiliate program rewards you for referring new participants to the ecosystem.\n\n### How it works\n- Share your referral link with others\n- Earn commission on qualifying activity of your referrals\n- Building a larger network can help you advance through the rank ladder\n- Referral earnings are credited to your dashboard\n\nCommission rates and eligibility follow the official affiliate rules."
  },
  {
    id: "wallet",
    keywords: ["wallet", "connect", "supported", "security"],
    category: "Wallet Information",
    sources: ["USDX Documentation", "USDX Knowledge Base"],
    text: "## Wallet Information\n\nUSDX supports standard Web3 wallets for holding and staking your assets.\n\n### Setup\n- Use a self-custody wallet that supports the relevant network\n- Connect it to the USDX dashboard to begin\n- Keep your seed phrase private and never share it\n\n### Security\n- Enable two-factor authentication where available\n- Use hardware wallets for larger holdings\n- Verify contract addresses before approving transactions\n\nSupported wallets are listed in the official documentation."
  },
  {
    id: "rules",
    keywords: ["rules", "project rules", "terms", "conditions"],
    category: "Project Rules",
    sources: ["Project Rules", "USDX Documentation"],
    text: "## USDX Project Rules\n\nAll activity within the USDX ecosystem is governed by the official project rules.\n\nThese rules define rates, minimums, lock-up periods, rank thresholds, swap terms and affiliate conditions.\n\n**The official rules are the source of truth for every number on this platform.** This assistant does not invent or interpret these parameters; it reports what is documented. Always refer to the live Project Rules for the current set of values."
  },
  {
    id: "getting-started",
    keywords: ["get started", "beginner", "minimum"],
    category: "USDX Overview",
    sources: ["USDX Knowledge Base"],
    text: "## Getting Started with USDX\n\nTo begin participating in the USDX ecosystem you connect a supported wallet and acquire USDX.\n\n- Eligibility and minimum entry amounts follow the official rules\n- New participants typically begin at the base rank\n- The dashboard guides you through staking, compounding and swaps step by step\n\nRefer to the FAQ and Documentation for the precise onboarding requirements."
  },
  {
    id: "dai",
    keywords: ["dai", "what is dai", "stablecoin"],
    category: "USDX Overview",
    sources: ["USDX Documentation"],
    text: "## USDX and DAI\n\nUSDX is the ecosystem's native yield-bearing asset, while DAI is a widely used decentralised stablecoin. The USDX → DAI swap provides liquidity between the two.\n\nUSDX aims for stability while offering yield, and DAI serves as an exit and liquidity pair within the ecosystem."
  },

  // ─── USDX-SMART Q&A: BASIC INTRODUCTION (1–20) ──────────────────────
  {
    id: "usdx-intro-1",
    keywords: ["what is usdx smart", "usdx smart", "usdxsmart", "usdx-smart project"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## What is USDX-SMART?\n\nUSDX-SMART is a decentralized digital-asset project designed around a USDX token that aims to maintain a value linked to DAI and $1."
  },
  {
    id: "usdx-intro-2",
    keywords: ["main idea", "main idea of usdx", "purpose of usdx smart", "goal"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## Main Idea of USDX-SMART\n\nThe main idea is to create a decentralized ecosystem where users can participate in staking, earning, and community-based token minting."
  },
  {
    id: "usdx-intro-3",
    keywords: ["what does usdx stand", "usdx stands for", "usdx meaning"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## USDX Name\n\nUSDX is the name of the project's digital token."
  },
  {
    id: "usdx-intro-4",
    keywords: ["centralized or decentralized", "is usdx decentralized", "decentralized"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Decentralization\n\nThe project describes USDX-SMART as decentralized."
  },
  {
    id: "usdx-intro-5",
    keywords: ["what is decentralization", "decentralized mean", "simple decentralization"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## What is Decentralization?\n\nIt means the system is designed so that one single organization or authority does not control everything."
  },
  {
    id: "usdx-intro-6",
    keywords: ["which blockchain", "blockchain usdx", "base chain", "chain"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Blockchain\n\nIt is built on the Base blockchain."
  },
  {
    id: "usdx-intro-7",
    keywords: ["what is base", "base blockchain", "base layer"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## What is Base?\n\nBase is an Ethereum Layer-2 blockchain designed to provide faster and lower-cost transactions."
  },
  {
    id: "usdx-intro-8",
    keywords: ["why base", "why use base", "reason base"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Base?\n\nAccording to the project document, Base is used for efficiency, speed, lower transaction costs, and scalability."
  },
  {
    id: "usdx-intro-9",
    keywords: ["target value", "target price", "usdx value"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Target Value of USDX\n\nThe project aims to keep USDX around the value of $1 DAI."
  },
  {
    id: "usdx-intro-10",
    keywords: ["pegged to dai", "peg dai", "dai peg"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Pegged to DAI\n\nIt means the project is designed to keep USDX's value linked to the value of DAI."
  },
  {
    id: "usdx-intro-11",
    keywords: ["what is dai", "dai explained", "dai cryptocurrency"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## What is DAI?\n\nDAI is a cryptocurrency designed to maintain a value close to one US dollar."
  },
  {
    id: "usdx-intro-12",
    keywords: ["dai important", "why dai", "dai usdx relation"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## DAI Importance\n\nDAI is used as the reference asset for the USDX peg."
  },
  {
    id: "usdx-intro-13",
    keywords: ["what is stablecoin", "stablecoin", "stable coin"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## What is a Stablecoin?\n\nA stablecoin is a cryptocurrency designed to maintain a relatively stable value, usually against something like the US dollar."
  },
  {
    id: "usdx-intro-14",
    keywords: ["is usdx stablecoin", "stablecoin usdx"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## USDX as Stablecoin\n\nYes. The project document describes USDX as a decentralized stablecoin."
  },
  {
    id: "usdx-intro-15",
    keywords: ["what makes different", "usdx different", "unique feature"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## What Makes USDX Different?\n\nOne major difference claimed by the project is that USDX is a non-buyable, community-minted token."
  },
  {
    id: "usdx-intro-16",
    keywords: ["non-buyable token", "non buyable", "cannot buy usdx"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Non-Buyable Token\n\nAccording to the project's model, users cannot simply purchase USDX directly like a normal token; USDX is generated through the project's ecosystem mechanisms."
  },
  {
    id: "usdx-intro-17",
    keywords: ["community minted", "community minting", "how minted"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Community-Minted\n\nIt means the project describes USDX as being created through participation by the community rather than simply being sold by a central organization."
  },
  {
    id: "usdx-intro-18",
    keywords: ["proof of stake", "pos", "community minting pos"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Proof of Stake\n\nThe project refers to its model as community minting Proof of Stake, connecting token generation with staking participation."
  },
  {
    id: "usdx-intro-19",
    keywords: ["purpose decentralization", "why decentralization", "centralization purpose"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Purpose of Decentralization\n\nThe project says decentralization is intended to reduce dependence on a single authority and provide transparency and resistance to censorship."
  },
  {
    id: "usdx-intro-20",
    keywords: ["official website", "usdx live", "website"],
    category: "Basic Introduction",
    sources: ["USDX-SMART Documentation"],
    text: "## Official Website\n\nThe official website mentioned in the project document is usdx.live."
  },

  // ─── USDX-SMART Q&A: PROBLEM AND SOLUTION (21–40) ──────────────────
  {
    id: "usdx-problem-21",
    keywords: ["what problem", "problem usdx", "centralization problem", "risk centralization"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## Problem USDX-SMART Addresses\n\nThe project identifies centralization as a problem, including risks such as censorship, freezing, and lack of transparency."
  },
  {
    id: "usdx-problem-22",
    keywords: ["censorship", "financial censorship", "what is censorship finance"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Censorship in Finance\n\nIt means someone with control over the system can potentially prevent or restrict certain transactions or activities."
  },
  {
    id: "usdx-problem-23",
    keywords: ["freezing assets", "freeze assets", "asset freezing"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Freezing Assets\n\nIt means preventing someone from moving or using their assets."
  },
  {
    id: "usdx-problem-24",
    keywords: ["transparency crypto", "why transparency", "transparency importance"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Transparency in Cryptocurrency\n\nTransparency allows users to inspect transactions and understand how a system operates."
  },
  {
    id: "usdx-problem-25",
    keywords: ["on-chain transaction", "on chain", "on chain transaction"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## On-Chain Transaction\n\nIt is a transaction recorded directly on a blockchain."
  },
  {
    id: "usdx-problem-26",
    keywords: ["on-chain meaning", "onchain meaning"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## What is On-Chain?\n\nIt means information is recorded on the blockchain and can generally be checked using blockchain tools."
  },
  {
    id: "usdx-problem-27",
    keywords: ["no single point failure", "single point", "failure point"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## No Single Point of Failure\n\nIt means the system is designed so that one component or authority failing does not necessarily bring down the entire system."
  },
  {
    id: "usdx-problem-28",
    keywords: ["censorship resistance", "resistant censorship"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Censorship Resistance\n\nIt means designing a system so that transactions are difficult for a single authority to block."
  },
  {
    id: "usdx-problem-29",
    keywords: ["non-custodial", "custodial", "self custody"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Non-Custodial\n\nIt means users can retain control of their own crypto assets rather than handing custody to a central company."
  },
  {
    id: "usdx-problem-30",
    keywords: ["distributed ledger", "governance", "distributed ledger governance"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Distributed Ledger Governance\n\nIt refers to using a distributed blockchain system to record and manage information rather than relying on one centralized database."
  },
  {
    id: "usdx-problem-31",
    keywords: ["why decentralized usdx", "usdx decentralized reason"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Decentralized?\n\nThe project describes its ecosystem as operating without a single central authority controlling the assets and data."
  },
  {
    id: "usdx-problem-32",
    keywords: ["blockchain purpose", "blockchain usdx", "purpose blockchain usdx"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Blockchain Purpose in USDX\n\nBlockchain provides the infrastructure for recording transactions, smart-contract activity, and token-related operations."
  },
  {
    id: "usdx-problem-33",
    keywords: ["smart contract", "what is smart contract", "smartcontract"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## What is a Smart Contract?\n\nA smart contract is computer code deployed on a blockchain that can automatically execute predefined rules."
  },
  {
    id: "usdx-problem-34",
    keywords: ["smart contract useful", "why smart contract", "smart contract benefit"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Smart Contract Usefulness\n\nThey can automatically perform operations according to programmed rules without requiring a person to manually process every transaction."
  },
  {
    id: "usdx-problem-35",
    keywords: ["smart contract think", "smart contract intelligence", "ai smart contract"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Smart Contract Intelligence\n\nNo. A smart contract cannot think like a human. It follows the rules programmed into it."
  },
  {
    id: "usdx-problem-36",
    keywords: ["smart contract error", "smart contract bug", "coding error smart contract"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Smart Contract Errors\n\nIf a smart contract has a coding error, it can cause unexpected behavior or financial losses. This is why smart-contract security is important."
  },
  {
    id: "usdx-problem-37",
    keywords: ["transparent blockchain", "blockchain transparency"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Transparency in Blockchain\n\nIt means blockchain activity can often be publicly inspected and verified."
  },
  {
    id: "usdx-problem-38",
    keywords: ["self-sustaining ecosystem", "self sustaining", "ecosystem sustainable"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Self-Sustaining Ecosystem\n\nThe project describes an ecosystem where different activities and revenue mechanisms are intended to support the broader system."
  },
  {
    id: "usdx-problem-39",
    keywords: ["revenue ecosystem", "ecosystem components", "trigger peg staking"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## USDX Revenue Ecosystem Components\n\nThe document lists Trigger Peg Technology, USDX staking/re-staking, Fixed APY, Stable DEX, BridgeX, Future DEX, Insight X, and listing partnerships."
  },
  {
    id: "usdx-problem-40",
    keywords: ["multiple components", "why multiple", "ecosystem growth"],
    category: "Problem and Solution",
    sources: ["USDX-SMART Documentation"],
    text: "## Multiple Ecosystem Components\n\nAccording to the document, they are intended to provide different sources of utility, liquidity, revenue, and ecosystem growth."
  },

  // ─── USDX-SMART Q&A: TRIGGER PEG AND STABILITY (41–60) ────────────
  {
    id: "usdx-peg-41",
    keywords: ["trigger peg technology", "trigger peg", "peg technology"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## Trigger Peg Technology\n\nIt is the mechanism described by the project for helping USDX maintain its target relationship with DAI."
  },
  {
    id: "usdx-peg-42",
    keywords: ["target peg", "target price", "peg target"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Target Peg\n\nThe target is the value of $1 DAI."
  },
  {
    id: "usdx-peg-43",
    keywords: ["why peg", "why usdx needs peg", "peg importance"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Why USDX Needs a Peg\n\nThe project wants USDX to maintain a stable value rather than behaving like a highly volatile cryptocurrency."
  },
  {
    id: "usdx-peg-44",
    keywords: ["what is peg", "peg meaning", "stablecoin peg"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## What is a Peg?\n\nA peg is a mechanism intended to keep one asset's value close to another reference value."
  },
  {
    id: "usdx-peg-45",
    keywords: ["trigger peg bot", "peg bot", "automated bot"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Trigger Peg Bot\n\nIt is an automated bot described in the project that monitors and recalibrates the USDX system to help maintain the DAI peg."
  },
  {
    id: "usdx-peg-46",
    keywords: ["bot manual", "manual trigger peg", "bot automatic"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Trigger Peg Bot Operation\n\nNo, the bot does not work manually. The document describes it as operating automatically without manual intervention."
  },
  {
    id: "usdx-peg-47",
    keywords: ["real-time recalibration", "recalibration", "real time adjustment"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Real-Time Recalibration\n\nIt means the system is designed to make adjustments as market conditions change."
  },
  {
    id: "usdx-peg-48",
    keywords: ["automation useful", "why automation", "automation benefit"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Automation is Useful\n\nAutomation can allow predefined actions to happen quickly without requiring a person to perform them manually."
  },
  {
    id: "usdx-peg-49",
    keywords: ["peg guarantee", "guarantee one dollar", "usdx always one dollar"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Does a Peg Guarantee $1?\n\nNo. A mechanism can aim to maintain a peg, but market conditions and technical factors can cause deviations."
  },
  {
    id: "usdx-peg-50",
    keywords: ["target price deviation", "move away target", "price deviation"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Price Deviation\n\nIn this project, the Trigger Peg mechanism is intended to help bring the value back toward the target."
  },
  {
    id: "usdx-peg-51",
    keywords: ["what is liquidity", "liquidity", "liquidity meaning"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## What is Liquidity?\n\nLiquidity means how easily an asset can be bought or sold without causing a large change in its price."
  },
  {
    id: "usdx-peg-52",
    keywords: ["why liquidity important", "liquidity importance"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Liquidity Matters\n\nGood liquidity generally makes trading easier and can reduce the price impact of transactions."
  },
  {
    id: "usdx-peg-53",
    keywords: ["liquidity pool", "what is liquidity pool", "pool tokens"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Liquidity Pool\n\nIt is a pool of tokens supplied for trading on a decentralized exchange."
  },
  {
    id: "usdx-peg-54",
    keywords: ["usdx dai pool", "50 50 pool", "pool split"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## USDX Liquidity Pool\n\nThe document says the pool is split between USDX and DAI, 50% each."
  },
  {
    id: "usdx-peg-55",
    keywords: ["50 usdx 50 dai", "equal pool", "half half pool"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## 50% USDX / 50% DAI\n\nIt means the described liquidity pool uses equal portions of USDX and DAI."
  },
  {
    id: "usdx-peg-56",
    keywords: ["lp tokens", "what is lp", "liquidity provider tokens"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## LP Tokens\n\nLP tokens are tokens representing a user's share or position in a liquidity pool."
  },
  {
    id: "usdx-peg-57",
    keywords: ["locked lp", "locked liquidity", "lock lp tokens"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Locked LP Tokens\n\nIt means the project's document says the liquidity-provider tokens are locked."
  },
  {
    id: "usdx-peg-58",
    keywords: ["why lock liquidity", "lock liquidity purpose", "liquidity lock reason"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Lock Liquidity?\n\nLocking liquidity can be intended to reduce the ability to remove that liquidity immediately and can provide greater confidence in continued liquidity."
  },
  {
    id: "usdx-peg-59",
    keywords: ["low slippage", "slippage", "what is slippage"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation"],
    text: "## Low Slippage\n\nIt means the actual execution price of a trade is expected to be relatively close to the displayed price."
  },
  {
    id: "usdx-peg-60",
    keywords: ["stable dex", "dex", "decentralized exchange usdx"],
    category: "Trigger Peg and Stability",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## Stable DEX\n\nIt is a decentralized-exchange component intended to provide efficient trading with low slippage."
  },

  // ─── USDX-SMART Q&A: STAKING (61–80) ────────────────────────────────
  {
    id: "usdx-stake-61",
    keywords: ["what is staking", "staking definition"],
    category: "Staking",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## What is Staking?\n\nStaking means committing or depositing crypto assets into a blockchain or smart-contract system according to its rules."
  },
  {
    id: "usdx-stake-62",
    keywords: ["why staking usdx", "usdx staking purpose"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Staking in USDX?\n\nThe project uses staking as one of the main mechanisms through which users participate and earn USDX."
  },
  {
    id: "usdx-stake-63",
    keywords: ["first step new user", "register", "registration sponsor"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## First Step for New User\n\nThe document says the user must register with a sponsor or referrer."
  },
  {
    id: "usdx-stake-64",
    keywords: ["sponsor", "referrer", "referral sponsor"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Sponsor/Referrer\n\nIt is an existing participant who introduces a new user to the ecosystem."
  },
  {
    id: "usdx-stake-65",
    keywords: ["second step", "stake dai usdx", "deposit stake"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Second Step\n\nThe user stakes DAI or USDX through the smart contract."
  },
  {
    id: "usdx-stake-66",
    keywords: ["third step", "earn usdx", "earning step"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Third Step\n\nAccording to the document, the user earns USDX through the staking mechanism."
  },
  {
    id: "usdx-stake-67",
    keywords: ["fourth step", "re-staking", "restaking step"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Fourth Step\n\nRe-staking is required after reaching the 2X cap if the user wants to continue earning."
  },
  {
    id: "usdx-stake-68",
    keywords: ["what is restaking", "re-staking meaning", "re staking"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## What is Re-Staking?\n\nRe-staking means putting assets back into the staking system to continue participating."
  },
  {
    id: "usdx-stake-69",
    keywords: ["why restaking", "restaking required", "restaking reason"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Re-Staking?\n\nThe project's rules state that earning stops at the 2X cap until the user re-stakes."
  },
  {
    id: "usdx-stake-70",
    keywords: ["minimum staking", "minimum stake", "min staking amount"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Minimum Staking Amount\n\nThe self-staking section says the minimum is greater than $0, meaning any amount above zero."
  },
  {
    id: "usdx-stake-71",
    keywords: ["maximum staking", "maximum stake", "max staking amount"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Maximum Staking Amount\n\nThe document states that the maximum is unlimited."
  },
  {
    id: "usdx-stake-72",
    keywords: ["unlimited staking", "no max stake", "unlimited stake"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Unlimited Staking\n\nIt means the document does not specify a maximum dollar value for the amount a user can stake."
  },
  {
    id: "usdx-stake-73",
    keywords: ["what assets stake", "stake assets", "dai usdx stake"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Assets for Staking\n\nThe document mentions DAI and USDX."
  },
  {
    id: "usdx-stake-74",
    keywords: ["daily yield", "what is daily yield", "daily earning"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Daily Yield\n\nIt refers to the amount of yield calculated or generated each day according to the project's stated rate."
  },
  {
    id: "usdx-stake-75",
    keywords: ["daily self staking yield", "yield rates", "staking yield percentage"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Daily Self-Staking Yields\n\nThe document lists rates from 0.3% to 1.0%, depending on rank."
  },
  {
    id: "usdx-stake-76",
    keywords: ["same yield all ranks", "rank yield difference", "yield varies"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Yield by Rank\n\nNo. Higher ranks are shown with higher self-staking daily-yield percentages."
  },
  {
    id: "usdx-stake-77",
    keywords: ["ux rank", "what is ux rank", "ux ranking"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## UX Rank\n\nUX is the initial rank listed in the USDX-SMART ranking system."
  },
  {
    id: "usdx-stake-78",
    keywords: ["smart x rank", "smart-x", "smart x"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Smart-X Rank\n\nSmart-X is the second rank listed in the project's ranking structure."
  },
  {
    id: "usdx-stake-79",
    keywords: ["other ranks", "rank list", "plus x pro x"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Other Ranks\n\nPlus-X, Pro-X, Chief-X, Royal-X, and Empire-X are listed after Smart-X."
  },
  {
    id: "usdx-stake-80",
    keywords: ["why different ranks", "ranks purpose", "rank system purpose"],
    category: "Staking",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Different Ranks?\n\nThe project uses ranks to determine different self-staking yields and eligibility/reward requirements."
  },

  // ─── USDX-SMART Q&A: 2X CAP AND CALCULATIONS (81–100) ──────────────
  {
    id: "usdx-cap-81",
    keywords: ["2x cap", "two x cap", "2 times cap"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## What is the 2X Cap?\n\nIt means the project limits the total return from a particular stake to 2 times the staking value."
  },
  {
    id: "usdx-cap-82",
    keywords: ["2x 1000", "2x thousand", "1000 stake 2x"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## 2X for $1,000\n\nThe stated maximum return is $2,000."
  },
  {
    id: "usdx-cap-83",
    keywords: ["2x 500", "2x five hundred", "500 stake 2x"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## 2X for $500\n\nThe stated 2X cap is $1,000."
  },
  {
    id: "usdx-cap-84",
    keywords: ["2x 2000", "2x two thousand", "2000 stake 2x"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## 2X for $2,000\n\nThe stated 2X cap is $4,000."
  },
  {
    id: "usdx-cap-85",
    keywords: ["why 2x cap", "2x cap purpose", "cap sustainability"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Why the 2X Cap?\n\nThe document says the cap is intended to provide controlled earning and support platform sustainability."
  },
  {
    id: "usdx-cap-86",
    keywords: ["after 2x cap", "reach 2x cap", "cap reached"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## After Reaching 2X Cap\n\nThe user is considered inactive for that stake and must re-stake to continue earning."
  },
  {
    id: "usdx-cap-87",
    keywords: ["inactive meaning", "what is inactive", "inactive stake"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## What is Inactive?\n\nIt means the user has reached the stated earning limit and cannot continue earning under that stake until re-staking."
  },
  {
    id: "usdx-cap-88",
    keywords: ["continue earning same stake", "same stake after 2x"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Earning on Same Stake After 2X\n\nAccording to the project's rules, no. Re-staking is required."
  },
  {
    id: "usdx-cap-89",
    keywords: ["purpose restaking 2x", "restaking purpose"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Purpose of Re-Staking After 2X\n\nIt allows the user to become active again and continue participating in the earning mechanism."
  },
  {
    id: "usdx-cap-90",
    keywords: ["restake usdx", "usdx re-stake price", "fetch usdx price"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Re-Stake with USDX\n\nThe document says the live USDX price will be fetched when calculating the re-stake."
  },
  {
    id: "usdx-cap-91",
    keywords: ["registration fee", "sign up fee", "join fee"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Registration Fee\n\nThe document states no registration fee."
  },
  {
    id: "usdx-cap-92",
    keywords: ["withdrawal fee", "withdraw fee", "withdrawal cost"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Withdrawal Fee\n\nThe document states no withdrawal fee."
  },
  {
    id: "usdx-cap-93",
    keywords: ["minimum withdrawal", "min withdrawal", "withdrawal minimum"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Minimum Withdrawal\n\nThe document describes the minimum withdrawal as insignificant rather than giving a specific numerical amount."
  },
  {
    id: "usdx-cap-94",
    keywords: ["direct referral income", "referral income", "direct referral"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Direct Referral Income\n\nIt is income associated with introducing a new user who makes a first-time stake."
  },
  {
    id: "usdx-cap-95",
    keywords: ["referral percentage", "20 percent", "20% referral"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Direct Referral Percentage\n\nThe document states 20% USDX as spot income on a new direct user's first-time stake."
  },
  {
    id: "usdx-cap-96",
    keywords: ["referral example 1000", "200 referral", "1000 first stake referral"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Referral Example\n\nThe project's example shows a 20% direct income of $200 on a $1,000 first stake."
  },
  {
    id: "usdx-cap-97",
    keywords: ["affiliate staking yield", "affiliate yield", "affiliate earning"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Affiliate Staking Yield\n\nIt is an additional earning mechanism based on eligible staking activity within the user's affiliate/team structure."
  },
  {
    id: "usdx-cap-98",
    keywords: ["affiliate levels", "how many levels", "25 levels"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Affiliate Levels\n\nThe document refers to up to 25 levels."
  },
  {
    id: "usdx-cap-99",
    keywords: ["fixed apy", "fixed apy system", "apy staking"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation"],
    text: "## Fixed APY System\n\nIt is another staking option described in the project where users stake for specified durations and receive a stated APY."
  },
  {
    id: "usdx-cap-100",
    keywords: ["simplest explanation", "explain beginner", "usdx summary"],
    category: "2X Cap and Calculations",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## USDX-SMART Summary\n\nUSDX-SMART is a Base-based crypto ecosystem that describes USDX as a decentralized, DAI-pegged token. Users participate through staking and other community mechanisms, while the project uses a Trigger Peg system and a 2X earning cap as part of its stated design."
  },

  // ─── USDX-SMART Q&A: BLOCKCHAIN & WEB3 (101–200) ────────────────────
  {
    id: "web3-101",
    keywords: ["what is blockchain", "blockchain explained", "blockchain simple"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## What is a Blockchain?\n\nA blockchain is a digital record book that stores transactions in a way that is shared across a network."
  },
  {
    id: "web3-102",
    keywords: ["why called blockchain", "blockchain name origin", "chain blocks"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Called Blockchain?\n\nTransactions are grouped into blocks, and these blocks are connected together like a chain."
  },
  {
    id: "web3-103",
    keywords: ["who controls blockchain", "blockchain control", "central authority blockchain"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Who Controls a Blockchain?\n\nIt depends on the blockchain. In a decentralized blockchain, control is distributed among network participants rather than one single organization."
  },
  {
    id: "web3-104",
    keywords: ["what is decentralization", "decentralization meaning"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Decentralization\n\nDecentralization means that a system does not depend completely on one central authority."
  },
  {
    id: "web3-105",
    keywords: ["why decentralization important usdx", "decentralization usdx"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Decentralization Importance for USDX\n\nThe project presents decentralization as a way to reduce dependence on a single authority and provide transparency."
  },
  {
    id: "web3-106",
    keywords: ["what is web3", "web3 explained", "web 3"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## What is Web3?\n\nWeb3 is a term commonly used for blockchain-based applications where users can interact with decentralized networks and control their digital assets through wallets."
  },
  {
    id: "web3-107",
    keywords: ["what is cryptocurrency", "cryptocurrency", "crypto meaning"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Cryptocurrency\n\nCryptocurrency is digital value that uses blockchain technology to record and verify transactions."
  },
  {
    id: "web3-108",
    keywords: ["physical money", "is crypto physical", "physical cryptocurrency"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Physical Cryptocurrency\n\nNo. Cryptocurrency exists digitally."
  },
  {
    id: "web3-109",
    keywords: ["what is crypto wallet", "wallet meaning", "wallet crypto"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Crypto Wallet\n\nA crypto wallet is an application or device that allows users to manage blockchain accounts and interact with crypto assets."
  },
  {
    id: "web3-110",
    keywords: ["wallet store coins", "coins inside phone", "wallet physically stores"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Does a Wallet Store Coins?\n\nNot exactly. The blockchain records the assets. The wallet manages the keys that allow you to control them."
  },
  {
    id: "web3-111",
    keywords: ["wallet address", "public address", "address wallet"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Wallet Address\n\nA wallet address is a public identifier that can be used to receive crypto assets."
  },
  {
    id: "web3-112",
    keywords: ["share wallet address", "can share address", "address public"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Sharing Wallet Address\n\nGenerally, yes. A public wallet address is designed to be shared for receiving assets."
  },
  {
    id: "web3-113",
    keywords: ["never share", "private key seed phrase", "do not share"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## What Should Never Be Shared?\n\nYour private key and secret recovery phrase should never be shared."
  },
  {
    id: "web3-114",
    keywords: ["private key", "what is private key", "privatekey"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Private Key\n\nA private key is a secret piece of information that proves control over a blockchain account."
  },
  {
    id: "web3-115",
    keywords: ["private key stolen", "private key compromised", "get my private key"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Private Key Compromised\n\nThey may be able to control and transfer the assets associated with that account."
  },
  {
    id: "web3-116",
    keywords: ["seed phrase", "recovery phrase", "what is seed phrase"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Seed Phrase\n\nA seed phrase, also called a recovery phrase, is a set of words used to recover a crypto wallet."
  },
  {
    id: "web3-117",
    keywords: ["seed phrase online", "store seed phrase", "seed phrase safe"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Seed Phrase Storage\n\nIt is safer to keep it offline and protected from unauthorized access."
  },
  {
    id: "web3-118",
    keywords: ["what is transaction", "blockchain transaction", "transaction meaning"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Transaction\n\nA transaction is an action recorded on a blockchain, such as transferring tokens."
  },
  {
    id: "web3-119",
    keywords: ["transaction hash", "tx hash", "what is txid"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Transaction Hash\n\nA transaction hash is a unique identifier associated with a blockchain transaction."
  },
  {
    id: "web3-120",
    keywords: ["why transaction hash", "hash useful", "tx hash useful"],
    category: "Blockchain & Web3",
    sources: ["USDX-SMART Documentation"],
    text: "## Transaction Hash Usefulness\n\nIt allows users to look up the transaction and check its blockchain status."
  },
  {
    id: "web3-121",
    keywords: ["what is ethereum", "ethereum explained", "ethereum blockchain"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## What is Ethereum?\n\nEthereum is a blockchain network that supports cryptocurrency transactions and programmable smart contracts."
  },
  {
    id: "web3-122",
    keywords: ["smart contract blockchain", "smart contract explained"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Smart Contract\n\nA smart contract is blockchain-based computer code that automatically executes predefined rules."
  },
  {
    id: "web3-123",
    keywords: ["smart contract human approve", "manual approval smart contract"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Smart Contract Automation\n\nNot necessarily. Once its rules are programmed, many operations can happen automatically when their conditions are met."
  },
  {
    id: "web3-124",
    keywords: ["what is base blockchain", "base l2", "base layer 2"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## What is Base?\n\nBase is an Ethereum Layer-2 blockchain."
  },
  {
    id: "web3-125",
    keywords: ["what is layer 2", "layer 2 meaning", "l2 blockchain"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Layer 2\n\nLayer 2 is a network built to work with an underlying blockchain such as Ethereum, generally aiming to make transactions more efficient."
  },
  {
    id: "web3-126",
    keywords: ["why usdx uses base", "base efficiency", "why base for usdx"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Base for USDX?\n\nThe project says it uses Base for efficiency, speed, lower transaction costs, and scalability."
  },
  {
    id: "web3-127",
    keywords: ["base same ethereum", "base vs ethereum", "base different ethereum"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Base vs Ethereum\n\nNo. Base is a separate Layer-2 network built on Ethereum."
  },
  {
    id: "web3-128",
    keywords: ["why not ethereum directly", "why not just ethereum", "use ethereum directly"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Not Just Ethereum?\n\nOne reason projects may use Layer 2 networks is to achieve lower costs and faster transaction processing."
  },
  {
    id: "web3-129",
    keywords: ["ethereum layer 2 simple", "l2 simple explanation", "layer 2 highway"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Layer 2 Explained Simply\n\nThink of Ethereum as a main highway and Layer 2 as another route designed to handle transactions more efficiently while connecting back to Ethereum."
  },
  {
    id: "web3-130",
    keywords: ["network specified", "which network", "project network"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Project Network\n\nBase."
  },
  {
    id: "web3-131",
    keywords: ["eth gas", "gas fee cryptocurrency", "eth for gas"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## ETH for Gas\n\nETH is used for transaction fees on Base."
  },
  {
    id: "web3-132",
    keywords: ["what is gas", "gas fee", "gas blockchain"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## What is Gas?\n\nGas is the fee required to process an operation on a blockchain."
  },
  {
    id: "web3-133",
    keywords: ["why gas fees", "why blockchain transaction gas", "gas necessary"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Gas Fees?\n\nGas compensates the network for processing and recording transactions."
  },
  {
    id: "web3-134",
    keywords: ["no enough gas", "insufficient gas", "not enough gas"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Insufficient Gas\n\nNormally, no. You need sufficient native network currency to pay the transaction fee."
  },
  {
    id: "web3-135",
    keywords: ["why eth usdx user", "eth needed usdx", "usdx eth gas"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## ETH for USDX Users\n\nETH may be needed to pay transaction fees when interacting with the Base network."
  },
  {
    id: "web3-136",
    keywords: ["network fee", "blockchain network fee"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Blockchain Network Fee\n\nIt is the fee paid for processing a transaction on the blockchain."
  },
  {
    id: "web3-137",
    keywords: ["gas fee same", "gas fee changes", "variable gas"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Gas Fee Variability\n\nNo. Fees can change depending on network conditions and the transaction."
  },
  {
    id: "web3-138",
    keywords: ["blockchain explorer", "what is explorer", "etherscan basescan"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Blockchain Explorer\n\nIt is a website or tool that lets users inspect blockchain transactions and addresses."
  },
  {
    id: "web3-139",
    keywords: ["explorer show", "what explorer shows", "explorer information"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Explorer Information\n\nDepending on the explorer, it can show transactions, wallet addresses, token transfers, contract activity, and transaction status."
  },
  {
    id: "web3-140",
    keywords: ["blockchain transparency useful", "why transparency useful"],
    category: "Ethereum and Base",
    sources: ["USDX-SMART Documentation"],
    text: "## Blockchain Transparency\n\nIt allows users to independently inspect information recorded on the blockchain."
  },
  {
    id: "web3-141",
    keywords: ["what is token", "token meaning", "token vs coin"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## What is a Token?\n\nA token is a digital asset created and managed using blockchain technology."
  },
  {
    id: "web3-142",
    keywords: ["token same blockchain", "token vs blockchain", "token blockchain difference"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Token vs Blockchain\n\nNo. A blockchain is the network or infrastructure; a token is an asset that can operate on that network."
  },
  {
    id: "web3-143",
    keywords: ["token contract", "token smart contract"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Token Contract\n\nIt is a smart contract that defines how a blockchain token behaves."
  },
  {
    id: "web3-144",
    keywords: ["token minting", "what is minting", "mint tokens"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Token Minting\n\nMinting means creating new units of a token according to the rules of its system."
  },
  {
    id: "web3-145",
    keywords: ["community minting usdx", "usdx community minted"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## USDX Community Minting\n\nThe project describes USDX as being community minted through its staking ecosystem rather than being directly buyable."
  },
  {
    id: "web3-146",
    keywords: ["non-buyable token", "token non buyable"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Non-Buyable Token\n\nAccording to the project model, it means USDX is not intended to be purchased directly like a conventional token; it is generated through the project's specified mechanisms."
  },
  {
    id: "web3-147",
    keywords: ["why non-buyable usdx", "usdx non-buyable reason"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Non-Buyable?\n\nThe project describes this as one of its distinguishing features and connects it with its decentralized model."
  },
  {
    id: "web3-148",
    keywords: ["token burning", "what is burning", "burn tokens"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Token Burning\n\nToken burning means permanently removing tokens from circulation."
  },
  {
    id: "web3-149",
    keywords: ["usdx burning mechanism", "burning usdx"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## USDX Burning Mechanism\n\nThe provided document does not give a detailed burning mechanism."
  },
  {
    id: "web3-150",
    keywords: ["token supply", "what is token supply", "supply meaning"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Token Supply\n\nToken supply refers to the number of tokens that exist or are available under a particular supply definition."
  },
  {
    id: "web3-151",
    keywords: ["usdx max supply", "fixed supply usdx", "maximum supply"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## USDX Maximum Supply\n\nThe provided document does not specify a fixed maximum USDX supply."
  },
  {
    id: "web3-152",
    keywords: ["contract address", "smart contract address"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Contract Address\n\nIt is the blockchain address where a smart contract is deployed."
  },
  {
    id: "web3-153",
    keywords: ["verify contract address", "check contract address", "contract address verification"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Why Verify Contract Address?\n\nBecause interacting with the wrong contract can result in loss of funds or interaction with a fraudulent application."
  },
  {
    id: "web3-154",
    keywords: ["contract verification", "verify contract source code"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Contract Verification\n\nIt is a process that makes a contract's source code available for public inspection on a blockchain explorer."
  },
  {
    id: "web3-155",
    keywords: ["contract verification useful", "why contract verification"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Contract Verification Usefulness\n\nIt can make it easier for users and developers to inspect what the contract is programmed to do."
  },
  {
    id: "web3-156",
    keywords: ["contract verification safe", "verification proves safe"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Does Verification Prove Safety?\n\nNo. Verification improves transparency but does not by itself guarantee that a contract is safe or economically sound."
  },
  {
    id: "web3-157",
    keywords: ["smart contract audit", "what is audit", "audit security"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Smart Contract Audit\n\nA smart-contract audit is a security review intended to identify coding vulnerabilities or other issues."
  },
  {
    id: "web3-158",
    keywords: ["audit guarantee safe", "audit cannot hack", "audit perfect security"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Does Audit Guarantee Safety?\n\nNo. An audit can reduce risk, but it cannot guarantee perfect security."
  },
  {
    id: "web3-159",
    keywords: ["on-chain audit", "transparent audit usdx"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## On-Chain Audit\n\nThe project describes transparent, on-chain audits as part of its decentralization approach."
  },
  {
    id: "web3-160",
    keywords: ["understand smart contract staking", "why understand contract", "smart contract staking"],
    category: "Tokens and Smart Contracts",
    sources: ["USDX-SMART Documentation"],
    text: "## Understanding Smart Contracts Before Staking\n\nBecause staking involves interacting with blockchain code, and users should understand what they are authorizing."
  },
  {
    id: "web3-161",
    keywords: ["what is dex", "dex meaning", "decentralized exchange"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## What is a DEX?\n\nDEX stands for Decentralized Exchange."
  },
  {
    id: "web3-162",
    keywords: ["dex does", "what does dex do", "dex function"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## What Does a DEX Do?\n\nA DEX allows users to trade crypto assets using blockchain-based systems."
  },
  {
    id: "web3-163",
    keywords: ["dex vs centralized", "dex traditional exchange", "centralized vs dex"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## DEX vs Traditional Exchange\n\nA traditional exchange is generally operated by a centralized company, while a DEX uses blockchain-based smart contracts for trading."
  },
  {
    id: "web3-164",
    keywords: ["liquidity pool what", "pool trading", "liquidity pool definition"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Liquidity Pool\n\nIt is a collection of crypto assets supplied to a decentralized trading system."
  },
  {
    id: "web3-165",
    keywords: ["why dex needs liquidity", "liquidity needed dex"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Why DEX Needs Liquidity\n\nLiquidity allows traders to exchange assets more easily."
  },
  {
    id: "web3-166",
    keywords: ["what is lp", "lp meaning", "liquidity provider"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## What is LP?\n\nLP usually means Liquidity Provider."
  },
  {
    id: "web3-167",
    keywords: ["liquidity provider does", "what does lp do", "lp function"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## What Does a Liquidity Provider Do?\n\nA liquidity provider contributes assets to a liquidity pool."
  },
  {
    id: "web3-168",
    keywords: ["lp tokens meaning", "what are lp tokens"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## LP Tokens\n\nThey are tokens or records representing a liquidity provider's position in a pool."
  },
  {
    id: "web3-169",
    keywords: ["usdx liquidity pool", "usdx pool split", "usdx dai pool document"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## USDX Liquidity Pool\n\nIt describes a pool split 50% USDX and 50% DAI."
  },
  {
    id: "web3-170",
    keywords: ["50/50 liquidity", "equal proportions pool"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## 50/50 Liquidity\n\nIt means the described pool contains equal proportions of the two assets."
  },
  {
    id: "web3-171",
    keywords: ["what is slippage", "slippage explained", "slippage trading"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Slippage\n\nSlippage is the difference between the expected trading price and the actual execution price."
  },
  {
    id: "web3-172",
    keywords: ["low slippage meaning", "what is low slippage"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Low Slippage\n\nLow slippage means the actual trading price is relatively close to the expected price."
  },
  {
    id: "web3-173",
    keywords: ["why low slippage useful", "low slippage benefit"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Low Slippage Benefit\n\nIt means traders are less likely to receive a significantly different price from the one they expected."
  },
  {
    id: "web3-174",
    keywords: ["high slippage cause", "what causes slippage", "slippage cause"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Causes of High Slippage\n\nLow liquidity or a large trade compared with the size of the liquidity pool can contribute to higher slippage."
  },
  {
    id: "web3-175",
    keywords: ["what is swap", "swap crypto", "token swap"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## What is a Swap?\n\nA swap is exchanging one cryptocurrency or token for another."
  },
  {
    id: "web3-176",
    keywords: ["swap on dex", "can swap crypto dex", "dex swap"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Swapping on DEX\n\nYes, provided the DEX supports the assets and the necessary liquidity exists."
  },
  {
    id: "web3-177",
    keywords: ["price impact", "what is price impact", "trade price impact"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Price Impact\n\nPrice impact is the effect that a trade itself has on the market price."
  },
  {
    id: "web3-178",
    keywords: ["price impact gas fee", "impact vs gas", "gas vs impact"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Price Impact vs Gas Fee\n\nNo. Gas is a blockchain transaction fee; price impact is related to the trade and available liquidity."
  },
  {
    id: "web3-179",
    keywords: ["bridgex", "what is bridgex", "cross-chain bridgex"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## BridgeX\n\nBridgeX is presented as a component for cross-chain interoperability and ecosystem growth."
  },
  {
    id: "web3-180",
    keywords: ["cross-chain", "what is cross chain", "cross chain meaning"],
    category: "DEX, Liquidity and Trading",
    sources: ["USDX-SMART Documentation"],
    text: "## Cross-Chain\n\nIt means interacting or transferring assets or information between different blockchain networks."
  },
  {
    id: "web3-181",
    keywords: ["crypto transaction", "what is crypto transaction"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Crypto Transaction\n\nIt is an action recorded on a blockchain, such as sending or receiving tokens."
  },
  {
    id: "web3-182",
    keywords: ["wallet connection", "connect wallet", "what is wallet connect"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Wallet Connection\n\nIt allows a website or decentralized application to interact with a user's blockchain wallet."
  },
  {
    id: "web3-183",
    keywords: ["wallet private key website", "does wallet share private key", "wallet connect expose key"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Does Wallet Connection Expose Private Key?\n\nNo. A legitimate wallet connection does not expose your private key to the website."
  },
  {
    id: "web3-184",
    keywords: ["wallet approval", "approve token", "what is approval"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Wallet Approval\n\nIt is permission given to a smart contract to interact with a particular token according to the approved amount."
  },
  {
    id: "web3-185",
    keywords: ["be careful approvals", "approval risk", "malicious approval"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Approval Caution\n\nApproving a malicious or unsafe contract can create a security risk."
  },
  {
    id: "web3-186",
    keywords: ["blockchain confirmation", "what is confirmation", "transaction confirmation"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Blockchain Confirmation\n\nIt means the transaction has been included in a blockchain block and has received confirmation from the network."
  },
  {
    id: "web3-187",
    keywords: ["pending transaction", "what is pending", "transaction pending"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Pending Transaction\n\nIt means the transaction has been submitted but has not yet completed processing."
  },
  {
    id: "web3-188",
    keywords: ["failed transaction", "transaction failed", "what failed transaction"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Failed Transaction\n\nIt means the blockchain did not successfully execute the requested operation."
  },
  {
    id: "web3-189",
    keywords: ["failed transaction stolen", "funds stolen failed", "failed transaction funds"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Failed Transaction and Funds\n\nNo. A failed transaction can simply mean the requested operation was not executed, although gas may still have been spent."
  },
  {
    id: "web3-190",
    keywords: ["explorer usdx smart", "blockchain explorer usdx", "usdx explorer"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Explorer for USDX-SMART\n\nIt can be used to inspect transactions, wallet activity, token transfers, and smart-contract activity."
  },
  {
    id: "web3-191",
    keywords: ["check transaction hash staking", "why check tx hash", "verify transaction staking"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Checking Transaction Hash After Staking\n\nIt provides a way to verify whether the transaction was actually recorded on the blockchain."
  },
  {
    id: "web3-192",
    keywords: ["wallet role usdx", "wallet function usdx", "wallet in usdx"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Wallet Role in USDX\n\nThe wallet allows the user to hold/control supported assets and interact with the project's smart contracts."
  },
  {
    id: "web3-193",
    keywords: ["role of base usdx", "base role usdx", "base function usdx"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Role of Base in USDX\n\nBase provides the blockchain infrastructure on which the project is built."
  },
  {
    id: "web3-194",
    keywords: ["role of dai", "dai function", "dai role usdx"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Role of DAI\n\nDAI is the reference asset to which USDX is described as being pegged."
  },
  {
    id: "web3-195",
    keywords: ["role of trigger peg", "trigger peg function"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Role of Trigger Peg\n\nIt is designed to help maintain USDX's target relationship with DAI."
  },
  {
    id: "web3-196",
    keywords: ["role of staking", "staking function", "staking purpose usdx"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Role of Staking\n\nStaking is one of the main participation mechanisms through which users can generate USDX according to the project's rules."
  },
  {
    id: "web3-197",
    keywords: ["role of restaking", "restaking function", "restaking purpose"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Role of Re-Staking\n\nRe-staking reactivates participation after the stated 2X earning cap is reached."
  },
  {
    id: "web3-198",
    keywords: ["role of 2x cap", "2x cap function", "cap purpose"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Role of 2X Cap\n\nIt limits the stated return on a stake to twice its staking value before re-staking is required."
  },
  {
    id: "web3-199",
    keywords: ["main technology usdx", "technology behind usdx", "usdx tech stack"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation"],
    text: "## Main Technology Behind USDX\n\nThe project combines blockchain technology, smart contracts, wallets, staking mechanisms, liquidity pools, and its Trigger Peg mechanism."
  },
  {
    id: "web3-200",
    keywords: ["explain usdx 30 seconds", "usdx summary short", "30 second usdx"],
    category: "Easy Viva Questions",
    sources: ["USDX-SMART Documentation", "USDX Knowledge Base"],
    text: "## 30-Second USDX Explanation\n\nUSDX-SMART is a decentralized crypto ecosystem built on the Base Layer-2 blockchain. The project describes USDX as a non-buyable, community-minted stablecoin designed to maintain a peg with DAI. Users can participate through staking and re-staking, while the ecosystem includes a Trigger Peg mechanism, liquidity pools, referral and affiliate systems, fixed APY options, and other planned components."
  },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function scoreEntry(entry: RawKnowledgeEntry, query: string): number {
  const q = normalize(query);
  const qWords = new Set(q.split(" ").filter((w) => w.length > 1));
  const qSet = [...entry.keywords, ...entry.text.split(" ").map(normalize)];

  let score = 0;
  for (const kw of entry.keywords) {
    const normKw = normalize(kw);
    if (qWords.has(normKw)) score += 8;
    else if (q.includes(normKw)) score += 4;
  }
  if (qWords.has(normalize(entry.category))) score += 8;
  for (const word of qWords) {
    if (qSet.some((term) => term.includes(word))) score += 1;
  }
  return score;
}

export interface ChatAnswer {
  text: string;
  id?: string;
  sources?: string[];
  unknown: boolean;
}

export function retrieveKnowledge(question: string): ChatAnswer {
  const trimmed = question.trim();
  if (!trimmed) {
    return { text: "Please ask a question about the USDX ecosystem — staking, compounding, swaps, ranks, rules or documentation.", sources: ["USDX Documentation", "USDX Knowledge Base"], unknown: false };
  }
  const scored = knowledgeBase
    .map((entry) => ({ entry, score: scoreEntry(entry, trimmed) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  if (scored.length === 0 || scored[0].score < 8) {
    return { text: "I couldn't find that information in the USDX knowledge base.", sources: ["USDX Documentation", "USDX Knowledge Base"], unknown: true };
  }
  const top = scored[0].entry;
  return { text: top.text, id: top.id, sources: top.sources, unknown: false };
}

export const suggestedQuestions = [
  "How does USDX staking work?",
  "Calculate my compounding",
  "Explain USDX swap rules",
  "Check my wallet",
  "What is USDX-SMART?",
  "What is Trigger Peg Technology?",
];

export const sourcesCatalog: KnowledgeSource[] = [
  { id: "docs", title: "USDX Documentation", category: "Documentation", updated: "2026-08-30" },
  { id: "kb", title: "USDX Knowledge Base", category: "Knowledge", updated: "2026-09-01" },
  { id: "rules", title: "Project Rules", category: "Rules", updated: "2026-08-28" },
  { id: "faq", title: "USDX FAQ", category: "FAQ", updated: "2026-08-25" },
];

export function getAllKnowledgeText(): string {
  return knowledgeBase
    .map((entry) => `[${entry.id}] ${entry.text}`)
    .join("\n\n---\n\n");
}
