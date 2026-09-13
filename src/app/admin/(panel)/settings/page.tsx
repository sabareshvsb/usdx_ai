import type { Metadata } from "next";
import SettingsManager from "@/components/admin/SettingsManager";

export const metadata: Metadata = {
  title: "Site Settings",
};

export default function Page() {
  return <SettingsManager />;
}