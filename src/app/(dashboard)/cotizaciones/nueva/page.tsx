import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CotizacionForm } from "../CotizacionForm";

export default async function NuevaCotizacionPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Cargar catálogos para los Dropdowns
  const clientes = await db.cliente.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, rucCedula: true, direccion: true, telefono: true, correo: true },
    orderBy: { nombre: "asc" }
  });

  const productosDB = await db.producto.findMany({
    where: { activo: true },
    select: { id: true, sku: true, nombre: true, descripcion: true, precioUnitario: true, ivaAplicable: true },
    orderBy: { nombre: "asc" }
  });

  const productos = productosDB.map(p => ({
    ...p,
    precioUnitario: Number(p.precioUnitario),
    ivaAplicable: Number(p.ivaAplicable)
  }));

  return (
    <div>
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <div className="flex-order-2 md:flex-order-1">
          <h1 className="text-3xl font-bold m-0 text-900">Nueva Cotización</h1>
          <p className="text-600 mt-2">Crea una nueva proforma ingresando el cliente y los productos a cotizar.</p>
        </div>
        <div className="flex-order-1 md:flex-order-2">
          <Link href="/cotizaciones" className="p-button p-button-outlined p-button-secondary p-2" style={{ textDecoration: 'none' }}>
            <i className="pi pi-arrow-left mr-2"></i>
            <span className="font-bold">Volver a Cotizaciones</span>
          </Link>
        </div>
      </div>
      
      <CotizacionForm clientes={clientes} productos={productos} />
    </div>
  );
}
