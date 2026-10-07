import { z } from "zod";
import { TipoDescuento, EstadoCotizacion } from "@prisma/client";

export const itemCotizacionSchema = z.object({
  id: z.string().optional(),
  productoId: z.string().optional().nullable(),
  nombre: z.string().min(1, "El nombre del producto es requerido"),
  descripcion: z.string().optional().nullable(),
  cantidad: z.coerce.number().min(0.01, "La cantidad debe ser mayor a 0"),
  precioUnitario: z.coerce.number().min(0, "El precio no puede ser negativo"),
  descuento: z.coerce.number().min(0).default(0),
  tipoDescuento: z.nativeEnum(TipoDescuento).default("PORCENTAJE"),
  iva: z.coerce.number().min(0).max(100), // Ej: 15 para 15%
  // El subtotal por item se puede recalcular en el backend, pero lo pasamos para validación rápida
  subtotal: z.coerce.number().min(0),
});

export const cotizacionSchema = z.object({
  id: z.string().optional(),
  numero: z.string().optional(), // Generado automáticamente
  fechaEmision: z.coerce.date(),
  fechaVencimiento: z.coerce.date(),
  estado: z.nativeEnum(EstadoCotizacion).default("BORRADOR"),
  clienteId: z.string().min(1, "Debe seleccionar un cliente"),
  condicionesPago: z.string().optional().nullable(),
  plazoEntrega: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  items: z.array(itemCotizacionSchema).min(1, "Debe agregar al menos un producto a la cotización"),
});

export type CotizacionFormData = z.infer<typeof cotizacionSchema>;
export type ItemCotizacionFormData = z.infer<typeof itemCotizacionSchema>;
