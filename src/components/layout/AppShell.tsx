"use client";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
}
