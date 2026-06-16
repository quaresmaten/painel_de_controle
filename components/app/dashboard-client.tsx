"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Banknote, FileClock, Truck, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/src/lib/utils";

type Aggregate = {
  _id: string | null;
  count: number;
  total?: number;
};

type DashboardData = {
  commitmentsByStatus: Aggregate[];
  creditNotes: Array<{
    id: string;
    numeroNC: string;
    prazo?: string;
    prazoTipo: "date" | "imediato";
    valorNC: number;
    saldoNC: number;
    objeto?: string;
    emTela?: boolean;
  }>;
  maintenanceByPriority: Aggregate[];
  documentsByStatus: Aggregate[];
  urgentDocuments: Array<{
    id: string;
    numeroDiex: string;
    prazo?: string;
    responsavel?: string;
    assunto?: string;
    situacao: string;
  }>;
  vehiclesByAvailability: Aggregate[];
};

const emptyData: DashboardData = {
  commitmentsByStatus: [],
  creditNotes: [],
  maintenanceByPriority: [],
  documentsByStatus: [],
  urgentDocuments: [],
  vehiclesByAvailability: []
};

function aggregateValue(items: Aggregate[], key: string, field: "count" | "total" = "count") {
  return items.find((item) => item._id === key)?.[field] ?? 0;
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (!response.ok) return;
    const body = await response.json();
    setData(body.data ?? emptyData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    const interval = window.setInterval(loadData, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Empenhos atrasados",
        value: aggregateValue(data.commitmentsByStatus, "atrasado"),
        detail: formatCurrency(aggregateValue(data.commitmentsByStatus, "atrasado", "total")),
        icon: AlertTriangle
      },
      {
        label: "Empenhos no prazo",
        value: aggregateValue(data.commitmentsByStatus, "no_prazo"),
        detail: formatCurrency(aggregateValue(data.commitmentsByStatus, "no_prazo", "total")),
        icon: Banknote
      },
      {
        label: "Documentos pendentes",
        value:
          aggregateValue(data.documentsByStatus, "pendente") +
          aggregateValue(data.documentsByStatus, "atrasado"),
        detail: `${aggregateValue(data.documentsByStatus, "atrasado")} atrasados`,
        icon: FileClock
      },
      {
        label: "Viaturas disponíveis",
        value: aggregateValue(data.vehiclesByAvailability, "disponivel"),
        detail: `${aggregateValue(data.vehiclesByAvailability, "indisponivel")} indisponíveis`,
        icon: Truck
      }
    ],
    [data]
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold">Painel de Controle Interno</h2>
        </div>
        {loading && <Badge tone="muted">Carregando</Badge>}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-semibold">{card.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">Notas de crédito</h3>
            <Banknote className="h-4 w-4 text-primary" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="border-b py-2 pr-3">NC</th>
                  <th className="border-b py-2 pr-3">Prazo</th>
                  <th className="border-b py-2 pr-3 text-right">Saldo</th>
                  <th className="border-b py-2 pr-3">Tela</th>
                </tr>
              </thead>
              <tbody>
                {data.creditNotes.map((item) => (
                  <tr key={item.id}>
                    <td className="border-b py-2 pr-3 font-medium">{item.numeroNC}</td>
                    <td className="border-b py-2 pr-3">
                      {item.prazoTipo === "imediato" ? "Imediato" : formatDate(item.prazo)}
                    </td>
                    <td className="border-b py-2 pr-3 text-right">
                      {formatCurrency(item.saldoNC)}
                    </td>
                    <td className="border-b py-2 pr-3">
                      {item.emTela ? <Badge>Sim</Badge> : <Badge tone="muted">Não</Badge>}
                    </td>
                  </tr>
                ))}
                {!data.creditNotes.length && (
                  <tr>
                    <td className="py-5 text-muted-foreground" colSpan={4}>
                      Sem notas cadastradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">Documentação urgente</h3>
            <FileClock className="h-4 w-4 text-primary" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="border-b py-2 pr-3">DIEx</th>
                  <th className="border-b py-2 pr-3">Prazo</th>
                  <th className="border-b py-2 pr-3">Responsável</th>
                  <th className="border-b py-2 pr-3">Situação</th>
                </tr>
              </thead>
              <tbody>
                {data.urgentDocuments.map((item) => (
                  <tr key={item.id}>
                    <td className="border-b py-2 pr-3 font-medium">{item.numeroDiex}</td>
                    <td className="border-b py-2 pr-3">{formatDate(item.prazo)}</td>
                    <td className="border-b py-2 pr-3">{item.responsavel || "-"}</td>
                    <td className="border-b py-2 pr-3">
                      <Badge tone={item.situacao === "atrasado" ? "danger" : "warning"}>
                        {item.situacao}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {!data.urgentDocuments.length && (
                  <tr>
                    <td className="py-5 text-muted-foreground" colSpan={4}>
                      Sem documentos urgentes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Necessidades por prioridade</h3>
          <Wrench className="h-4 w-4 text-primary" />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {["critica", "alta", "media", "baixa"].map((priority) => (
            <div key={priority} className="rounded-md border p-3">
              <p className="text-sm capitalize text-muted-foreground">{priority}</p>
              <p className="mt-2 text-2xl font-semibold">
                {aggregateValue(data.maintenanceByPriority, priority)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(aggregateValue(data.maintenanceByPriority, priority, "total"))}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
