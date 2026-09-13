import type { Metadata } from "next";
import InstructionsManager from "@/components/admin/InstructionsManager";

export const metadata: Metadata = {
  title: "Instructions",
};

export default function Page() {
  return <InstructionsManager />;
}