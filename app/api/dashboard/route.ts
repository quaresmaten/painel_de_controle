import { NextResponse } from "next/server";

import { requireApprovedUser } from "@/src/lib/auth";
import { MILITARY_RANK_ORDER, SERVICE_SCALE_OPTIONS } from "@/src/lib/modules";
import { connectToDatabase } from "@/src/lib/mongodb";
import { hydrateCreditNotes } from "@/src/lib/resources";
import { serializeDocs } from "@/src/lib/serialize";
import { Activity } from "@/src/models/activity";
import { Commitment } from "@/src/models/commitment";
import { CreditNote } from "@/src/models/credit-note";
import { ControlledDocument } from "@/src/models/document";
import { MaintenanceNeed } from "@/src/models/maintenance-need";
import { Personnel } from "@/src/models/personnel";
import { Vehicle } from "@/src/models/vehicle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PersonnelDashboardRecord = {
  postoGraduacao?: string | null;
  situacao?: string | null;
  escalaServico?: string[] | string | null;
};

function toStringList(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (value === undefined || value === null || value === "") return [];
  return [String(value)];
}

function scaleLabel(value: string) {
  if (value === "__sem_escala") return "Sem escala";
  return SERVICE_SCALE_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

function buildPersonnelBreakdown(records: PersonnelDashboardRecord[]) {
  const byScale = new Map<string, { key: string; label: string; ready: number; other: number; total: number }>();
  const byRank = new Map<string, { key: string; label: string; ready: number; other: number; total: number }>();

  function increment(
    map: Map<string, { key: string; label: string; ready: number; other: number; total: number }>,
    key: string,
    label: string,
    ready: boolean
  ) {
    const current = map.get(key) ?? { key, label, ready: 0, other: 0, total: 0 };
    current.total += 1;
    if (ready) current.ready += 1;
    else current.other += 1;
    map.set(key, current);
  }

  for (const record of records) {
    const ready = record.situacao === "pronto";
    const scales = toStringList(record.escalaServico);
    const rank = record.postoGraduacao || "Sem posto/grad";

    increment(byRank, rank, rank, ready);

    if (!scales.length) {
      increment(byScale, "__sem_escala", "Sem escala", ready);
    } else {
      for (const scale of scales) {
        increment(byScale, scale, scaleLabel(scale), ready);
      }
    }
  }

  const rankOrder = new Map(MILITARY_RANK_ORDER.map((rank, index) => [rank, index]));

  return {
    byScale: Array.from(byScale.values()).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, "pt-BR")),
    byRank: Array.from(byRank.values()).sort((a, b) => {
      const aIndex = rankOrder.get(a.key) ?? MILITARY_RANK_ORDER.length;
      const bIndex = rankOrder.get(b.key) ?? MILITARY_RANK_ORDER.length;
      return aIndex - bIndex || a.label.localeCompare(b.label, "pt-BR");
    })
  };
}

export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  await connectToDatabase();

  const today = new Date();
  const nextSevenDays = new Date(today);
  nextSevenDays.setDate(today.getDate() + 7);

  const [
    commitmentsByStatus,
    maintenanceByPriority,
    documentsByStatus,
    urgentDocuments,
    vehiclesByAvailability,
    vehiclesByCategoryAvailability,
    creditNotesEmTela,
    personnelRecords,
    documentsTotal,
    activitiesTotal,
    highNeeds
  ] = await Promise.all([
    Commitment.aggregate([
      {
        $group: {
          _id: "$statusEntrega",
          count: { $sum: 1 },
          total: { $sum: "$valorOperacao" }
        }
      }
    ]),
    MaintenanceNeed.aggregate([
      {
        $group: {
          _id: "$prioridade",
          count: { $sum: 1 },
          total: { $sum: "$totalOrcamento" }
        }
      }
    ]),
    ControlledDocument.aggregate([
      {
        $group: {
          _id: "$situacao",
          count: { $sum: 1 }
        }
      }
    ]),
    ControlledDocument.find({
      situacao: { $ne: "respondido" },
      prazo: { $lte: nextSevenDays }
    })
      .select("numeroDiex prazo responsavel assunto situacao")
      .sort({ prazo: 1 })
      .limit(8)
      .lean(),
    Vehicle.aggregate([
      {
        $group: {
          _id: "$disponibilidade",
          count: { $sum: 1 }
        }
      }
    ]),
    Vehicle.aggregate([
      {
        $group: {
          _id: {
            categoria: { $ifNull: ["$categoria", "__fallback"] },
            disponibilidade: "$disponibilidade"
          },
          count: { $sum: 1 }
        }
      }
    ]),
    CreditNote.find({ emTela: true })
      .select("numeroNC valorNC saldoNC commitmentIds allocations emTela")
      .lean(),
    Personnel.find({})
      .select("postoGraduacao situacao escalaServico")
      .lean<PersonnelDashboardRecord[]>(),
    ControlledDocument.countDocuments({}),
    Activity.countDocuments({}),
    MaintenanceNeed.countDocuments({ prioridade: "alta" })
  ]);
  const personnelBreakdown = buildPersonnelBreakdown(personnelRecords);
  const personnelReady = personnelRecords.filter((item) => item.situacao === "pronto").length;
  const hydratedCreditNotes = await hydrateCreditNotes(creditNotesEmTela);
  const saldoEmTela = hydratedCreditNotes.reduce(
    (sum, item) => sum + Number(item.saldoNC ?? 0),
    0
  );

  return NextResponse.json({
    data: {
      commitmentsByStatus,
      maintenanceByPriority,
      documentsByStatus,
      urgentDocuments: serializeDocs(urgentDocuments),
      vehiclesByAvailability,
      vehiclesByCategoryAvailability,
      personnelByScale: personnelBreakdown.byScale,
      personnelByRank: personnelBreakdown.byRank,
      saldoEmTela,
      personnelReady,
      documentsTotal,
      activitiesTotal,
      highNeeds
    }
  });
}
