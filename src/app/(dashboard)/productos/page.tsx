import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductosTable } from "./ProductosTable";

export default async function ProductosPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const productosDB = await db.producto.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Convertir Decimal a numbers para que sean serializables de Server a Client Component
  const productos = productosDB.map(p => ({
    ...p,
    precioUnitario: Number(p.precioUnitario),
    ivaAplicable: Number(p.ivaAplicable)
  }));

  return (
    <div>
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold m-0 text-900">Catálogo de Productos</h1>
          <p className="text-600 mt-2">Gestiona el inventario de productos y servicios para tus cotizaciones.</p>
        </div>
      </div>
      
      <ProductosTable productos={productos} />
    </div>
  );
}
