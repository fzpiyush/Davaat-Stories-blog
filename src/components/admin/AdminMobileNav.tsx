"use client";

import { useEffect, useId, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import AdminSidebarContent from "@/components/admin/AdminSidebarContent";

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Open admin menu"
        className="w-9 h-9 flex items-center justify-center text-muted border border-border rounded-lg transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Bars3Icon aria-hidden="true" className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={close}
            className="w-full h-full bg-foreground/30 backdrop-blur-sm absolute inset-0"
          />

          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="w-72 max-w-[85vw] h-full p-4 flex flex-col gap-6 bg-surface shadow-xl border-r border-border relative overflow-y-auto"
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={close}
                autoFocus
                aria-label="Close admin menu"
                className="w-9 h-9 flex items-center justify-center text-muted border border-border rounded-lg transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <XMarkIcon aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>

            <AdminSidebarContent onNavigate={close} />
          </div>
        </div>
      )}
    </div>
  );
}
