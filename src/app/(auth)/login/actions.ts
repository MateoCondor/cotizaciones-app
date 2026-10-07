"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// Rate limiting simple en memoria (en producción usar Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

export async function authenticate(
  prevState: { error: string | null } | undefined,
  formData: FormData
) {
  // Identificador simple para el rate limit (basado en el email)
  const email = formData.get("email") as string;
  const ipFallback = "unknown-ip"; 
  const identifier = `${email}-${ipFallback}`;

  const now = Date.now();
  const limitData = rateLimitMap.get(identifier);

  if (limitData) {
    if (now - limitData.timestamp < WINDOW_MS) {
      if (limitData.count >= MAX_ATTEMPTS) {
        return { error: "Demasiados intentos. Por favor, intenta en 15 minutos." };
      }
      limitData.count += 1;
    } else {
      rateLimitMap.set(identifier, { count: 1, timestamp: now });
    }
  } else {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
  }

  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirectTo: "/dashboard",
    });
    // Si el login es exitoso, reseteamos los intentos
    rateLimitMap.delete(identifier);
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas. Verifica tu email y contraseña." };
        default:
          return { error: "Algo salió mal. Intenta nuevamente." };
      }
    }
    // Lanza el error original (necesario para que Next.js redirect funcione)
    throw error;
  }
}
