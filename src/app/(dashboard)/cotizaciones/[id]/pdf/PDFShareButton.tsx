"use client";

import { useRef } from "react";
import { usePDF } from "@react-pdf/renderer";
import { CotizacionPDF } from "@/components/pdf/CotizacionPDF";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

export interface SharePDFParams {
  blob: Blob | null;
  numero: string;
  empresaNombre?: string;
  onWarn?: (msg: string) => void;
}

/**
 * Función reutilizable para compartir el archivo PDF nativamente (WhatsApp, etc.)
 */
export async function sharePDF({
  blob,
  numero,
  empresaNombre,
  onWarn,
}: SharePDFParams): Promise<boolean> {
  if (!blob) return false;

  const fileName = `Cotizacion_${numero || "documento"}.pdf`;
  const file = new File([blob], fileName, {
    type: "application/pdf",
    lastModified: Date.now(),
  });

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFiles) {
    try {
      await navigator.share({
        files: [file],
        title: `Cotización ${numero}`,
        text: `Cotización ${numero}${empresaNombre ? ` - ${empresaNombre}` : ""}`,
      });
      return true;
    } catch (err: any) {
      if (err.name === "AbortError") {
        return false;
      }
      console.warn("Fallo en navigator.share:", err);
    }
  }

  if (onWarn) {
    onWarn(
      "Tu navegador o sistema no permite compartir archivos directamente (requiere soporte nativo y HTTPS). Puedes usar 'Descargar PDF' para adjuntarlo manualmente."
    );
  }
  return false;
}

interface PDFShareButtonProps {
  cotizacion: any;
  empresa: any;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PDFShareButton({
  cotizacion,
  empresa,
  label = "Compartir",
  className = "w-full",
  style,
}: PDFShareButtonProps) {
  const [instance] = usePDF({
    document: <CotizacionPDF cotizacion={cotizacion} empresa={empresa} />,
  });
  const toast = useRef<Toast>(null);

  const handleShare = async () => {
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
    <>
      <Toast ref={toast} />
      <Button
        label={instance.loading ? "Generando..." : label}
        icon={instance.loading ? "pi pi-spin pi-spinner" : "pi pi-whatsapp"}
        disabled={instance.loading || !!instance.error}
        onClick={handleShare}
        className={className}
        style={{
          backgroundColor: "#25D366",
          borderColor: "#25D366",
          color: "#ffffff",
          ...style,
        }}
      />
    </>
  );
}
