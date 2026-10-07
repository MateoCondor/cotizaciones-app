import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmpresaForm } from "./EmpresaForm";

export default async function EmpresaPage() {
  const session = await auth();

  // Protección de ruta: Solo ADMIN puede editar la empresa
  if (session?.user?.rol !== "ADMIN") {
    redirect("/dashboard");
  }

  // Obtener el registro único de la empresa (si existe)
  const empresa = await db.empresa.findFirst();

  return (
    <div>
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold m-0 text-900">Configuración de la Empresa</h1>
          <p className="text-600 mt-2">Gestiona los datos principales que aparecerán en los membretes de las cotizaciones.</p>
        </div>
      </div>
      
      <EmpresaForm empresa={empresa} />
    </div>
  );
}
