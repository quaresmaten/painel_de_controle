import { NextResponse } from "next/server";

import { requireApprovedUser } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/mongodb";
import { serializeDocs } from "@/src/lib/serialize";
import { Commitment } from "@/src/models/commitment";
import { CreditNote } from "@/src/models/credit-note";
import { ControlledDocument } from "@/src/models/document";
import { MaintenanceNeed } from "@/src/models/maintenance-need";
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
    creditNotes,
    maintenanceByPriority,
    documentsByStatus,
    urgentDocuments,
    vehiclesByAvailability
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
    CreditNote.find({})
      .select("numeroNC prazo prazoTipo valorNC saldoNC objeto emTela")
      .sort({ prazo: 1 })
      .limit(8)
      .lean(),
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
    ])
  ]);

  return NextResponse.json({
    data: {
      commitmentsByStatus,
      creditNotes: serializeDocs(creditNotes),
      maintenanceByPriority,
      documentsByStatus,
      urgentDocuments: serializeDocs(urgentDocuments),
      vehiclesByAvailability
    }
  });
}
