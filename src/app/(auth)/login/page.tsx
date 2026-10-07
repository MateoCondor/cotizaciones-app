"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sección Izquierda: Branding (Oculta en móviles) */}
      <div className="hidden lg:flex lg:w-6 bg-primary flex-column justify-content-between p-6 relative" style={{ overflow: 'hidden' }}>
        {/* Decoración de fondo simple con CSS */}
        <div
          className="absolute border-circle bg-white opacity-10"
          style={{ width: '600px', height: '600px', top: '-100px', left: '-100px' }}
        />
        <div
          className="absolute border-circle bg-white opacity-10"
          style={{ width: '400px', height: '400px', bottom: '-50px', right: '-100px' }}
        />

        <div className="relative z-1">
          <div className="flex align-items-center gap-2 mb-8">
            <i className="pi pi-file text-white text-4xl"></i>
            <span className="font-bold text-4xl text-white">ECU-ACEROS</span>
          </div>

          <div className="mt-8">
            <h1 className="text-white text-5xl font-bold mb-4 line-height-3">
              Sistema interno de cotizaciones
            </h1>
            <p className="text-primary-100 text-xl line-height-3 max-w-20rem">
              Sistema integral para la gestión de clientes, productos y emisiones en PDF de ECU-ACEROS.
            </p>
          </div>
        </div>

        <div className="relative z-1 text-primary-200 text-sm">
          &copy; {new Date().getFullYear()} ECU-ACEROS. Todos los derechos reservados.
        </div>
      </div>

      {/* Sección Derecha: Formulario de Login */}
      <div className="w-full lg:w-6 flex flex-column align-items-center justify-content-center bg-surface-0 p-4 md:p-8">
        <div className="w-full max-w-26rem">
          <div className="text-center mb-6 lg:hidden">
            <div className="flex align-items-center justify-content-center gap-2 mb-4">
              <i className="pi pi-file text-primary text-4xl"></i>
              <span className="font-bold text-4xl text-primary">ECU-ACEROS</span>
            </div>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-900 text-3xl font-bold mb-2">¡Bienvenido!</h2>
            <span className="text-600 font-medium text-lg">Inicia sesión para continuar</span>
          </div>

          <form action={formAction} className="flex flex-column gap-4">
            <div className="flex flex-column gap-2">
              <label htmlFor="email" className="font-medium text-700">Correo Electrónico</label>
              <IconField iconPosition="left" className="w-full">
                <InputIcon className="pi pi-envelope" />
                <InputText
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full"
                  placeholder="ejemplo@empresa.com"
                />
              </IconField>
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="password" className="font-medium text-700">Contraseña</label>
              <IconField iconPosition="left" className="w-full">
                <InputIcon className="pi pi-lock z-1" />
                <Password
                  id="password"
                  name="password"
                  required
                  feedback={false}
                  toggleMask
                  placeholder="••••••••"
                  className="w-full"
                  inputClassName="w-full"
                  style={{ width: '100%' }}
                  inputStyle={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </IconField>
            </div>

            {state?.error && (
              <div className="flex align-items-center gap-2 text-red-500 text-sm font-semibold mt-2 p-2 bg-red-50 border-round">
                <i className="pi pi-exclamation-circle"></i>
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              label="Ingresar al Sistema"
              icon="pi pi-sign-in"
              loading={isPending}
              className="w-full mt-4 p-3 text-lg font-semibold"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
