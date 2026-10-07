"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ripple } from "primereact/ripple";

export function SidebarContent({ onHide }: { onHide?: () => void }) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", icon: "pi pi-home", path: "/dashboard" },
    { label: "Cotizaciones", icon: "pi pi-file-pdf", path: "/cotizaciones" },
    { label: "Clientes", icon: "pi pi-users", path: "/clientes" },
    { label: "Productos", icon: "pi pi-box", path: "/productos" },
    { label: "Empresa", icon: "pi pi-building", path: "/empresa" },
    { label: "Usuarios", icon: "pi pi-user-edit", path: "/usuarios" },
  ];

  return (
    <div className="flex flex-column h-full bg-surface-0 border-right-1 surface-border" style={{ width: '250px' }}>
      <div className="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
        <span className="inline-flex align-items-center gap-2">
          <i className="pi pi-file text-primary text-2xl"></i>
          <span className="font-semibold text-2xl text-primary">ECU-ACEROS</span>
        </span>
      </div>

      <div className="overflow-y-auto flex-1 mt-5">
        <ul className="list-none p-3 m-0 flex flex-column gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={onHide}
                  className={`p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full text-decoration-none ${isActive ? "bg-primary-50 text-primary font-bold" : ""
                    }`}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  <span className="font-medium">{item.label}</span>
                  <Ripple />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
