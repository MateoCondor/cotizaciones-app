import { z } from "zod";

// ─── Usuario / Auth ───────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña mínimo 6 caracteres"),
});

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Contraseña mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[0-9]/, "Debe tener al menos un número"),
  nombre: z.string().min(2, "Nombre mínimo 2 caracteres").max(100),
  rol: z.enum(["ADMIN", "USER"]).default("USER"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Contraseña actual requerida"),
    newPassword: z
      .string()
      .min(8, "Contraseña mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
      .regex(/[0-9]/, "Debe tener al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// ─── Empresa ──────────────────────────────────────────────
export const empresaSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(200),
  ruc: z
    .string()
    .regex(/^\d{10,13}$/, "RUC debe tener 10 a 13 dígitos"),
  logoUrl: z.string().url().optional().nullable(),
  logoNombre: z.string().optional().nullable(),
  direccion: z.string().max(300).optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
  correo: z.string().email("Email inválido").optional().nullable(),
  emisorNombre: z.string().max(100).optional().nullable(),
  emisorCargo: z.string().max(100).optional().nullable(),
  emisorCelular: z.string().max(20).optional().nullable(),
});

// ─── Cliente ──────────────────────────────────────────────
export const clienteSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(200),
  rucCedula: z
    .string()
    .regex(/^\d{10,13}$/, "RUC/Cédula debe tener 10 a 13 dígitos"),
  direccion: z.string().max(300).optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
  correo: z.string().email("Email inválido").optional().nullable(),
  activo: z.boolean().default(true),
});

// ─── Producto ─────────────────────────────────────────────
export const productoSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(200),
  descripcion: z.string().max(1000).optional().nullable(),
  precioUnitario: z
    .number()
    .positive("El precio debe ser positivo")
    .multipleOf(0.01, "Máximo 2 decimales"),
  ivaAplicable: z
    .number()
    .min(0, "IVA no puede ser negativo")
    .max(100, "IVA no puede superar 100%"),
  activo: z.boolean().default(true),
});

// ─── Item de Cotización ───────────────────────────────────
export const itemCotizacionSchema = z.object({
  productoId: z.string().cuid().optional().nullable(),
  nombre: z.string().min(1, "Nombre del item requerido").max(200),
  descripcion: z.string().max(1000).optional().nullable(),
  cantidad: z.number().positive("Cantidad debe ser positiva"),
  precioUnitario: z.number().positive("Precio debe ser positivo"),
  descuento: z.number().min(0).default(0),
  tipoDescuento: z.enum(["PORCENTAJE", "VALOR"]).default("PORCENTAJE"),
  iva: z.number().min(0).max(100),
  orden: z.number().int().min(0).default(0),
});

// ─── Cotización ───────────────────────────────────────────
export const cotizacionSchema = z.object({
  fechaVencimiento: z.string().datetime("Fecha de vencimiento inválida"),
  clienteId: z.string().cuid("Cliente inválido"),
  condicionesPago: z.string().max(500).optional().nullable(),
  plazoEntrega: z.string().max(200).optional().nullable(),
  observaciones: z.string().max(1000).optional().nullable(),
  items: z
    .array(itemCotizacionSchema)
    .min(1, "Debe tener al menos un item"),
});

export const updateEstadoSchema = z.object({
  estado: z.enum([
    "BORRADOR",
    "ENVIADA",
    "ACEPTADA",
    "RECHAZADA",
    "VENCIDA",
  ]),
});

// ─── Paginación ───────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});
