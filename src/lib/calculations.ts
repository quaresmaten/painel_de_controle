const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type DeliveryStatus = "entregue" | "no_prazo" | "atrasado";
export type DocumentStatus = "pendente" | "respondido" | "atrasado";

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function daysBetween(start: Date, end: Date) {
  const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endUTC = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return Math.floor((endUTC - startUTC) / DAY_IN_MS);
}

export function computeCommitmentFields(input: {
  dataEmissao?: Date | string | null;
  statusEntrega?: string | null;
  today?: Date;
}) {
  if (!input.dataEmissao) {
    return {
      prazoEntrega: undefined,
      diasDesdeEmissao: undefined,
      statusEntrega: (input.statusEntrega || "no_prazo") as DeliveryStatus
    };
  }

  const dataEmissao = new Date(input.dataEmissao);
  const today = input.today ?? new Date();
  const prazoEntrega = addDays(dataEmissao, 30);
  const diasDesdeEmissao = Math.max(0, daysBetween(dataEmissao, today));
  const incomingStatus = input.statusEntrega;

  if (incomingStatus === "entregue") {
    return { prazoEntrega, diasDesdeEmissao, statusEntrega: "entregue" as DeliveryStatus };
  }

  return {
    prazoEntrega,
    diasDesdeEmissao,
    statusEntrega: today > prazoEntrega ? ("atrasado" as DeliveryStatus) : ("no_prazo" as DeliveryStatus)
  };
}

export function computeCreditAllocation(allocation: {
  valorNE?: number | null;
  valorLiquidado?: number | null;
}) {
  const valorNE = Number(allocation.valorNE ?? 0);
  const valorLiquidado = Number(allocation.valorLiquidado ?? 0);
  return {
    valorNaoLiquidado: Math.max(0, valorNE - valorLiquidado)
  };
}

export function computeCreditNoteFields(input: {
  valorNC?: number | null;
  allocations?: Array<{ valorNE?: number | null; valorLiquidado?: number | null }>;
  commitmentTotal?: number | null;
}) {
  const valorNC = Number(input.valorNC ?? 0);
  const allocations = input.allocations ?? [];
  const totalNE =
    input.commitmentTotal === undefined || input.commitmentTotal === null
      ? allocations.reduce((sum, item) => sum + Number(item.valorNE ?? 0), 0)
      : Number(input.commitmentTotal ?? 0);

  const computed: {
    saldoNC: number;
    allocations?: Array<{
      valorNE?: number | null;
      valorLiquidado?: number | null;
      valorNaoLiquidado: number;
    }>;
  } = {
    saldoNC: valorNC - totalNE
  };

  if (input.allocations) {
    computed.allocations = allocations.map((item) => ({
      ...item,
      ...computeCreditAllocation(item)
    }));
  }

  return computed;
}

export function computeMaintenanceTotal(input: {
  budgetItems?: Array<{ valorTotal?: number | null }>;
}) {
  return (input.budgetItems ?? []).reduce((sum, item) => sum + Number(item.valorTotal ?? 0), 0);
}

export function computeDocumentStatus(input: {
  prazo?: Date | string | null;
  numeroDiexResposta?: string | null;
  situacao?: string | null;
  today?: Date;
}) {
  if (input.numeroDiexResposta?.trim()) return "respondido" as DocumentStatus;
  if (!input.prazo) return (input.situacao || "pendente") as DocumentStatus;

  const prazo = new Date(input.prazo);
  const today = input.today ?? new Date();

  return today > prazo ? ("atrasado" as DocumentStatus) : ("pendente" as DocumentStatus);
}
