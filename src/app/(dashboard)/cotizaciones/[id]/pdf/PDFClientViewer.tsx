"use client";

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

export default function PDFClientViewer({ cotizacion, empresa }: { cotizacion: any, empresa: any }) {
  const router = useRouter();

  return (
    <div className="flex flex-column h-full w-full">
      {/* Responsive Header de Botones */}
      <div className="flex flex-column md:flex-row justify-content-between align-items-stretch md:align-items-center mb-3 gap-3">
        
        {/* Fila superior en Móvil / Lado Izquierdo en Desktop */}
        <div className="flex justify-content-between w-full md:w-auto gap-2">
          <Button 
            label="Volver a Cotizaciones" 
            icon="pi pi-arrow-left" 
            outlined
            onClick={() => router.push('/cotizaciones')} 
            className="flex-1 md:flex-none"
          />
          {/* Este botón 'Editar' solo se muestra en Móvil para estar en la fila superior */}
          <Button 
            label="Editar" 
            icon="pi pi-pencil" 
            severity="secondary" 
            outlined 
            onClick={() => router.push(`/cotizaciones/${cotizacion.id}`)} 
            className="flex-1 md:hidden"
          />
        </div>

        {/* Botón Central Descargar PDF (Ancho completo en móvil abajo, centrado en desktop) */}
        <div className="w-full md:w-auto flex-grow-1 flex justify-content-center">
          <PDFDownloadLink 
            document={<CotizacionPDF cotizacion={cotizacion} empresa={empresa} />} 
            fileName={`Cotizacion_${cotizacion.numero}.pdf`}
            className="w-full md:w-auto"
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button 
                label={loading ? 'Generando...' : 'Descargar PDF'} 
                icon={loading ? "pi pi-spin pi-spinner" : "pi pi-download"} 
                severity="danger" 
                disabled={loading}
                className="w-full md:w-15rem"
              />
            )}
          </PDFDownloadLink>
        </div>

        {/* Botón Editar a la Derecha (Solo visible en Desktop) */}
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
      
      <div className="surface-card p-2 shadow-2 border-round flex-1" style={{ minHeight: '80vh' }}>
        <PDFViewer width="100%" height="100%" className="border-none">
          <CotizacionPDF cotizacion={cotizacion} empresa={empresa} />
        </PDFViewer>
      </div>
    </div>
  );
}
