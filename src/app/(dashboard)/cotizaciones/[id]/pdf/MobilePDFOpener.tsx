"use client";

import { usePDF } from "@react-pdf/renderer";
import { CotizacionPDF } from "@/components/pdf/CotizacionPDF";
import { Button } from "primereact/button";

export default function MobilePDFOpener({ cotizacion, empresa }: { cotizacion: any; empresa: any }) {
  const [instance] = usePDF({
    document: <CotizacionPDF cotizacion={cotizacion} empresa={empresa} />,
  });

  const handleOpen = () => {
    if (instance.url) {
      window.open(instance.url, "_blank");
    }
  };

  return (
    <Button
      label={instance.loading ? "Generando..." : "Abrir PDF"}
      icon={instance.loading ? "pi pi-spin pi-spinner" : "pi pi-eye"}
      severity="success"
      disabled={instance.loading || !!instance.error}
      onClick={handleOpen}
      className="w-full"
    />
  );
}
