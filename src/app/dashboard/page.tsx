import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import USDXOverviewCard from "@/components/dashboard/USDXOverviewCard";
import AIAssistantPanel from "@/components/dashboard/AIAssistantPanel";
import UpdatesPanel from "@/components/dashboard/UpdatesPanel";
import StakingCard from "@/components/dashboard/StakingCard";
import CompoundingCard from "@/components/dashboard/CompoundingCard";
import WalletCard from "@/components/dashboard/WalletCard";
import AnalyticsCard from "@/components/dashboard/AnalyticsCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import TransactionsPanel from "@/components/dashboard/TransactionsPanel";
import CmsAnnouncementBanner from "@/components/cms/CmsAnnouncementBanner";
import CmsSectionsRenderer from "@/components/cms/CmsSectionsRenderer";
import HeroSection from "@/components/hero/HeroSection";
import EliteLeaders from "@/components/leaderboard/EliteLeaders";
import TopLeadersMarquee from "@/components/leaderboard/TopLeadersMarquee";
import LiveLeaderboard from "@/components/leaderboard/LiveLeaderboard";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "USDXSMART Token Dashboard — live price, 1-hour candlestick chart and pool analytics on Base.",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <HeroSection />

          <div className="mt-4">
            <CmsAnnouncementBanner />
          </div>

          {/* Top row */}
          <section id="overview" className="scroll-mt-16 mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-4">
              {/* Left: Overview */}
              <USDXOverviewCard />

              {/* Center: AI Assistant */}
              <div className="h-[520px] lg:h-[600px]">
                <AIAssistantPanel />
              </div>

              {/* Right: Updates */}
              <div className="max-h-[600px] overflow-y-auto flex flex-col gap-4">
                <div className="max-h-[300px] overflow-y-auto">
                  <UpdatesPanel />
                </div>
                <div className="max-h-[300px]">
                  <TransactionsPanel />
                </div>
              </div>
            </div>
          </section>

          {/* Second row */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StakingCard />
            <CompoundingCard />
            <WalletCard />
            <AnalyticsCard />
          </div>

          {/* Elite Leaders */}
          <div className="mt-6">
            <EliteLeaders />
          </div>

          {/* Top Leaders marquee */}
          <div className="mt-6">
            <TopLeadersMarquee />
          </div>

          {/* Live leaderboard */}
          <div className="mt-6">
            <LiveLeaderboard />
          </div>

          {/* CMS-driven ecosystem updates */}
          <section id="ecosystem" className="scroll-mt-16 mt-6">
            <Reveal>
              <div className="mb-4">
                <h2 className="text-[17px] font-bold tracking-tight text-text-primary sm:text-[19px]">
                  Ecosystem Updates
                </h2>
                <p className="mt-1 text-[12px] text-text-muted">
                  Curated by the USDX team — publish from the Admin Panel.
                </p>
              </div>
            </Reveal>
            <CmsSectionsRenderer />
          </section>

          {/* Bottom: Activity Table */}
          <div className="mt-6">
            <ActivityTable />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
