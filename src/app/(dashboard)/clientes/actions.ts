"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { clienteSchema, ClienteFormData } from "@/lib/validations/cliente";
import { revalidatePath } from "next/cache";

export async function saveCliente(data: ClienteFormData) {
  const session = await auth();
  if (!session) return { error: "No autorizado", success: false };

  const validated = clienteSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues.map((e) => e.message).join(", "), success: false };
  }

  try {
    if (data.id) {
      // Actualizar
      const updated = await db.cliente.update({
        where: { id: data.id },
        data: {
          nombre: validated.data.nombre,
          rucCedula: validated.data.rucCedula,
          direccion: validated.data.direccion,
          telefono: validated.data.telefono,
          correo: validated.data.correo,
          activo: validated.data.activo,
        },
      });
      revalidatePath("/clientes");
      return { error: null, success: true, clientId: updated.id };
    } else {
      // Crear
      const created = await db.cliente.create({
        data: {
          nombre: validated.data.nombre,
          rucCedula: validated.data.rucCedula,
          direccion: validated.data.direccion,
          telefono: validated.data.telefono,
          correo: validated.data.correo,
          activo: true, // por defecto al crear
        },
      });
      revalidatePath("/clientes");
      return { error: null, success: true, clientId: created.id };
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "El RUC o Cédula ya está registrado en otro cliente", success: false };
    }
    return { error: "Error interno del servidor", success: false };
  }
}

export async function toggleClienteStatus(id: string, activo: boolean) {
  const session = await auth();
  if (!session) return { error: "No autorizado", success: false };

  try {
    await db.cliente.update({
      where: { id },
      data: { activo },
    });
    revalidatePath("/clientes");
    return { error: null, success: true };
  } catch (error) {
    return { error: "Error al actualizar estado", success: false };
  }
}
