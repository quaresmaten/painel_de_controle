"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  FileClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Truck,
  UserCheck,
  Users,
  WalletCards,
  Wrench,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { navGroups, moduleConfigs } from "@/src/lib/modules";
import { cn } from "@/src/lib/utils";
import type { AppUser } from "@/src/lib/auth";

const icons = {
  commitments: WalletCards,
  payables: FileClock,
  "credit-notes": ClipboardCheck,
  suppliers: Users,
  vehicles: Truck,
  personnel: UserCheck,
  "maintenance-needs": Wrench,
  documents: FileText,
  activities: ClipboardCheck
};

export function Sidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <aside className="sticky top-0 z-40 flex w-full flex-col border-b bg-card lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 lg:block lg:px-5 lg:py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Painel</p>
          <h1 className="mt-0.5 truncate text-lg font-semibold lg:mt-1">
            Controle Interno
          </h1>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className={cn("lg:flex lg:min-h-0 lg:flex-1 lg:flex-col", open ? "block" : "hidden")}>
        <nav className="max-h-[calc(100dvh-9rem)] flex-1 overflow-y-auto px-3 py-3 lg:max-h-none lg:py-4">
          <Link
            href="/app"
            onClick={() => setOpen(false)}
            className={cn(
              "mb-2 flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-secondary lg:mb-3",
              pathname === "/app" && "bg-secondary"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {navGroups.map((group) => (
            <div key={group.title} className="mb-4 lg:mb-5">
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((key) => {
                  const item = moduleConfigs[key];
                  const Icon = icons[key];

                  return (
                    <Link
                      key={key}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex h-9 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
                        pathname === item.href && "bg-secondary text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.navLabel}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {user.role === "admin" && (
            <div className="mb-4 lg:mb-5">
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                Administração
              </p>
              <Link
                href="/app/admin/aprovacoes"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
                  pathname === "/app/admin/aprovacoes" && "bg-secondary text-foreground"
                )}
              >
                <Settings className="h-4 w-4" />
                Aprovações
              </Link>
            </div>
          )}
        </nav>

        <div className="flex items-center justify-between gap-3 border-t p-3 lg:p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}
