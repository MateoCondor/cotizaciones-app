import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClientesTable } from "./ClientesTable";

export default async function ClientesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const clientes = await db.cliente.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold m-0 text-900">Directorio de Clientes</h1>
          <p className="text-600 mt-2">Gestiona tu base de datos de clientes para las cotizaciones.</p>
        </div>
      </div>
      
      <ClientesTable clientes={clientes} />
    </div>
  );
}
