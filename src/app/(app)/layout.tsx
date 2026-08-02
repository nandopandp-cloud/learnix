import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { Topbar } from "@/components/app/topbar";
import { AppShell } from "@/components/app/app-shell";
import { SidebarProvider } from "@/components/app/sidebar-context";
import { CommandPaletteProvider } from "@/components/app/command-palette-context";
import { CommandPalette } from "@/components/app/command-palette";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  return (
    <SidebarProvider>
      <CommandPaletteProvider>
        <div className="min-h-dvh bg-void">
          <Topbar user={user} />
          <AppShell user={user}>{children}</AppShell>
          <CommandPalette />
        </div>
      </CommandPaletteProvider>
    </SidebarProvider>
  );
}
