"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/app/(dashboard)/perfil/actions";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (state?.success) {
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada correctamente' });
      formRef.current?.reset();
    } else if (state?.error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: state.error });
    }
  }, [state]);

  return (
    <>
      <Toast ref={toast} />
      <form ref={formRef} action={formAction} className="flex flex-column gap-4 max-w-20rem">
        <div className="flex flex-column gap-2">
          <label htmlFor="currentPassword">Contraseña Actual</label>
          <Password 
            id="currentPassword" 
            name="currentPassword" 
            required 
            feedback={false} 
            toggleMask 
            pt={{ input: { className: 'w-full' } }}
          />
        </div>

        <div className="flex flex-column gap-2">
          <label htmlFor="newPassword">Nueva Contraseña</label>
          <Password 
            id="newPassword" 
            name="newPassword" 
            required 
            toggleMask 
            promptLabel="Introduce la contraseña"
            weakLabel="Débil"
            mediumLabel="Media"
            strongLabel="Fuerte"
            pt={{ input: { className: 'w-full' } }}
          />
        </div>

        <div className="flex flex-column gap-2">
          <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
          <Password 
            id="confirmPassword" 
            name="confirmPassword" 
            required 
            feedback={false} 
            toggleMask 
            pt={{ input: { className: 'w-full' } }}
          />
        </div>

        <Button 
          type="submit" 
          label="Cambiar Contraseña" 
          loading={isPending} 
          className="mt-2" 
        />
      </form>
    </>
  );
}
