import type { Metadata } from "next";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";

export const metadata: Metadata = {
  title: "Announcements",
};

export default function Page() {
  return <AnnouncementsManager />;
}