"use client";

import { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";
import { Cliente } from "@prisma/client";
import { saveCliente, toggleClienteStatus } from "./actions";
import { ClienteFormData } from "@/lib/validations/cliente";

export function ClientesTable({ clientes }: { clientes: Cliente[] }) {
  const [clientesList, setClientesList] = useState<Cliente[]>(clientes);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ClienteFormData>({ nombre: "", rucCedula: "", activo: true });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const toast = useRef<Toast>(null);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value as any;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const openNew = () => {
    setFormData({ nombre: "", rucCedula: "", direccion: "", telefono: "", correo: "", activo: true });
    setDialogVisible(true);
  };

  const editCliente = (cliente: Cliente) => {
    setFormData({
      id: cliente.id,
      nombre: cliente.nombre,
      rucCedula: cliente.rucCedula,
      direccion: cliente.direccion || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || "",
      activo: cliente.activo,
    });
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveCliente(formData);
    setIsSaving(false);

    if (res.success) {
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente guardado' });
      setDialogVisible(false);
      // Actualizar tabla localmente for simplicity in this demo, real revalidatePath happens on server
      if (formData.id) {
        setClientesList(prev => prev.map(c => c.id === formData.id ? { ...c, ...formData } as Cliente : c));
      } else {
        // Recargar la página es más seguro para obtener el nuevo ID, o revalidatePath se encarga
        window.location.reload();
      }
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error });
    }
  };

  const handleToggleStatus = async (cliente: Cliente) => {
    const newStatus = !cliente.activo;
    const res = await toggleClienteStatus(cliente.id, newStatus);
    if (res.success) {
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: `Cliente ${newStatus ? 'activado' : 'desactivado'}` });
      setClientesList(prev => prev.map(c => c.id === cliente.id ? { ...c, activo: newStatus } : c));
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error });
    }
  };

  const actionBodyTemplate = (rowData: Cliente) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" outlined className="p-button-sm" onClick={() => editCliente(rowData)} style={{ gap: '0.5rem' }} > Editar </Button>
        <Button
          icon={rowData.activo ? "pi pi-ban" : "pi pi-check"}
          
          outlined
          severity={rowData.activo ? "danger" : "success"}
          className="p-button-sm"
          onClick={() => handleToggleStatus(rowData)}
          tooltip={rowData.activo ? "Desactivar" : "Activar"}
          style={{ gap: '0.5rem' }}
        > {rowData.activo ? "Desactivar" : "Activar"} </Button> 
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-3 align-items-center justify-content-between p-2">
      <h4 className="m-0">Administrar Clientes</h4>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText type="search" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar Cedula o Cliente..." className="w-full sm:w-auto" />
      </IconField>
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="mb-4">
        <Button label="Nuevo Cliente" icon="pi pi-plus" onClick={openNew} />
      </div>

      <DataTable
        value={clientesList}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={['nombre', 'rucCedula', 'correo']}
        header={header}
        emptyMessage="No se encontraron clientes."
        className="p-datatable-sm"
      >
        <Column field="rucCedula" header="RUC/Cédula" sortable />
        <Column field="nombre" header="Razón Social / Nombre" sortable />
        <Column field="correo" header="Correo" sortable />
        <Column
          field="activo"
          header="Estado"
          sortable
          body={(rowData) => (
            <Tag severity={rowData.activo ? "success" : "danger"} value={rowData.activo ? "Activo" : "Inactivo"} />
          )}
        />
        <Column header="Opciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '14rem' }} />
      </DataTable>

      <Dialog visible={dialogVisible} style={{ width: '450px' }} header="Detalle del Cliente" modal className="p-fluid" onHide={hideDialog}>
        <div className="field">
          <label htmlFor="nombre">Razón Social / Nombre *</label>
          <InputText
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="rucCedula">RUC o Cédula *</label>
          <InputText
            id="rucCedula"
            value={formData.rucCedula}
            onChange={(e) => setFormData({ ...formData, rucCedula: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="direccion">Dirección</label>
          <InputText
            id="direccion"
            value={formData.direccion || ""}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="telefono">Teléfono</label>
          <InputText
            id="telefono"
            value={formData.telefono || ""}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="correo">Correo Electrónico</label>
          <InputText
            id="correo"
            type="email"
            value={formData.correo || ""}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          />
        </div>
        <div className="flex justify-content-end gap-2 mt-4">
          <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
          <Button label="Guardar" icon="pi pi-check" onClick={handleSave} loading={isSaving} />
        </div>
      </Dialog>
    </div>
  );
}
