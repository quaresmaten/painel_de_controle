"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  FileClock,
  Truck,
  Users,
  Wrench
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  APP_NAME,
  VEHICLE_CATEGORY_LABELS,
  VEHICLE_CATEGORY_ORDER
} from "@/src/lib/modules";
import { formatCurrency } from "@/src/lib/utils";

type Aggregate = {
  _id: string | null;
  count: number;
  total?: number;
};

type VehicleCategoryAggregate = {
  _id: {
    categoria: string | null;
    disponibilidade: string | null;
  };
  count: number;
};

type DashboardData = {
  commitmentsByStatus: Aggregate[];
  maintenanceByPriority: Aggregate[];
  documentsByStatus: Aggregate[];
  vehiclesByAvailability: Aggregate[];
  vehiclesByCategoryAvailability: VehicleCategoryAggregate[];
  saldoEmTela: number;
  personnelReady: number;
  documentsTotal: number;
  activitiesTotal: number;
  highNeeds: number;
};

const emptyData: DashboardData = {
  commitmentsByStatus: [],
  maintenanceByPriority: [],
  documentsByStatus: [],
  vehiclesByAvailability: [],
  vehiclesByCategoryAvailability: [],
  saldoEmTela: 0,
  personnelReady: 0,
  documentsTotal: 0,
  activitiesTotal: 0,
  highNeeds: 0
};

const commitmentLabels: Record<string, string> = {
  entregue: "Entregues",
  no_prazo: "No prazo",
  atrasado: "Atrasados"
};

function aggregateValue(items: Aggregate[], key: string, field: "count" | "total" = "count") {
  return items.find((item) => item._id === key)?.[field] ?? 0;
}

function vehicleCategoryValue(
  items: VehicleCategoryAggregate[],
  category: string,
  availability: string
) {
  return (
    items.find(
      (item) =>
        (item._id.categoria ?? "__fallback") === category &&
        item._id.disponibilidade === availability
    )?.count ?? 0
  );
}

