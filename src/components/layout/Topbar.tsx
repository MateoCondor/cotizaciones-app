"use client";

import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function Topbar({
  onMenuToggle,
  user,
}: {
  onMenuToggle: () => void;
  user: { name?: string | null; email?: string | null; rol?: string };
}) {
  const menuLeft = useRef<Menu>(null);
  const router = useRouter();

  const userMenuItems = [
    {
      label: "Mi Perfil",
      icon: "pi pi-user",
      command: () => {
        router.push("/perfil");
      },
    },
    {
      label: "Cerrar sesión",
      icon: "pi pi-sign-out",
      command: async () => {
        await signOut({ callbackUrl: "/login" });
      },
    },
  ];

  return (
    <div className="bg-surface-0 h-4rem px-4 flex justify-content-between align-items-center shadow-1 relative z-2 flex-shrink-0">
      <div className="flex align-items-center gap-3">
        {/* Toggle Button para Mobile/Tablet */}
        <Button
          icon="pi pi-bars"
          rounded
          text
          className="lg:hidden text-700"
          onClick={onMenuToggle}
        />
      </div>

      <div className="flex align-items-center gap-3">
        <span className="hidden sm:inline-flex align-items-center gap-2">
          <span className="text-700 font-medium">{user.name}</span>
          <span className="bg-primary-50 text-primary border-round px-2 py-1 text-xs font-bold">
            {user.rol}
          </span>
        </span>
        <Button
          icon="pi pi-user"
          rounded
          text
          severity="secondary"
          onClick={(event) => menuLeft.current?.toggle(event)}
          aria-controls="popup_menu_left"
          aria-haspopup
          className="text-700 hover:surface-200"
        />
        <Menu
          model={userMenuItems}
          popup
          ref={menuLeft}
          id="popup_menu_left"
          popupAlignment="right"
        />
      </div>
    </div>
  );
}
