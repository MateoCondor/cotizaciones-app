import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ClientLayout } from "@/components/layout/ClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <ClientLayout user={session.user}>{children}</ClientLayout>;
}
