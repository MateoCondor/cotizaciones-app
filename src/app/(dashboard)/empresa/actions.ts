"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { empresaSchema } from "@/lib/validations/empresa";
import { revalidatePath } from "next/cache";

export async function saveEmpresa(prevState: any, formData: FormData) {
  const session = await auth();

  if (session?.user?.rol !== "ADMIN") {
    return { error: "No autorizado", success: false };
  }

  // Extraer datos del formulario
  const rawData = {
    nombre: formData.get("nombre") as string,
    ruc: formData.get("ruc") as string,
    direccion: formData.get("direccion") as string,
    telefono: formData.get("telefono") as string,
    correo: formData.get("correo") as string,
    emisorNombre: formData.get("emisorNombre") as string,
    emisorCargo: formData.get("emisorCargo") as string,
    emisorCelular: formData.get("emisorCelular") as string,
  };

  // Validar con Zod
  const validated = empresaSchema.safeParse(rawData);
  if (!validated.success) {
    return { 
      error: validated.error.issues.map((e: any) => e.message).join(", "), 
      success: false 
    };
  }

  try {
    // Procesar el logo si se subió uno nuevo
    let logoUrl = formData.get("existingLogoUrl") as string | null;
    const logoFile = formData.get("logo") as File | null;
    
    if (logoFile && logoFile.size > 0) {
      if (logoFile.size > 2 * 1024 * 1024) {
        return { error: "El logo no debe superar los 2MB", success: false };
      }
      
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = logoFile.type;
      logoUrl = `data:${mimeType};base64,${base64}`;
    } else if (formData.get("removeLogo") === "true") {
      logoUrl = null;
    }

    // Upsert (Actualizar la primera empresa encontrada, o crear si no hay)
    const existingEmpresa = await db.empresa.findFirst();

    if (existingEmpresa) {
      await db.empresa.update({
        where: { id: existingEmpresa.id },
        data: {
          ...validated.data,
          logoUrl,
        },
      });
    } else {
      await db.empresa.create({
        data: {
          ...validated.data,
          logoUrl,
        },
      });
    }

    revalidatePath("/empresa");
    return { error: null, success: true };
  } catch (error: any) {
    console.error("Error guardando empresa:", error);
    if (error.code === 'P2002') {
       return { error: "El RUC ya está registrado en otra empresa", success: false };
    }
    return { error: "Error interno del servidor", success: false };
  }
}
