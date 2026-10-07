"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

type Usuario = {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  createdAt: Date;
};

export function UsuariosTable({ usuarios }: { usuarios: Usuario[] }) {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
      <p className="mb-4 text-600">Listado de usuarios registrados en el sistema.</p>

      <DataTable value={usuarios} paginator rows={10} dataKey="id" emptyMessage="No se encontraron usuarios.">
        <Column field="nombre" header="Nombre" sortable />
        <Column field="email" header="Email" sortable />
        <Column 
          field="rol" 
          header="Rol" 
          sortable 
          body={(rowData) => (
            <Tag 
              severity={rowData.rol === "ADMIN" ? "danger" : "info"} 
              value={rowData.rol} 
            />
          )} 
        />
        <Column 
          field="activo" 
          header="Estado" 
          sortable 
          body={(rowData) => (
            <Tag 
              severity={rowData.activo ? "success" : "warning"} 
              value={rowData.activo ? "Activo" : "Inactivo"} 
            />
          )} 
        />
        <Column 
          header="Fecha Registro" 
          body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()} 
        />
      </DataTable>
    </div>
  );
}
