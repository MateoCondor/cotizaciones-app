"use client";

import { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";
// We don't import Producto directly from @prisma/client because Prisma returns Decimal types, 
// and we mapped them to numbers in page.tsx
import { saveProducto, toggleProductoStatus } from "./actions";
import { ProductoFormData } from "@/lib/validations/producto";

type ProductoMapeado = {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  precioUnitario: number;
  ivaAplicable: number;
  activo: boolean;
};

export function ProductosTable({ productos }: { productos: ProductoMapeado[] }) {
  const [productosList, setProductosList] = useState<ProductoMapeado[]>(productos);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProductoFormData>({ 
    nombre: "", sku: "", descripcion: "", precioUnitario: 0, ivaAplicable: 15, activo: true 
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  
  const toast = useRef<Toast>(null);

  const ivaOptions = [
    { label: "15% (General)", value: 15 },
    { label: "5% (Reducido)", value: 5 },
    { label: "0% (Sin IVA)", value: 0 },
  ];

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value as any;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const openNew = () => {
    setFormData({ nombre: "", sku: "", descripcion: "", precioUnitario: 0, ivaAplicable: 15, activo: true });
    setDialogVisible(true);
  };

  const editProducto = (producto: ProductoMapeado) => {
    setFormData({
      id: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precioUnitario: producto.precioUnitario,
      ivaAplicable: producto.ivaAplicable,
      activo: producto.activo,
    });
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveProducto(formData);
    setIsSaving(false);
    
    if (res.success) {
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Producto guardado' });
      setDialogVisible(false);
      window.location.reload(); 
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error });
    }
  };

  const handleToggleStatus = async (producto: ProductoMapeado) => {
    const newStatus = !producto.activo;
    const res = await toggleProductoStatus(producto.id, newStatus);
    if (res.success) {
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: `Producto ${newStatus ? 'activado' : 'desactivado'}` });
      setProductosList(prev => prev.map(p => p.id === producto.id ? { ...p, activo: newStatus } : p));
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error });
    }
  };

  const actionBodyTemplate = (rowData: ProductoMapeado) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" outlined className="p-button-sm" onClick={() => editProducto(rowData)} style={{ gap: '0.5rem' }} > Editar </Button>
        <Button 
          icon={rowData.activo ? "pi pi-ban" : "pi pi-check"}  
          outlined 
          severity={rowData.activo ? "danger" : "success"} 
          className="p-button-sm" 
          onClick={() => handleToggleStatus(rowData)} 
          tooltip={rowData.activo ? "Desactivar" : "Activar"}
          style={{ gap: '0.5rem' }}
        >{rowData.activo ? "Desactivar" : "Activar"} </Button> 
      </div>
    );
  };

  const precioBodyTemplate = (rowData: ProductoMapeado) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(rowData.precioUnitario);
  };

  const header = (
    <div className="flex flex-wrap gap-3 align-items-center justify-content-between p-2">
      <h4 className="m-0">Administrar Productos</h4>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText type="search" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar Codigo o Producto..." className="w-full sm:w-auto" />
      </IconField>
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="mb-4">
        <Button label="Nuevo Producto" icon="pi pi-plus" onClick={openNew} />
      </div>

      <DataTable 
        value={productosList} 
        paginator 
        rows={10} 
        dataKey="id" 
        filters={filters} 
        globalFilterFields={['sku', 'nombre', 'descripcion']}
        header={header} 
        emptyMessage="No se encontraron productos."
        className="p-datatable-sm"
      >
        <Column field="sku" header="Código/SKU" sortable />
        <Column field="nombre" header="Nombre del Producto" sortable />
        <Column field="precioUnitario" header="Precio Unit." body={precioBodyTemplate} sortable />
        <Column 
          field="ivaAplicable" 
          header="Tarifa IVA" 
          sortable 
          body={(rowData) => (
            <Tag severity={rowData.ivaAplicable > 0 ? "info" : "warning"} value={`${rowData.ivaAplicable}%`} />
          )} 
        />
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

      <Dialog visible={dialogVisible} style={{ width: '450px' }} header="Detalle del Producto" modal className="p-fluid" onHide={hideDialog}>
        <div className="field">
          <label htmlFor="sku">Código/SKU</label>
          <InputText 
            id="sku" 
            value={formData.sku || ""} 
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
            placeholder="Dejar en blanco para autogenerar"
            autoFocus 
          />
          <small className="text-500">Ej: PROD-0001 (Se generará automáticamente si lo omites)</small>
        </div>
        <div className="field">
          <label htmlFor="nombre">Nombre del Producto *</label>
          <InputText 
            id="nombre" 
            value={formData.nombre} 
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
            required 
          />
        </div>
        <div className="field">
          <label htmlFor="descripcion">Descripción</label>
          <InputText 
            id="descripcion" 
            value={formData.descripcion || ""} 
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
          />
        </div>
        <div className="field">
          <label htmlFor="precioUnitario">Precio Unitario (USD) *</label>
          <InputNumber 
            id="precioUnitario" 
            value={formData.precioUnitario} 
            onValueChange={(e) => setFormData({ ...formData, precioUnitario: e.value || 0 })} 
            mode="currency" 
            currency="USD" 
            locale="en-US" 
            min={0}
            required
          />
        </div>
        <div className="field mt-4">
          <label htmlFor="ivaAplicable">Tarifa IVA Aplicable *</label>
          <Dropdown 
            id="ivaAplicable" 
            value={formData.ivaAplicable} 
            options={ivaOptions} 
            onChange={(e) => setFormData({ ...formData, ivaAplicable: e.value })} 
            placeholder="Seleccione Tarifa" 
            className="w-full"
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
