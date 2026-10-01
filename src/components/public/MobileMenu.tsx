"use client";

import { useEffect, useId, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import NavLinks from "@/components/public/NavLinks";
import type { NavItem } from "@/lib/site";

interface MobileMenuProps {
  items: readonly NavItem[];
}

export default function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        className="w-9 h-9 flex items-center justify-center text-muted border border-border rounded-lg transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {open ? (
          <XMarkIcon aria-hidden="true" className="w-5 h-5" />
        ) : (
          <Bars3Icon aria-hidden="true" className="w-5 h-5" />
        )}
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="w-full px-4 py-4 sm:px-6 bg-background shadow-md border-b border-border absolute inset-x-0 top-full z-40"
      >
        <nav aria-label="Mobile">
          <NavLinks
            items={items}
            orientation="vertical"
            onNavigate={() => setOpen(false)}
          />
        </nav>
      </div>
    </div>
  );
}