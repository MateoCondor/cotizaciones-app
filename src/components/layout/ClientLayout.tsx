"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "primereact/sidebar";
import { SidebarContent } from "./SidebarContent";
import { Topbar } from "./Topbar";

export function ClientLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  useEffect(() => {
    // Suppress React 19 element.ref warnings from PrimeReact v10 in dev mode
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Accessing element.ref was removed in React 19")
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const toggleMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  const hideMenu = () => {
    setMobileMenuVisible(false);
  };

  return (
    <div className="flex min-h-screen bg-surface-ground">
      {/* Sidebar para Escritorio (Fijo) */}
      <div className="hidden lg:block shadow-2 relative z-3">
        <SidebarContent />
      </div>

      {/* Sidebar para Móvil (Drawer) */}
      <Sidebar
        visible={mobileMenuVisible}
        onHide={hideMenu}
        className="w-18rem p-0"
        showCloseIcon={false}
      >
        <SidebarContent onHide={hideMenu} />
      </Sidebar>

      <div className="flex-1 flex flex-column min-h-screen min-w-0 transition-all transition-duration-200">
        <Topbar onMenuToggle={toggleMenu} user={user} />

        <div className="flex-1 p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
