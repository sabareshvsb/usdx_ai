import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/ui";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getSessionAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <ToastProvider>
      <AdminShell admin={admin}>{children}</AdminShell>
    </ToastProvider>
  );
}