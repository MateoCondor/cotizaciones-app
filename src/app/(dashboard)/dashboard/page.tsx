import { auth } from "@/auth";
import { db } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  // Fetching real metrics
  const totalClientes = await db.cliente.count({ where: { activo: true } });
  const totalProductos = await db.producto.count({ where: { activo: true } });
  const totalCotizaciones = await db.cotizacion.count();
  
  // Pending cotizaciones
  const cotizacionesPendientes = await db.cotizacion.count({
    where: { estado: { in: ["BORRADOR", "ENVIADA"] } }
  });

  return (
    <div>
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold m-0 text-900">Dashboard</h1>
          <p className="text-600 mt-2">Bienvenido, {session?.user?.name}. Aquí tienes un resumen.</p>
        </div>
      </div>
      
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-card shadow-1 p-3 border-round border-left-3 border-blue-500 hover:shadow-3 transition-all transition-duration-200">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">Cotizaciones Totales</span>
                <div className="text-900 font-bold text-2xl">{totalCotizaciones}</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                <i className="pi pi-file-pdf text-blue-500 text-xl"></i>
              </div>
            </div>
            <span className="text-blue-500 font-medium">{cotizacionesPendientes} pendientes </span>
            <span className="text-500">de cierre</span>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-card shadow-1 p-3 border-round border-left-3 border-green-500 hover:shadow-3 transition-all transition-duration-200">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">Clientes Activos</span>
                <div className="text-900 font-bold text-2xl">{totalClientes}</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                <i className="pi pi-users text-green-500 text-xl"></i>
              </div>
            </div>
            <span className="text-green-500 font-medium">Actualizado </span>
            <span className="text-500">recientemente</span>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-card shadow-1 p-3 border-round border-left-3 border-orange-500 hover:shadow-3 transition-all transition-duration-200">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">Productos</span>
                <div className="text-900 font-bold text-2xl">{totalProductos}</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                <i className="pi pi-box text-orange-500 text-xl"></i>
              </div>
            </div>
            <span className="text-orange-500 font-medium">Catálogo </span>
            <span className="text-500">disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
