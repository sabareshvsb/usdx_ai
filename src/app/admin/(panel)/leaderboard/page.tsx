import { Metadata } from "next";
import LeaderboardManager from "@/components/admin/LeaderboardManager";

export const metadata: Metadata = {
  title: "Leaderboard | USDX CMS",
};

export default function AdminLeaderboardPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <LeaderboardManager />
    </div>
  );
}