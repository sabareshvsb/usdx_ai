import type { Metadata } from "next";
import SectionsManager from "@/components/admin/SectionsManager";

export const metadata: Metadata = {
  title: "Website Sections",
};

export default function Page() {
  return <SectionsManager />;
}