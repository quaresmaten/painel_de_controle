import { NextResponse } from "next/server";

import { requireApprovedUser } from "@/src/lib/auth";
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
    personnelReady,
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
    Personnel.countDocuments({ situacao: "pronto" }),
    ControlledDocument.countDocuments({}),
    Activity.countDocuments({}),
    MaintenanceNeed.countDocuments({ prioridade: "alta" })
  ]);
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
      saldoEmTela,
      personnelReady,
      documentsTotal,
      activitiesTotal,
      highNeeds
    }
  });
}
