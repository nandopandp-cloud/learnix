import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { Topbar } from "@/components/app/topbar";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  return (
    <div className="min-h-dvh bg-void">
      <Topbar user={user} />
      <AppShell user={user}>{children}</AppShell>
    </div>
  );
}
