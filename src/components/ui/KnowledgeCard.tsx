import Link from "next/link";
import {
  BookOpen,
  Coins,
  FileText,
  Layers,
  Repeat,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import type { KnowledgeCategory } from "@/lib/knowledge";

const iconMap = {
  overview: BookOpen,
  staking: Shield,
  compounding: TrendingUp,
  affiliate: UserPlus,
  ranks: Layers,
  swap: Repeat,
  wallet: Wallet,
  faq: Coins,
  docs: FileText,
  updates: Users,
};

export default function KnowledgeCard({ category }: { category: KnowledgeCategory }) {
  const Icon = iconMap[category.icon];
  return (
    <Link
      href={`/knowledge#${category.anchor}`}
      className="group flex flex-col justify-between rounded-[14px] border border-border-subtle bg-bg-card p-5 transition-all duration-200 hover:border-border-medium"
    >
      <div>
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[8px] bg-accent-blue/10">
          <Icon className="h-4 w-4 text-accent-blue" />
        </div>
        <h3 className="text-[14px] font-semibold tracking-tight text-text-primary">
          {category.title}
        </h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-text-muted">
          {category.description}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-text-muted">
          {category.docCount} {category.docCount === 1 ? "article" : "articles"}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted transition-colors group-hover:text-accent-blue">
          Explore
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
