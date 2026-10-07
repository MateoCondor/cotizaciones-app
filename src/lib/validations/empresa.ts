import { z } from "zod";

export const empresaSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  ruc: z.string().regex(/^\d{10,13}$/, "El RUC/Cédula debe tener entre 10 y 13 dígitos numéricos"),
  direccion: z.string().min(5, "La dirección es requerida").optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  correo: z.string().email("Correo inválido").optional().or(z.literal('')),
  emisorNombre: z.string().optional().or(z.literal('')),
  emisorCargo: z.string().optional().or(z.literal('')),
  emisorCelular: z.string().optional().or(z.literal('')),
});
