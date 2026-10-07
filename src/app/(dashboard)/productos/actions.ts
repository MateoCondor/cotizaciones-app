"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { productoSchema, ProductoFormData } from "@/lib/validations/producto";
import { revalidatePath } from "next/cache";

export async function saveProducto(data: ProductoFormData) {
  const session = await auth();
  if (!session) return { error: "No autorizado", success: false };

  const validated = productoSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues.map((e) => e.message).join(", "), success: false };
  }

  try {
    let finalSku = validated.data.sku;

    if (!finalSku || finalSku.trim() === "") {
      // Autogenerar SKU (Ejemplo: PROD-12345)
      const count = await db.producto.count();
      const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      finalSku = `PROD-${String(count + 1).padStart(4, '0')}-${randomSuffix}`;
    }

    if (data.id) {
      // Actualizar
      await db.producto.update({
        where: { id: data.id },
        data: {
          sku: finalSku,
          nombre: validated.data.nombre,
          descripcion: validated.data.descripcion,
          precioUnitario: validated.data.precioUnitario,
          ivaAplicable: validated.data.ivaAplicable,
          activo: validated.data.activo,
        },
      });
    } else {
      // Crear
      await db.producto.create({
        data: {
          sku: finalSku,
          nombre: validated.data.nombre,
          descripcion: validated.data.descripcion,
          precioUnitario: validated.data.precioUnitario,
          ivaAplicable: validated.data.ivaAplicable,
          activo: true, // por defecto al crear
        },
      });
    }

    revalidatePath("/productos");
    return { error: null, success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "El Código/SKU ya está en uso", success: false };
    }
    return { error: "Error interno del servidor", success: false };
  }
}

export async function toggleProductoStatus(id: string, activo: boolean) {
  const session = await auth();
  if (!session) return { error: "No autorizado", success: false };

  try {
    await db.producto.update({
      where: { id },
      data: { activo },
    });
    revalidatePath("/productos");
    return { error: null, success: true };
  } catch (error) {
    return { error: "Error al actualizar estado", success: false };
  }
}
