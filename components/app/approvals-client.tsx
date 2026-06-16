"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, normalizeText } from "@/src/lib/utils";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "viewer";
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  approvedAt?: string;
};

function tone(status: UserRow["status"]) {
  if (status === "approved") return "success" as const;
  if (status === "rejected") return "danger" as const;
  return "warning" as const;
}

export function ApprovalsClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    if (!response.ok) return;
    const body = await response.json();
    setUsers(body.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
    const interval = window.setInterval(loadUsers, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const needle = normalizeText(query);
    return users.filter((user) =>
      [user.name, user.email, user.status, user.role].some((item) =>
        normalizeText(item).includes(needle)
      )
    );
  }, [query, users]);

  async function updateUser(user: UserRow, status: "approved" | "rejected") {
    setError("");
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, role: "viewer" })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "Não foi possível atualizar usuário.");
      return;
    }

    await loadUsers();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Administração</p>
          <h2 className="mt-1 text-2xl font-semibold">Aprovações</h2>
        </div>
        <Button type="button" variant="outline" onClick={loadUsers}>
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div className="mb-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar"
          className="h-10 w-full rounded-md border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="border-b px-4 py-3">Nome</th>
                <th className="border-b px-4 py-3">E-mail</th>
                <th className="border-b px-4 py-3">Status</th>
                <th className="border-b px-4 py-3">Cadastro</th>
                <th className="border-b px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/40">
                  <td className="border-b px-4 py-3 font-medium">{user.name}</td>
                  <td className="border-b px-4 py-3">{user.email}</td>
                  <td className="border-b px-4 py-3">
                    <Badge tone={tone(user.status)}>{user.status}</Badge>
                  </td>
                  <td className="border-b px-4 py-3">{formatDate(user.createdAt)}</td>
                  <td className="border-b px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={user.status === "approved"}
                        onClick={() => updateUser(user, "approved")}
                      >
                        <Check className="h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={user.status === "rejected"}
                        onClick={() => updateUser(user, "rejected")}
                      >
                        <X className="h-4 w-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="px-4 py-8 text-muted-foreground" colSpan={5}>
                    {loading ? "Carregando..." : "Nenhum usuário encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
