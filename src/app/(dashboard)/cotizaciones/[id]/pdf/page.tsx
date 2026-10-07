import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import PDFClientViewer from "./PDFClientViewer";

export default async function GenerarPDFPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  // 1. Cargar Cotización con Cliente e Items
  const cotizacionDB = await db.cotizacion.findUnique({
    where: { id },
    include: {
      cliente: true,
      items: {
        orderBy: { orden: "asc" }
      }
    }
  });

  if (!cotizacionDB) {
    notFound();
  }

  // 2. Cargar Empresa (primer registro)
  const empresaDB = await db.empresa.findFirst();

  // 3. Mapear Decimals a Numbers para evitar error de Server Component to Client Component
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
    <div className="h-full">
      <PDFClientViewer cotizacion={cotizacion} empresa={empresaDB} />
    </div>
  );
}
