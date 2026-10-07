import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CotizacionesTable } from "./CotizacionesTable";

export default async function CotizacionesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const cotizacionesDB = await db.cotizacion.findMany({
    include: {
      cliente: {
        select: { nombre: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const cotizaciones = cotizacionesDB.map(c => ({
    id: c.id,
    numero: c.numero,
    fechaEmision: c.fechaEmision,
    estado: c.estado,
    cliente: { nombre: c.cliente.nombre },
    total: Number(c.total)
  }));

  return (
    <div>
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold m-0 text-900">Cotizaciones</h1>
          <p className="text-600 mt-2">Crea, edita y haz seguimiento de todas las proformas y cotizaciones enviadas.</p>
        </div>
      </div>
      
      <CotizacionesTable cotizaciones={cotizaciones} />
    </div>
  );
}
