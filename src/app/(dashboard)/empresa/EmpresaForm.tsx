"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveEmpresa } from "./actions";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { FileUpload } from "primereact/fileupload";
import { Empresa } from "@prisma/client";

export function EmpresaForm({ empresa }: { empresa: Empresa | null }) {
  const [state, formAction, isPending] = useActionState(saveEmpresa, undefined);
  const toast = useRef<Toast>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(empresa?.logoUrl || null);
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Datos de la empresa guardados' });
    } else if (state?.error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: state.error });
    }
  }, [state]);

  const onLogoSelect = (e: any) => {
    const file = e.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
      setRemoveLogo(false);
    }
  };

  const onLogoClear = () => {
    setLogoPreview(empresa?.logoUrl || null);
    setRemoveLogo(false);
  };

  return (
    <>
      <Toast ref={toast} />
      <form action={formAction} className="grid formgrid p-fluid">
        {/* Hidden inputs para estado de logo */}
        <input type="hidden" name="existingLogoUrl" value={empresa?.logoUrl || ""} />
        <input type="hidden" name="removeLogo" value={removeLogo.toString()} />

        <div className="col-12 lg:col-8">
          <div className="surface-card shadow-1 p-4 border-round mb-4">
            <h5 className="text-xl font-bold mb-4 border-bottom-1 surface-border pb-3">Información General</h5>
            <div className="grid formgrid">
              <div className="field col-12 md:col-6">
                <label htmlFor="nombre" className="font-medium text-700">Razón Social / Nombre Comercial *</label>
                <InputText id="nombre" name="nombre" defaultValue={empresa?.nombre} required />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="ruc" className="font-medium text-700">RUC *</label>
                <InputText id="ruc" name="ruc" defaultValue={empresa?.ruc} required />
              </div>
              <div className="field col-12">
                <label htmlFor="direccion" className="font-medium text-700">Dirección</label>
                <InputText id="direccion" name="direccion" defaultValue={empresa?.direccion || ""} />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="telefono" className="font-medium text-700">Teléfono Fijo</label>
                <InputText id="telefono" name="telefono" defaultValue={empresa?.telefono || ""} />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="correo" className="font-medium text-700">Correo Electrónico</label>
                <InputText id="correo" name="correo" type="email" defaultValue={empresa?.correo || ""} />
              </div>
            </div>
          </div>

          <div className="surface-card shadow-1 p-4 border-round">
            <h5 className="text-xl font-bold mb-4 border-bottom-1 surface-border pb-3">Datos del Emisor</h5>
            <div className="grid formgrid">
              <div className="field col-12 md:col-4">
                <label htmlFor="emisorNombre" className="font-medium text-700">Nombre del Emisor</label>
                <InputText id="emisorNombre" name="emisorNombre" defaultValue={empresa?.emisorNombre || ""} />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="emisorCargo" className="font-medium text-700">Cargo</label>
                <InputText id="emisorCargo" name="emisorCargo" defaultValue={empresa?.emisorCargo || ""} />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="emisorCelular" className="font-medium text-700">Celular / WhatsApp</label>
                <InputText id="emisorCelular" name="emisorCelular" defaultValue={empresa?.emisorCelular || ""} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 lg:col-4">
          <div className="surface-card shadow-1 p-4 border-round mb-4">
            <h5 className="text-xl font-bold mb-4 border-bottom-1 surface-border pb-3">Logo de la Empresa</h5>
            
            <div className="flex flex-column align-items-center justify-content-center mb-4">
              {logoPreview && !removeLogo ? (
                <div className="relative border-1 surface-border border-round p-2 w-full flex justify-content-center bg-white" style={{ height: '200px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  <Button 
                    type="button" 
                    icon="pi pi-times" 
                    rounded 
                    severity="danger" 
                    className="absolute" 
                    style={{ top: '-10px', right: '-10px' }} 
                    onClick={() => {
                      setLogoPreview(null);
                      setRemoveLogo(true);
                    }}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed surface-border border-round p-4 w-full flex flex-column align-items-center justify-content-center text-500" style={{ height: '200px' }}>
                  <i className="pi pi-image text-4xl mb-2"></i>
                  <span>Sin logo seleccionado</span>
                </div>
              )}
            </div>

            <FileUpload 
              name="logo" 
              accept="image/*" 
              maxFileSize={2000000} 
              mode="basic"
              chooseLabel="Seleccionar Logo"
              className="w-full"
              onSelect={onLogoSelect}
              onClear={onLogoClear}
              customUpload
              auto={false}
            />
            <small className="block text-500 mt-2 text-center">Formatos soportados: JPG, PNG, SVG. Máx 2MB.</small>
          </div>

          <div className="surface-card shadow-1 p-4 border-round">
            <Button 
              type="submit" 
              label="Guardar Configuración" 
              icon="pi pi-save" 
              size="large"
              loading={isPending} 
              className="w-full" 
            />
          </div>
        </div>
      </form>
    </>
  );
}
