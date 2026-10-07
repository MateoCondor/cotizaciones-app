import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Verifica que el usuario tiene sesión activa.
 * Retorna la sesión o lanza un 401.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      ),
    };
  }
  return { session, error: null };
}

/**
 * Verifica que el usuario tiene rol ADMIN.
 * Retorna la sesión o lanza un 403.
 */
export async function requireAdmin() {
  const { session, error } = await requireAuth();
  if (error || !session) return { session: null, error };

  if (session.user.rol !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Acceso denegado: se requiere rol de administrador" },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}

/**
 * Respuesta de error segura: genérica al cliente, detalle en logs.
 */
export function handleApiError(
  error: unknown,
  context: string
): NextResponse {
  console.error(`[API Error - ${context}]`, error);
  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 }
  );
}

/**
 * Genera número de cotización: COT-YYYY-NNNN
 */
export function generarNumeroCotizacion(count: number): string {
  const year = new Date().getFullYear();
  const numero = String(count + 1).padStart(4, "0");
  return `COT-${year}-${numero}`;
}

/**
 * Genera SKU de producto: PROD-XXXXXX
 */
export function generarSKU(count: number): string {
  const numero = String(count + 1).padStart(6, "0");
  return `PROD-${numero}`;
}

/**
 * Calcula los totales de una cotización
 */
export function calcularTotalesCotizacion(
  items: Array<{
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    tipoDescuento: "PORCENTAJE" | "VALOR";
    iva: number;
  }>
) {
  let subtotalBruto = 0;
  let descuentoTotal = 0;
  let ivaTotal = 0;

  for (const item of items) {
    const bruto = item.cantidad * item.precioUnitario;
    const descuento =
      item.tipoDescuento === "PORCENTAJE"
        ? bruto * (item.descuento / 100)
        : item.descuento;
    const base = bruto - descuento;
    const iva = base * (item.iva / 100);

    subtotalBruto += base;
    descuentoTotal += descuento;
    ivaTotal += iva;
  }

  const total = subtotalBruto + ivaTotal;

  return {
    subtotal: Math.round(subtotalBruto * 100) / 100,
    descuentoTotal: Math.round(descuentoTotal * 100) / 100,
    ivaTotal: Math.round(ivaTotal * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
