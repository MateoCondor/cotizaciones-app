"use client";

import { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";
import { useRouter } from "next/navigation";
import { changeCotizacionState } from "./actions";

type CotizacionMapeada = {
  id: string;
  numero: string;
  fechaEmision: Date;
  estado: string;
  cliente: { nombre: string };
  total: number;
};

export function CotizacionesTable({ cotizaciones }: { cotizaciones: CotizacionMapeada[] }) {
  const router = useRouter();
  const [cotizacionesList, setCotizacionesList] = useState<CotizacionMapeada[]>(cotizaciones);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    estado: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const toast = useRef<Toast>(null);

  const estadoOptions = [
    { label: "Borrador", value: "BORRADOR" },
    { label: "Enviada", value: "ENVIADA" },
    { label: "Aceptada", value: "ACEPTADA" },
    { label: "Rechazada", value: "RECHAZADA" },
    { label: "Vencida", value: "VENCIDA" },
  ];

  const getSeverity = (estado: string) => {
    switch (estado) {
      case 'BORRADOR': return 'secondary';
      case 'ENVIADA': return 'info';
      case 'ACEPTADA': return 'success';
      case 'RECHAZADA': return 'danger';
      case 'VENCIDA': return 'warning';
      default: return null;
    }
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value as any;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const handleChangeStatus = async (id: string, nuevoEstado: string) => {
    const res = await changeCotizacionState(id, nuevoEstado);
    if (res.success) {
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado' });
      setCotizacionesList(prev => prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error });
    }
  };

  const actionBodyTemplate = (rowData: CotizacionMapeada) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" outlined className="p-button-sm" onClick={() => router.push(`/cotizaciones/${rowData.id}`)} style={{ gap: '0.5rem' }} >Editar</Button>
        <Button icon="pi pi-file-pdf" outlined severity="danger" className="p-button-sm" onClick={() => router.push(`/cotizaciones/${rowData.id}/pdf`)} style={{ gap: '0.5rem' }} >Ver PDF</Button>
        <Dropdown
          value={rowData.estado}
          options={estadoOptions}
          onChange={(e) => handleChangeStatus(rowData.id, e.value)}
          className="p-inputtext-sm w-9rem"
        />
      </div>
    );
  };

  const totalBodyTemplate = (rowData: CotizacionMapeada) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(rowData.total);
  };

  const fechaBodyTemplate = (rowData: CotizacionMapeada) => {
    return new Date(rowData.fechaEmision).toLocaleDateString();
  };

  const estadoBodyTemplate = (rowData: CotizacionMapeada) => {
    return <Tag severity={getSeverity(rowData.estado)} value={rowData.estado} />;
  };

  const header = (
    <div className="flex flex-wrap gap-3 align-items-center justify-content-between p-2">
      <h4 className="m-0">Gestión de Cotizaciones</h4>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText type="search" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar Numero o Cliente..." className="w-full sm:w-auto" />
      </IconField>
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="mb-4">
        <Button label="Nueva Cotización" icon="pi pi-plus" onClick={() => router.push('/cotizaciones/nueva')} />
      </div>

      <DataTable
        value={cotizacionesList}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={['numero', 'cliente.nombre']}
        header={header}
        emptyMessage="No se encontraron cotizaciones."
        className="p-datatable-sm"
      >
        <Column field="numero" header="Número" sortable />
        <Column field="fechaEmision" header="Fecha" body={fechaBodyTemplate} sortable />
        <Column field="cliente.nombre" header="Cliente" sortable />
        <Column field="total" header="Total" body={totalBodyTemplate} sortable />
        <Column field="estado" header="Estado" body={estadoBodyTemplate} sortable />
        <Column header="Opciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '14rem' }} />
      </DataTable>
    </div>
  );
}
