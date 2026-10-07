import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CotizacionForm } from "../CotizacionForm";

export default async function EditarCotizacionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  // Cargar la cotización existente
  const cotizacionDB = await db.cotizacion.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { orden: "asc" }
      }
    }
  });

  if (!cotizacionDB) {
    notFound();
  }

  // Cargar catálogos para los Dropdowns
  const clientes = await db.cliente.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, rucCedula: true, direccion: true, telefono: true, correo: true },
    orderBy: { nombre: "asc" }
  });

  // Asegurar que el cliente de la cotización esté en la lista aunque se haya desactivado
  if (!clientes.find(c => c.id === cotizacionDB.clienteId)) {
    const missingClient = await db.cliente.findUnique({ 
      where: { id: cotizacionDB.clienteId },
      select: { id: true, nombre: true, rucCedula: true, direccion: true, telefono: true, correo: true }
    });
    if (missingClient) clientes.push(missingClient);
  }

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

  // Mapear Decimal a Number para la serialización de Server a Client
  const cotizacion = {
    ...cotizacionDB,
    subtotal: Number(cotizacionDB.subtotal),
    descuentoTotal: Number(cotizacionDB.descuentoTotal),
    ivaTotal: Number(cotizacionDB.ivaTotal),
    total: Number(cotizacionDB.total),
    items: cotizacionDB.items.map(item => ({
      ...item,
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
      descuento: Number(item.descuento),
      iva: Number(item.iva),
      subtotal: Number(item.subtotal)
    }))
  };

  return (
    <div>
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <div className="flex-order-2 md:flex-order-1">
          <h1 className="text-3xl font-bold m-0 text-900">
            Detalle de Cotización <span className="text-primary">{cotizacion.numero}</span>
          </h1>
          <p className="text-600 mt-2">Puedes revisar y editar los datos de esta cotización antes de enviarla.</p>
        </div>
        <div className="flex-order-1 md:flex-order-2">
          <Link href="/cotizaciones" className="p-button p-button-outlined p-button-secondary p-2" style={{ textDecoration: 'none' }}>
            <i className="pi pi-arrow-left mr-2"></i>
            <span className="font-bold">Volver a Cotizaciones</span>
          </Link>
        </div>
      </div>
      
      <CotizacionForm clientes={clientes} productos={productos} cotizacion={cotizacion} />
    </div>
  );
}
