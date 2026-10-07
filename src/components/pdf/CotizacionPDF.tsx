import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Cotizacion, ItemCotizacion, Cliente, Empresa } from '@prisma/client';

// Register a basic font (optional, react-pdf comes with basic fonts)
// But to ensure consistent styling, standard is fine.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  logoContainer: {
    width: 150,
  },
  logo: {
    width: '100%',
    height: 'auto',
    maxHeight: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    alignItems: 'flex-end',
    width: 250,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a', // Un azul oscuro profesional
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
  },
  metaCol: {
    flexDirection: 'column',
    width: '48%',
  },
  metaTextRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    width: 80,
    fontWeight: 'bold',
    color: '#555',
  },
  metaValue: {
    flex: 1,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a8a',
    padding: 6,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 6,
  },
  colCode: { width: '15%' },
  colDesc: { width: '35%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colDisc: { width: '10%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalsBox: {
    width: 200,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
  },
  footerLine: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
  },
  conditionsBox: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  conditionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 11,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
  },
  signatureBox: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
    paddingTop: 5,
  }
});

type CotizacionCompleta = Cotizacion & {
  cliente: Cliente;
  items: ItemCotizacion[];
};

interface CotizacionPDFProps {
  cotizacion: CotizacionCompleta;
  empresa: Empresa | null;
}

const formatCurrency = (val: any) => {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(val));
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-EC');
};

export const CotizacionPDF = ({ cotizacion, empresa }: CotizacionPDFProps) => {
  const c = cotizacion;
  const e = empresa;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header: Logo and Company Info */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {e?.logoUrl ? (
              <Image src={e.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.companyName}>{e?.nombre || 'Mi Empresa'}</Text>
            )}
          </View>
          
          <View style={styles.companyInfo}>
            {e?.logoUrl && <Text style={styles.companyName}>{e?.nombre}</Text>}
            <Text style={styles.companyDetails}>RUC: {e?.ruc || 'N/A'}</Text>
            {e?.direccion && <Text style={styles.companyDetails}>{e.direccion}</Text>}
            {e?.telefono && <Text style={styles.companyDetails}>Tel: {e.telefono}</Text>}
            {e?.correo && <Text style={styles.companyDetails}>{e.correo}</Text>}
          </View>
        </View>

        <Text style={styles.quoteTitle}>COTIZACIÓN Nro. {c.numero}</Text>

        {/* Meta Section: Client & Dates */}
        <View style={styles.metaSection}>
          <View style={styles.metaCol}>
            <View style={styles.metaTextRow}>
              <Text style={styles.metaLabel}>Cliente:</Text>
              <Text style={styles.metaValue}>{c.cliente.nombre}</Text>
            </View>
            <View style={styles.metaTextRow}>
              <Text style={styles.metaLabel}>RUC/C.I.:</Text>
              <Text style={styles.metaValue}>{c.cliente.rucCedula}</Text>
            </View>
            {c.cliente.direccion && (
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>Dirección:</Text>
                <Text style={styles.metaValue}>{c.cliente.direccion}</Text>
              </View>
            )}
          </View>
          <View style={styles.metaCol}>
            <View style={styles.metaTextRow}>
              <Text style={styles.metaLabel}>Fecha Emisión:</Text>
              <Text style={styles.metaValue}>{formatDate(c.fechaEmision)}</Text>
            </View>
            <View style={styles.metaTextRow}>
              <Text style={styles.metaLabel}>Válido hasta:</Text>
              <Text style={styles.metaValue}>{formatDate(c.fechaVencimiento)}</Text>
            </View>
            <View style={styles.metaTextRow}>
              <Text style={styles.metaLabel}>Estado:</Text>
              <Text style={styles.metaValue}>{c.estado}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colCode}>Código</Text>
            <Text style={styles.colDesc}>Descripción</Text>
            <Text style={styles.colQty}>Cant.</Text>
            <Text style={styles.colPrice}>V. Unit</Text>
            <Text style={styles.colDisc}>Dscto.</Text>
            <Text style={styles.colTotal}>V. Total</Text>
          </View>
          {/* Table Rows */}
          {c.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colCode}>{item.productoId ? 'CAT' : 'MANUAL'}</Text>
              <Text style={styles.colDesc}>{item.nombre}</Text>
              <Text style={styles.colQty}>{Number(item.cantidad)}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.precioUnitario)}</Text>
              <Text style={styles.colDisc}>{formatCurrency(item.descuento)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Box */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal:</Text>
              <Text>{formatCurrency(c.subtotal)}</Text>
            </View>
            {Number(c.descuentoTotal) > 0 && (
              <View style={styles.totalRow}>
                <Text>Descuento:</Text>
                <Text>-{formatCurrency(c.descuentoTotal)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text>IVA:</Text>
              <Text>{formatCurrency(c.ivaTotal)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text>TOTAL:</Text>
              <Text>{formatCurrency(c.total)}</Text>
            </View>
          </View>
        </View>

        {/* Condiciones de Pago y Observaciones */}
        <View style={styles.conditionsBox}>
          <Text style={styles.conditionTitle}>Condiciones Adicionales</Text>
          {c.condicionesPago && <Text style={{marginBottom: 4}}>• Forma de pago: {c.condicionesPago}</Text>}
          {c.plazoEntrega && <Text style={{marginBottom: 4}}>• Plazo de entrega: {c.plazoEntrega}</Text>}
          {c.observaciones && <Text style={{marginTop: 6, fontStyle: 'italic'}}>Observaciones: {c.observaciones}</Text>}
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={{ fontWeight: 'bold' }}>{e?.emisorNombre || 'Emisor'}</Text>
            <Text style={{ fontSize: 9, color: '#666' }}>{e?.emisorCargo || 'Departamento de Ventas'}</Text>
            <Text style={{ fontSize: 9, color: '#666' }}>{e?.nombre || 'La Empresa'}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={{ fontWeight: 'bold' }}>{c.cliente.nombre}</Text>
            <Text style={{ fontSize: 9, color: '#666' }}>Aceptación del Cliente</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLine}>
            Este documento es una cotización. Los precios y condiciones están sujetos a cambios sin previo aviso. 
            Generado por el Sistema de Cotizaciones Interno de ECU-ACEROS.
          </Text>
        </View>

      </Page>
    </Document>
  );
};