function BarChart({
  title,
  rows
}: {
  title: string;
  rows: Array<{ label: string; value: number; detail?: string; tone?: "primary" | "danger" | "success" }>;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="mt-5 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{row.label}</span>
              <span className="text-muted-foreground">{row.detail ?? row.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className={
                  row.tone === "danger"
                    ? "h-full rounded-full bg-destructive"
                    : row.tone === "success"
                      ? "h-full rounded-full bg-emerald-600"
                      : "h-full rounded-full bg-primary"
                }
                style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
        {!rows.length && <p className="text-sm text-muted-foreground">Sem dados cadastrados.</p>}
      </div>
    </div>
  );
}

function GroupedVehicleBars({ data }: { data: DashboardData }) {
  const categories = VEHICLE_CATEGORY_ORDER.map((category) => {
    const key = category === "__fallback" ? "__fallback" : category;
    const available = vehicleCategoryValue(data.vehiclesByCategoryAvailability, key, "disponivel");
    const unavailable = vehicleCategoryValue(data.vehiclesByCategoryAvailability, key, "indisponivel");

    return {
      key,
      label: key === "__fallback" ? "Sem categoria" : VEHICLE_CATEGORY_LABELS[key],
      available,
      unavailable,
      total: available + unavailable
    };
  }).filter((item) => item.total > 0);

  const max = Math.max(1, ...categories.flatMap((item) => [item.available, item.unavailable]));

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="text-base font-semibold">Viaturas e Equipamentos por disponibilidade</h3>
      <div className="mt-5 space-y-5">
        {categories.map((category) => (
          <div key={category.key}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{category.label}</span>
              <span className="text-muted-foreground">{category.total} total</span>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-[7rem_1fr_2rem] items-center gap-2 text-xs">
                <span className="text-muted-foreground">Disponível</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${Math.max(4, (category.available / max) * 100)}%` }}
                  />
                </div>
                <span className="text-right">{category.available}</span>
              </div>
              <div className="grid grid-cols-[7rem_1fr_2rem] items-center gap-2 text-xs">
                <span className="text-muted-foreground">Indisponível</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-destructive"
                    style={{ width: `${Math.max(4, (category.unavailable / max) * 100)}%` }}
                  />
                </div>
                <span className="text-right">{category.unavailable}</span>
              </div>
            </div>
          </div>
        ))}
        {!categories.length && <p className="text-sm text-muted-foreground">Sem dados cadastrados.</p>}
      </div>
    </div>
  );
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (!response.ok) return;
    const body = await response.json();
    setData({ ...emptyData, ...(body.data ?? {}) });
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    const interval = window.setInterval(loadData, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const commitmentRows = useMemo(
    () =>
      ["entregue", "no_prazo", "atrasado"].map((status) => ({
        label: commitmentLabels[status],
        value: aggregateValue(data.commitmentsByStatus, status),
        detail: `${aggregateValue(data.commitmentsByStatus, status)} · ${formatCurrency(
          aggregateValue(data.commitmentsByStatus, status, "total")
        )}`,
        tone: status === "atrasado" ? ("danger" as const) : status === "entregue" ? ("success" as const) : ("primary" as const)
      })),
    [data.commitmentsByStatus]
  );

  const vehicleTotal =
    aggregateValue(data.vehiclesByAvailability, "disponivel") +
    aggregateValue(data.vehiclesByAvailability, "indisponivel");
  const documentsPending =
    aggregateValue(data.documentsByStatus, "pendente") +
    aggregateValue(data.documentsByStatus, "atrasado");

  const firstRowCards = [
    {
      label: "Empenhos entregues",
      value: aggregateValue(data.commitmentsByStatus, "entregue"),
      detail: formatCurrency(aggregateValue(data.commitmentsByStatus, "entregue", "total")),
      icon: CheckCircle2
    },
    {
      label: "Empenhos no prazo",
      value: aggregateValue(data.commitmentsByStatus, "no_prazo"),
      detail: formatCurrency(aggregateValue(data.commitmentsByStatus, "no_prazo", "total")),
      icon: Banknote
    },
    {
      label: "Empenhos atrasados",
      value: aggregateValue(data.commitmentsByStatus, "atrasado"),
      detail: formatCurrency(aggregateValue(data.commitmentsByStatus, "atrasado", "total")),
      icon: AlertTriangle
    },
    {
      label: "Pessoal pronto",
      value: data.personnelReady,
      detail: "Militares prontos",
      icon: Users
    }
  ];

  const secondRowCards = [
    {
      label: "Viaturas e Equipamentos",
      value: vehicleTotal,
      detail: `${aggregateValue(data.vehiclesByAvailability, "disponivel")} disp. · ${aggregateValue(
        data.vehiclesByAvailability,
        "indisponivel"
      )} indisp.`,
      icon: Truck
    },
    {
      label: "Documentos",
      value: data.documentsTotal,
      detail: `${documentsPending} pendentes/atrasados`,
      icon: FileClock
    },
    {
      label: "Saldo em tela",
      value: formatCurrency(data.saldoEmTela),
      detail: "Notas marcadas em tela",
      icon: Banknote
    },
    {
      label: "Atividades",
      value: data.activitiesTotal,
      detail: "Atividades cadastradas",
      icon: CalendarDays
    },
    {
      label: "Necessidades alta",
      value: data.highNeeds,
      detail: "Prioridade alta",
      icon: Wrench
    }
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Controle Geral</p>
          <h2 className="mt-1 text-2xl font-semibold">{APP_NAME}</h2>
        </div>
        {loading && <Badge tone="muted">Carregando</Badge>}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {firstRowCards.map((card) => (
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

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {secondRowCards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <BarChart title="Empenhos por status" rows={commitmentRows} />
        <GroupedVehicleBars data={data} />
      </section>
    </div>
  );
}
