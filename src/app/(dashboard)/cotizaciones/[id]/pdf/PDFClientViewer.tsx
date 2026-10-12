"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CotizacionPDF } from "@/components/pdf/CotizacionPDF";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

// Componente interno que usa usePDF() solo en cliente para móvil
const MobilePDFOpener = dynamic(
  () => import("./MobilePDFOpener"),
  { ssr: false }
);

// Componente reusable para compartir PDF
const PDFShareButton = dynamic(
  () => import("./PDFShareButton"),
  { ssr: false }
);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function PDFClientViewer({ cotizacion, empresa }: { cotizacion: any, empresa: any }) {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-column h-full w-full">

      {/* ── HEADER ── */}
      <div className="flex flex-column md:flex-row justify-content-between align-items-stretch md:align-items-center mb-3 gap-2">

        {/* Fila navegación: Volver + Editar (solo móvil) */}
        <div className="flex justify-content-between w-full md:w-auto gap-2">
          <Button
            label="Volver a Cotizaciones"
            icon="pi pi-arrow-left"
            outlined
            onClick={() => router.push('/cotizaciones')}
            className="flex-1 md:flex-none"
          />
          <Button
            label="Editar Cotización"
            icon="pi pi-pencil"
            severity="secondary"
            outlined
            onClick={() => router.push(`/cotizaciones/${cotizacion.id}`)}
            className="flex-1 md:hidden"
          />
        </div>

        {/* En desktop: botón Descargar y botón Compartir centrados */}
        {!isMobile && (
          <div className="flex-grow-1 flex justify-content-center gap-2">
            <PDFDownloadLink
              document={<CotizacionPDF cotizacion={cotizacion} empresa={empresa} />}
              fileName={`Cotizacion_${cotizacion.numero}.pdf`}
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) => (
                <Button
                  label={loading ? 'Generando...' : 'Descargar PDF'}
                  icon={loading ? "pi pi-spin pi-spinner" : "pi pi-download"}
                  severity="danger"
                  disabled={loading}
                  className="w-14rem"
                />
              )}
            </PDFDownloadLink>
            <div style={{ width: '14rem' }}>
              <PDFShareButton
                cotizacion={cotizacion}
                empresa={empresa}
                label="Compartir"
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Botón Editar Cotización — solo desktop, a la derecha */}
        <div className="hidden md:block">
          <Button
            label="Editar Cotización"
            icon="pi pi-pencil"
            severity="secondary"
            outlined
            onClick={() => router.push(`/cotizaciones/${cotizacion.id}`)}
          />
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      {isMobile ? (
        /* Tarjeta compacta en móvil */
        <div
          className="surface-card shadow-2 border-round flex flex-column align-items-center justify-content-center gap-3 p-4"
          style={{ minHeight: '220px' }}
        >
          <i className="pi pi-file-pdf" style={{ fontSize: '3rem', color: 'var(--red-400)' }} />
          <div className="text-center">
            <h3 className="m-0 mb-1">Cotización #{cotizacion.numero}</h3>
            <p className="m-0 text-color-secondary text-sm">
              Abre el PDF en tu dispositivo, descárgalo o compártelo directamente por WhatsApp.
            </p>
          </div>
          {/* Botones de acción dentro de la tarjeta */}
          <MobilePDFOpener cotizacion={cotizacion} empresa={empresa} />
        </div>
      ) : (
        <div className="surface-card p-2 shadow-2 border-round flex-1" style={{ minHeight: '80vh' }}>
          <PDFViewer width="100%" height="100%" className="border-none">
            <CotizacionPDF cotizacion={cotizacion} empresa={empresa} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
}
