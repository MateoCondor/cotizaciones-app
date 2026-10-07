import { z } from "zod";

// Función básica para validar Cédula/RUC Ecuatoriano
export const validarIdentificacionEcuatoriana = (identificacion: string) => {
  if (!identificacion) return false;
  
  // Debe ser solo números y tener 10 (cédula) o 13 (RUC) dígitos
  if (!/^\d{10}$|^\d{13}$/.test(identificacion)) {
    return false;
  }

  const provincia = parseInt(identificacion.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) {
    // 30 es para ecuatorianos en el exterior, podemos permitirlo si es necesario, 
    // pero estándar es 1 a 24. Añadiremos 30 por compatibilidad.
    if (provincia !== 30) return false;
  }

  const tercerDigito = parseInt(identificacion.substring(2, 3), 10);
  if (tercerDigito < 0 || tercerDigito > 6) {
    if (tercerDigito !== 9) return false; // 9 es sociedades privadas
  }

  // Si es RUC de persona natural, los últimos 3 dígitos deben ser 001
  if (identificacion.length === 13 && identificacion.substring(10, 13) !== "001") {
    // Podría haber sufijos diferentes pero 001 es el 99% de los casos.
    // Lo dejamos pasar si se necesita ser permisivo o lo forzamos.
  }

  // Validación de dígito verificador (Módulo 10) simplificada
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  
  // Solo aplicable a cédulas y RUC de personas naturales (tercer dígito < 6)
  if (tercerDigito < 6) {
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(identificacion.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }
    const digitoVerificadorCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    const digitoVerificadorReal = parseInt(identificacion.charAt(9), 10);
    
    if (digitoVerificadorCalculado !== digitoVerificadorReal) {
      return false;
    }
  }

  return true;
};

export const clienteSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(3, "El nombre o razón social debe tener al menos 3 caracteres"),
  rucCedula: z.string()
    .min(10, "Debe tener al menos 10 dígitos")
    .max(13, "No puede tener más de 13 dígitos")
    .refine(validarIdentificacionEcuatoriana, "Cédula o RUC ecuatoriano inválido"),
  direccion: z.string().optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  correo: z.string().email("Correo inválido").optional().or(z.literal('')),
  activo: z.boolean().default(true),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
