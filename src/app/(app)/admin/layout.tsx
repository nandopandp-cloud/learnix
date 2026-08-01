import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  // Defesa no servidor: o middleware só checa a sessão, não o papel.
  if (!user) redirect("/entrar");
  if (user.role !== "admin") redirect("/inicio");

  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
}
