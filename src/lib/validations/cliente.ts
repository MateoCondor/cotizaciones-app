import { z } from "zod";

// Función básica para validar Cédula/RUC Ecuatoriano
export const validarIdentificacionEcuatoriana = (identificacion: string): boolean => {
  if (!identificacion) return false;
  const limpio = identificacion.trim();
  
  // Debe ser solo números y tener 10 (cédula) o 13 (RUC) dígitos
  if (!/^\d{10}$|^\d{13}$/.test(limpio)) {
    return false;
  }

  const provincia = parseInt(limpio.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) {
    // 30 es para ecuatorianos en el exterior
    if (provincia !== 30) return false;
  }

  const tercerDigito = parseInt(limpio.substring(2, 3), 10);
  if (tercerDigito < 0 || tercerDigito > 6) {
    if (tercerDigito !== 9) return false; // 9 es sociedades privadas
  }

  // Validación de dígito verificador (Módulo 10) simplificada
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  
  // Solo aplicable a cédulas y RUC de personas naturales (tercer dígito < 6)
  if (tercerDigito < 6) {
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(limpio.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }
    const digitoVerificadorCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    const digitoVerificadorReal = parseInt(limpio.charAt(9), 10);
    
    if (digitoVerificadorCalculado !== digitoVerificadorReal) {
      return false;
    }
  }

  return true;
};

/**
 * Valida si un pasaporte extranjero es válido.
 * Según los estándares internacionales ICAO y normativa tributaria (SRI):
 * Los pasaportes para clientes en el exterior tienen entre 5 y 20 caracteres
 * alfanuméricos (letras, números y guiones opcionales).
 */
export const validarPasaporte = (pasaporte: string): boolean => {
  if (!pasaporte) return false;
  const limpio = pasaporte.trim();
  return /^[a-zA-Z0-9-]{5,20}$/.test(limpio);
};

/**
 * Determina si una identificación dada corresponde a un pasaporte extranjero.
 */
export const esPasaporte = (identificacion: string): boolean => {
  if (!identificacion) return false;
  const limpio = identificacion.trim();
  
  // Si contiene letras o guión, es pasaporte
  if (/[a-zA-Z-]/.test(limpio)) {
    return validarPasaporte(limpio);
  }
  
  // Si tiene longitud distinta a 10 o 13 dígitos
  if (limpio.length !== 10 && limpio.length !== 13) {
    return validarPasaporte(limpio);
  }
  
  // Si tiene 10 o 13 dígitos numéricos pero no pasa la validación ecuatoriana
  return !validarIdentificacionEcuatoriana(limpio) && validarPasaporte(limpio);
};

export const clienteSchema = z
  .object({
    id: z.string().optional(),
    tipoIdentificacion: z.enum(["NACIONAL", "PASAPORTE"]).default("NACIONAL"),
    nombre: z.string().min(3, "El nombre o razón social debe tener al menos 3 caracteres"),
    identificacion: z
      .string()
      .min(5, "La identificación debe tener al menos 5 caracteres")
      .max(20, "La identificación no puede exceder 20 caracteres"),
    direccion: z.string().optional().or(z.literal("")),
    telefono: z.string().optional().or(z.literal("")),
    correo: z.string().email("Correo inválido").optional().or(z.literal("")),
    activo: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const val = data.identificacion.trim();

    if (data.tipoIdentificacion === "PASAPORTE") {
      if (!validarPasaporte(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identificacion"],
          message:
            "Pasaporte inválido. Debe tener entre 5 y 20 caracteres alfanuméricos (letras y números sin espacios)",
        });
      }
    } else {
      // NACIONAL (Cédula o RUC ecuatoriano)
      if (!validarIdentificacionEcuatoriana(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identificacion"],
          message:
            "Cédula o RUC ecuatoriano inválido (10 dígitos para cédula, 13 dígitos para RUC)",
        });
      }
    }
  });

export type ClienteFormData = z.infer<typeof clienteSchema>;
