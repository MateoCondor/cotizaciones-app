import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UsuariosTable } from "./UsuariosTable";

export default async function UsuariosPage() {
  const session = await auth();

  // Protección: Solo administradores pueden ver esta página
  if (session?.user?.rol !== "ADMIN") {
    redirect("/dashboard");
  }

  const usuarios = await db.user.findMany({
    select: {
      id: true,
      email: true,
      nombre: true,
      rol: true,
      activo: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <UsuariosTable usuarios={usuarios} />;
}
