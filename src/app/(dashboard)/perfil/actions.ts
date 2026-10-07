"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export async function changePassword(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado", success: false };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Todos los campos son requeridos", success: false };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Las contraseñas nuevas no coinciden", success: false };
  }

  if (newPassword.length < 6) {
    return { error: "La nueva contraseña debe tener al menos 6 caracteres", success: false };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { error: "Usuario no encontrado", success: false };
    }

    const passwordMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return { error: "La contraseña actual es incorrecta", success: false };
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 12);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return { error: null, success: true };
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    return { error: "Error interno al cambiar la contraseña", success: false };
  }
}
