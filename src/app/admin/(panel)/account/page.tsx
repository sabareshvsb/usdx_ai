import type { Metadata } from "next";
import AccountManager from "@/components/admin/AccountManager";

export const metadata: Metadata = {
  title: "Account",
};

export default function Page() {
  return <AccountManager />;
}