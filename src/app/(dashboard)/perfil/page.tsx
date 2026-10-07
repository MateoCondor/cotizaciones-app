import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";

export default async function PerfilPage() {
  const session = await auth();

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Mi Perfil</h2>
      
      <div className="mb-6">
        <div className="text-700 mb-2"><strong>Nombre:</strong> {session?.user?.name}</div>
        <div className="text-700 mb-2"><strong>Email:</strong> {session?.user?.email}</div>
        <div className="text-700 mb-2"><strong>Rol:</strong> {session?.user?.rol}</div>
      </div>

      <h3 className="text-xl font-bold mb-3">Cambiar Contraseña</h3>
      <div className="surface-card shadow-2 p-4 border-round max-w-30rem">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
