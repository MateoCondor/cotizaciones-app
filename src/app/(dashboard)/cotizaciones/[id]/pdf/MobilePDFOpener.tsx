"use client";

import { useRef } from "react";
import { usePDF } from "@react-pdf/renderer";
import { CotizacionPDF } from "@/components/pdf/CotizacionPDF";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { sharePDF } from "./PDFShareButton";

interface MobilePDFOpenerProps {
  cotizacion: any;
  empresa: any;
}

export default function MobilePDFOpener({
  cotizacion,
  empresa,
}: MobilePDFOpenerProps) {
  const [instance] = usePDF({
    document: <CotizacionPDF cotizacion={cotizacion} empresa={empresa} />,
  });
  const toast = useRef<Toast>(null);

  const fileName = `Cotizacion_${cotizacion.numero || "documento"}.pdf`;

  // Forzar la descarga del archivo en el dispositivo
  const triggerDownload = () => {
    if (!instance.url) return;
    const link = document.createElement("a");
    link.href = instance.url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Abrir PDF en nueva pestaña/visor nativo
  const handleOpen = () => {
    if (instance.url) {
      window.open(instance.url, "_blank");
    }
  };

  // Solo descargar
  const handleDownloadOnly = () => {
    if (instance.loading) return;
    triggerDownload();
    toast.current?.show({
      severity: "success",
      summary: "Descargando",
      detail: `Se está descargando ${fileName}`,
      life: 3000,
    });
  };

  // Compartir archivo nativamente (WhatsApp, etc.) usando la función reusable
  const handleShare = async () => {
    if (!instance.blob || instance.loading) return;

    await sharePDF({
      blob: instance.blob,
      numero: cotizacion.numero,
      empresaNombre: empresa?.nombre,
      onWarn: (msg) => {
        toast.current?.show({
          severity: "warn",
          summary: "No se puede compartir directamente",
          detail: msg,
          life: 6000,
        });
      },
    });
  };

  return (
    <div className="flex flex-column gap-2 w-full mt-2">
      <Toast ref={toast} />

      {/* 1. Botón Abrir PDF */}
      <Button
        label={instance.loading ? "Generando..." : "Abrir PDF"}
        icon={instance.loading ? "pi pi-spin pi-spinner" : "pi pi-eye"}
        severity="info"
        disabled={instance.loading || !!instance.error}
        onClick={handleOpen}
        className="w-full"
      />

      {/* 2. Botón Descargar PDF */}
      <Button
        label={instance.loading ? "Generando..." : "Descargar PDF"}
        icon={instance.loading ? "pi pi-spin pi-spinner" : "pi pi-download"}
        severity="danger"
        disabled={instance.loading || !!instance.error}
        onClick={handleDownloadOnly}
        className="w-full"
      />

      {/* 3. Botón Compartir (WhatsApp) */}
      <Button
        label={instance.loading ? "Generando..." : "Compartir PDF"}
        icon={instance.loading ? "pi pi-spin pi-spinner" : "pi pi-whatsapp"}
        disabled={instance.loading || !!instance.error}
        onClick={handleShare}
        className="w-full font-bold shadow-1"
        style={{
          backgroundColor: "#25D366",
          borderColor: "#25D366",
          color: "#ffffff",
        }}
      />
    </div>
  );
}
