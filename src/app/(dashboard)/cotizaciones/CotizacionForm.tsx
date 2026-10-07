"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { saveCotizacion } from "./actions";
import { CotizacionFormData, ItemCotizacionFormData } from "@/lib/validations/cotizacion";
import { saveCliente } from "@/app/(dashboard)/clientes/actions";

type ClienteShort = { id: string; nombre: string; rucCedula: string; direccion: string | null; telefono: string | null; correo: string | null };
type ProductoShort = { id: string; sku: string; nombre: string; descripcion: string | null; precioUnitario: number; ivaAplicable: number };

export function CotizacionForm({ 
  clientes, 
  productos,
  cotizacion // Datos iniciales si estamos editando
}: { 
  clientes: ClienteShort[], 
  productos: ProductoShort[],
  cotizacion?: any 
}) {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de la cotización
  const [fechaEmision, setFechaEmision] = useState<Date>(cotizacion ? new Date(cotizacion.fechaEmision) : new Date());
  
  const vDate = new Date();
  vDate.setDate(vDate.getDate() + 7);
  const [fechaVencimiento, setFechaVencimiento] = useState<Date>(cotizacion ? new Date(cotizacion.fechaVencimiento) : vDate);

  const [clienteId, setClienteId] = useState<string>(cotizacion ? cotizacion.clienteId : "");
  const [condicionesPago, setCondicionesPago] = useState<string>(cotizacion?.condicionesPago || "");
  const [plazoEntrega, setPlazoEntrega] = useState<string>(cotizacion?.plazoEntrega || "");
  const [observaciones, setObservaciones] = useState<string>(cotizacion?.observaciones || "");

  // Manejo inline de cliente
  const emptyClient = { id: "", nombre: "", rucCedula: "", direccion: "", telefono: "", correo: "" };
  const [clientData, setClientData] = useState(emptyClient);
  const [originalClientData, setOriginalClientData] = useState(emptyClient);
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);

  // Cuando cambia el clienteId, o en carga inicial, poblamos los campos inline
  useEffect(() => {
    if (clienteId) {
      const selected = clientes.find(c => c.id === clienteId);
      if (selected) {
        const mapped = {
          id: selected.id,
          nombre: selected.nombre,
          rucCedula: selected.rucCedula,
          direccion: selected.direccion || "",
          telefono: selected.telefono || "",
          correo: selected.correo || ""
        };
        setClientData(mapped);
        setOriginalClientData(mapped);
        setIsNewClientMode(false);
      }
    }
  }, [clienteId, clientes]);

  const handleSelectClient = (id: string) => {
    setClienteId(id);
  };

  const handleCreateNewClientClick = () => {
    setClienteId("");
    setClientData(emptyClient);
    setOriginalClientData(emptyClient);
    setIsNewClientMode(true);
  };

  const handleCancelNewClient = () => {
    setIsNewClientMode(false);
    setClientData(emptyClient);
  };

  const isClientChanged = () => {
    if (isNewClientMode) {
      return clientData.nombre.trim() !== "" || clientData.rucCedula.trim() !== "";
    }
    if (!clienteId) return false;
    return (
      clientData.nombre !== originalClientData.nombre ||
      clientData.rucCedula !== originalClientData.rucCedula ||
      clientData.direccion !== originalClientData.direccion ||
      clientData.telefono !== originalClientData.telefono ||
      clientData.correo !== originalClientData.correo
    );
  };

  const handleSaveClientInline = async () => {
    if (!clientData.nombre || !clientData.rucCedula) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Nombre y RUC/Cédula son requeridos' });
      return;
    }
    setIsSavingClient(true);
    const payload = { ...clientData, activo: true };
    const res = await saveCliente(payload);
    setIsSavingClient(false);

    if (res.success && res.clientId) {
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Datos del cliente guardados correctamente' });
      
      // Actualizamos estado local
      const updatedOriginal = { ...clientData, id: res.clientId };
      setClientData(updatedOriginal);
      setOriginalClientData(updatedOriginal);
      setClienteId(res.clientId);
      setIsNewClientMode(false);

      // Refrescar para que el dropdown reciba la versión más nueva
      router.refresh();
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error || "Error al guardar el cliente" });
    }
  };


  // Inicializar items si estamos editando
  const [items, setItems] = useState<ItemCotizacionFormData[]>(() => {
    if (cotizacion && cotizacion.items) {
      return cotizacion.items.map((i: any) => ({
        productoId: i.productoId,
        nombre: i.nombre,
        descripcion: i.descripcion,
        cantidad: Number(i.cantidad),
        precioUnitario: Number(i.precioUnitario),
        descuento: Number(i.descuento),
        tipoDescuento: i.tipoDescuento,
        iva: Number(i.iva),
        subtotal: Number(i.subtotal)
      }));
    }
    return [];
  });

  const addItem = () => {
    setItems([...items, { nombre: "", cantidad: 1, precioUnitario: 0, descuento: 0, tipoDescuento: "PORCENTAJE", iva: 15, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof ItemCotizacionFormData, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleProductSelect = (index: number, productoId: string) => {
    const prod = productos.find(p => p.id === productoId);
    if (prod) {
      const newItems = [...items];
      
      const combinedName = prod.descripcion 
        ? `${prod.nombre} - ${prod.descripcion}` 
        : prod.nombre;

      newItems[index] = {
        ...newItems[index],
        productoId: prod.id,
        nombre: combinedName,
        precioUnitario: prod.precioUnitario,
        iva: prod.ivaAplicable
      };
      setItems(newItems);
    }
  };

  const { subtotalGlobal, descuentoGlobal, ivaGlobal, totalGlobal } = useMemo(() => {
    let subtotal = 0; let descuentoTotal = 0; let ivaTotal = 0;
    items.forEach(item => {
      const itemBruto = (item.cantidad || 0) * (item.precioUnitario || 0);
      const descValor = item.tipoDescuento === "PORCENTAJE" ? itemBruto * ((item.descuento || 0) / 100) : (item.descuento || 0);
      const itemNeto = itemBruto - descValor;
      const itemIva = itemNeto * ((item.iva || 0) / 100);

      subtotal += itemBruto; descuentoTotal += descValor; ivaTotal += itemIva;
    });
    return { subtotalGlobal: subtotal, descuentoGlobal: descuentoTotal, ivaGlobal: ivaTotal, totalGlobal: subtotal - descuentoTotal + ivaTotal };
  }, [items]);

  const handleSubmit = async () => {
    if (!clienteId && !isNewClientMode) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar o guardar un cliente primero' });
      return;
    }
    if (isClientChanged()) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Tiene cambios sin guardar en los datos del cliente. Por favor guarde el cliente primero.' });
      return;
    }
    if (items.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Debe añadir al menos un producto' });
      return;
    }
    for (const item of items) {
      if (!item.nombre || item.cantidad <= 0 || item.precioUnitario < 0) {
        toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Revise que todos los items tengan nombre, cantidad y precio válido' });
        return;
      }
    }

    setIsSaving(true);
    const data: CotizacionFormData = {
      id: cotizacion?.id,
      numero: cotizacion?.numero,
      fechaEmision,
      fechaVencimiento,
      estado: cotizacion?.estado || "BORRADOR",
      clienteId,
      condicionesPago,
      plazoEntrega,
      observaciones,
      items
    };

    const res = await saveCotizacion(data);
    setIsSaving(false);

    if (res.success) {
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cotización guardada correctamente' });
      setTimeout(() => router.push(`/cotizaciones/${res.cotizacionId}/pdf`), 1000);
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error });
    }
  };

  const productBodyTemplate = (rowData: any, options: any) => (
    <Dropdown value={rowData.productoId} options={productos} optionLabel="nombre" optionValue="id" onChange={(e) => handleProductSelect(options.rowIndex, e.value)} placeholder="Seleccione..." filter className="w-full" />
  );
  const nombreBodyTemplate = (rowData: any, options: any) => (
    <InputText value={rowData.nombre} onChange={(e) => updateItem(options.rowIndex, "nombre", e.target.value)} className="w-full" />
  );
  const cantidadBodyTemplate = (rowData: any, options: any) => (
    <InputNumber value={rowData.cantidad} onValueChange={(e) => updateItem(options.rowIndex, "cantidad", e.value || 0)} min={0.01} maxFractionDigits={2} className="w-full" inputClassName="w-full" />
  );
  const precioBodyTemplate = (rowData: any, options: any) => (
    <InputNumber value={rowData.precioUnitario} onValueChange={(e) => updateItem(options.rowIndex, "precioUnitario", e.value || 0)} mode="currency" currency="USD" locale="en-US" min={0} className="w-full" inputClassName="w-full" />
  );
  const descuentoBodyTemplate = (rowData: any, options: any) => (
    <div className="p-inputgroup w-full">
      <InputNumber value={rowData.descuento} onValueChange={(e) => updateItem(options.rowIndex, "descuento", e.value || 0)} min={0} inputClassName="w-full" />
      <span className="p-inputgroup-addon cursor-pointer bg-primary text-white" onClick={() => updateItem(options.rowIndex, "tipoDescuento", rowData.tipoDescuento === "PORCENTAJE" ? "VALOR" : "PORCENTAJE")}>
        {rowData.tipoDescuento === "PORCENTAJE" ? "%" : "$"}
      </span>
    </div>
  );
  const ivaBodyTemplate = (rowData: any, options: any) => (
    <Dropdown value={rowData.iva} options={[{ label: "15%", value: 15 }, { label: "5%", value: 5 }, { label: "0%", value: 0 }]} onChange={(e) => updateItem(options.rowIndex, "iva", e.value)} className="w-full max-w-7rem" />
  );
  const itemSubtotalTemplate = (rowData: any) => {
    const bruto = (rowData.cantidad || 0) * (rowData.precioUnitario || 0);
    const desc = rowData.tipoDescuento === "PORCENTAJE" ? bruto * ((rowData.descuento || 0) / 100) : (rowData.descuento || 0);
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(bruto - desc);
  };
  const deleteBodyTemplate = (_: any, options: any) => (
    <Button icon="pi pi-trash" outlined  severity="danger" onClick={() => removeItem(options.rowIndex)} style={{ gap: '0.5rem' }}>Quitar</Button>
  );

  return (
    <div className="grid">
      <Toast ref={toast} />

      {/* Cabecera Maestro */}
      <div className="col-12 lg:col-9">
        <div className="surface-card shadow-1 p-4 border-round mb-4">
          <h5 className="text-xl font-bold mb-4 border-bottom-1 surface-border pb-3">Datos Generales</h5>
          <div className="grid formgrid p-fluid">
            
            <div className="field col-12 md:col-6">
              <label className="font-medium text-700">Seleccionar Cliente Existente</label>
              <div className="p-inputgroup">
                <Dropdown 
                  value={clienteId} 
                  options={clientes} 
                  optionLabel="nombre" 
                  optionValue="id"
                  onChange={(e) => handleSelectClient(e.value)} 
                  placeholder="Buscar en el catálogo..." 
                  filter
                  disabled={isNewClientMode}
                />
                {!isNewClientMode ? (
                  <Button icon="pi pi-user-plus" onClick={handleCreateNewClientClick} tooltip="Crear Nuevo Cliente" />
                ) : (
                  <Button icon="pi pi-times" onClick={handleCancelNewClient} tooltip="Cancelar Nuevo Cliente" severity="secondary" />
                )}
              </div>
            </div>

            <div className="field col-12 md:col-3">
              <label className="font-medium text-700">Fecha Emisión *</label>
              <Calendar value={fechaEmision} onChange={(e) => setFechaEmision(e.value as Date)} dateFormat="dd/mm/yy" showIcon />
            </div>
            <div className="field col-12 md:col-3">
              <label className="font-medium text-700">Fecha Vencimiento *</label>
              <Calendar value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.value as Date)} dateFormat="dd/mm/yy" showIcon />
            </div>

            {/* Inline Client Fields - Shows when editing an existing client or creating a new one */}
            {(clienteId || isNewClientMode) && (
              <div className="col-12 mt-3 p-3 surface-100 border-round">
                <h4 className="mt-0 mb-3 text-700">
                  {isNewClientMode ? "Ingresando Nuevo Cliente" : "Datos del Cliente Seleccionado"}
                </h4>
                <div className="grid formgrid p-fluid">
                  <div className="field col-12 md:col-6">
                    <label className="text-sm">Razón Social / Nombre *</label>
                    <InputText value={clientData.nombre} onChange={(e) => setClientData({...clientData, nombre: e.target.value})} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label className="text-sm">RUC / Cédula *</label>
                    <InputText value={clientData.rucCedula} onChange={(e) => setClientData({...clientData, rucCedula: e.target.value})} />
                  </div>
                  <div className="field col-12 md:col-4">
                    <label className="text-sm">Correo</label>
                    <InputText type="email" value={clientData.correo} onChange={(e) => setClientData({...clientData, correo: e.target.value})} />
                  </div>
                  <div className="field col-12 md:col-4">
                    <label className="text-sm">Teléfono</label>
                    <InputText value={clientData.telefono} onChange={(e) => setClientData({...clientData, telefono: e.target.value})} />
                  </div>
                  <div className="field col-12 md:col-4">
                    <label className="text-sm">Dirección</label>
                    <InputText value={clientData.direccion} onChange={(e) => setClientData({...clientData, direccion: e.target.value})} />
                  </div>
                  
                  {isClientChanged() && (
                    <div className="col-12 flex justify-content-end mt-2">
                      <Button 
                        label={isNewClientMode ? "Crear y Seleccionar Cliente" : "Actualizar Datos del Cliente"} 
                        icon="pi pi-save" 
                        severity="success"
                        size="small"
                        loading={isSavingClient}
                        onClick={handleSaveClientInline}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Detalle Items */}
        <div className="surface-card shadow-1 p-4 border-round mb-4">
          <div className="flex justify-content-between align-items-center mb-4 border-bottom-1 surface-border pb-3">
            <h5 className="text-xl font-bold m-0">Productos / Servicios</h5>
            <Button label="Añadir Fila" icon="pi pi-plus" size="small" onClick={addItem} outlined />
          </div>

          <DataTable value={items} emptyMessage="No hay productos agregados. Haz clic en 'Añadir Fila'." className="p-datatable-sm" scrollable tableStyle={{ minWidth: '75rem' }}>
            <Column header="Catálogo" body={productBodyTemplate} style={{ width: '20%', minWidth: '160px' }} />
            <Column header="Descripción" body={nombreBodyTemplate} style={{ width: '25%', minWidth: '180px' }} />
            <Column header="Cant." body={cantidadBodyTemplate} style={{ width: '10%', minWidth: '80px' }} />
            <Column header="Precio U." body={precioBodyTemplate} style={{ width: '12%', minWidth: '110px' }} />
            <Column header="Dscto." body={descuentoBodyTemplate} style={{ width: '12%', minWidth: '120px' }} />
            <Column header="IVA" body={ivaBodyTemplate} style={{ width: '8%', minWidth: '80px' }} />
            <Column header="Subtotal" body={itemSubtotalTemplate} style={{ width: '8%', minWidth: '100px' }} align="center"/>
            <Column header="Eliminar" body={deleteBodyTemplate} style={{ width: '3%', minWidth: '50px' }} align="center" />
          </DataTable>
        </div>

        {/* Condiciones Adicionales */}
        <div className="surface-card shadow-1 p-4 border-round">
          <h5 className="text-xl font-bold mb-4 border-bottom-1 surface-border pb-3">Condiciones y Observaciones</h5>
          <div className="grid formgrid p-fluid">
            <div className="field col-12 md:col-6">
              <label className="font-medium text-700">Condiciones de Pago</label>
              <InputText value={condicionesPago} onChange={(e) => setCondicionesPago(e.target.value)} placeholder="Ej: Contado, Crédito 30 días..." />
            </div>
            <div className="field col-12 md:col-6">
              <label className="font-medium text-700">Plazo de Entrega</label>
              <InputText value={plazoEntrega} onChange={(e) => setPlazoEntrega(e.target.value)} placeholder="Ej: Inmediata, 15 días hábiles..." />
            </div>
            <div className="field col-12">
              <label className="font-medium text-700">Observaciones (Aparecerán en el PDF)</label>
              <InputTextarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Panel Lateral: Totales y Acciones */}
      <div className="col-12 lg:col-3">
        <div className="surface-card shadow-1 p-4 border-round sticky" style={{ top: '6rem' }}>
          <h4 className="text-xl font-bold mb-4 border-bottom-1 surface-border pb-3">Resumen</h4>
          
          <div className="flex justify-content-between mb-3">
            <span className="text-600">Subtotal</span>
            <span className="font-semibold">{new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(subtotalGlobal)}</span>
          </div>
          
          {descuentoGlobal > 0 && (
            <div className="flex justify-content-between mb-3 text-red-500">
              <span>Descuento</span>
              <span className="font-semibold">-{new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(descuentoGlobal)}</span>
            </div>
          )}
          
          <div className="flex justify-content-between mb-3">
            <span className="text-600">IVA</span>
            <span className="font-semibold">{new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(ivaGlobal)}</span>
          </div>
          
          <hr className="my-3 border-top-1 surface-border" />
          
          <div className="flex justify-content-between mb-4">
            <span className="text-900 font-bold text-xl">TOTAL</span>
            <span className="text-primary font-bold text-xl">{new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(totalGlobal)}</span>
          </div>

          <Button 
            label={cotizacion ? "Actualizar Cotización" : "Guardar Cotización"}
            icon="pi pi-save" 
            className="w-full mb-2 p-3 text-lg" 
            onClick={handleSubmit} 
            loading={isSaving}
          />
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            severity="danger"  
            className="w-full p-3 text-lg" 
            onClick={() => router.push('/cotizaciones')} 
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
