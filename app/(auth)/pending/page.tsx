import Link from "next/link";

import { getSessionUser } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const user = await getSessionUser();
  const rejected = user?.status === "rejected";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Acesso
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          {rejected ? "Cadastro não aprovado" : "Aguardando aprovação"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {rejected
            ? "Seu cadastro foi recusado. Fale com o administrador responsavel."
            : "Seu cadastro foi recebido e ainda precisa ser liberado por um administrador."}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Voltar ao login
          </Link>
        </div>
      </section>
    </main>
  );
}
