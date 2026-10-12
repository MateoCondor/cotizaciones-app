/**
 * Funciones de cálculo y redondeo monetario para cotizaciones y productos.
 * Evita imprecisiones de coma flotante estándar en JavaScript (IEEE 754).
 */

/**
 * Redondea un valor numérico a 2 decimales con precisión comercial (half-up).
 * Ej: 28.5 * 0.15 = 4.2749999999999995 -> 4.28
 */
export function roundMoney(amount: number): number {
  return Math.round((Number(amount || 0) + 1e-9) * 100) / 100;
}

/**
 * Calcula los valores individuales de una línea de cotización.
 */
export function calcularItemValores(item: {
  cantidad: number | any;
  precioUnitario: number | any;
  descuento?: number | any;
  tipoDescuento?: "PORCENTAJE" | "VALOR" | string | any;
  iva?: number | any;
}) {
  const cantidad = Number(item.cantidad) || 0;
  const precioUnitario = Number(item.precioUnitario) || 0;
  const bruto = roundMoney(cantidad * precioUnitario);

  const descuento = Number(item.descuento) || 0;
  const descValor = item.tipoDescuento === "PORCENTAJE"
    ? roundMoney(bruto * (descuento / 100))
    : roundMoney(descuento);

  const neto = roundMoney(bruto - descValor);
  const ivaTasa = Number(item.iva) || 0;
  const ivaValor = roundMoney(neto * (ivaTasa / 100));
  const totalConIva = roundMoney(neto + ivaValor);

  return {
    bruto,
    descValor,
    neto,
    ivaTasa,
    ivaValor,
    totalConIva,
  };
}

/**
 * Calcula los totales globales de una lista de ítems de cotización.
 */
export function calcularTotalesCotizacion(items: Array<{
  cantidad: number | any;
  precioUnitario: number | any;
  descuento?: number | any;
  tipoDescuento?: "PORCENTAJE" | "VALOR" | string | any;
  iva?: number | any;
}>) {
  let subtotalBruto = 0;
  let descuentoTotal = 0;
  let ivaTotal = 0;
  let totalGlobal = 0;

  for (const item of items) {
    const val = calcularItemValores(item);
    subtotalBruto = roundMoney(subtotalBruto + val.bruto);
    descuentoTotal = roundMoney(descuentoTotal + val.descValor);
    ivaTotal = roundMoney(ivaTotal + val.ivaValor);
    totalGlobal = roundMoney(totalGlobal + val.totalConIva);
  }

  return {
    subtotal: subtotalBruto,
    descuentoTotal,
    ivaTotal,
    total: totalGlobal,
  };
}

/**
 * Calcula el precio base, IVA y precio final con IVA de un producto con redondeo comercial exacto.
 */
export function calcularProductoPrecios(precioUnitario: number | any, ivaAplicable: number | any) {
  const precioBase = roundMoney(precioUnitario);
  const tarifaIva = Number(ivaAplicable || 0);
  const montoIva = roundMoney(precioBase * (tarifaIva / 100));
  const precioConIva = roundMoney(precioBase + montoIva);

  return {
    precioBase,
    tarifaIva,
    montoIva,
    precioConIva,
  };
}

