import { Types, type Model } from "mongoose";

import {
  computeCommitmentFields,
  computeCreditNoteFields,
  computeDocumentStatus,
  computeMaintenanceTotal
} from "@/src/lib/calculations";
import type { ResourceKey } from "@/src/lib/validation";
import { Activity } from "@/src/models/activity";
import { Commitment } from "@/src/models/commitment";
import { CreditNote } from "@/src/models/credit-note";
import { ControlledDocument } from "@/src/models/document";
import { MaintenanceNeed } from "@/src/models/maintenance-need";
import { Payable } from "@/src/models/payable";
import { Personnel } from "@/src/models/personnel";
import { Supplier } from "@/src/models/supplier";
import { Vehicle } from "@/src/models/vehicle";

export const resourceModels: Record<ResourceKey, Model<unknown>> = {
  suppliers: Supplier,
  commitments: Commitment,
  payables: Payable,
  "credit-notes": CreditNote,
  "maintenance-needs": MaintenanceNeed,
  vehicles: Vehicle,
  personnel: Personnel,
  documents: ControlledDocument,
  activities: Activity
};

type CreditNoteRecord = Record<string, unknown> & {
  _id?: unknown;
  id?: unknown;
  valorNC?: number | null;
  saldoNC?: number | null;
  commitmentIds?: unknown[];
  allocations?: Array<{ valorNE?: number | null; valorLiquidado?: number | null }>;
};

function normalizeObjectIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map(String).filter((item) => Types.ObjectId.isValid(item));
}

async function sumCommitmentsByIds(ids: string[]) {
  if (!ids.length) return 0;

  const commitments = await Commitment.find({ _id: { $in: ids } })
    .select("valorOperacao")
    .lean<Array<{ valorOperacao?: number | null }>>();

  return commitments.reduce((sum, item) => sum + Number(item.valorOperacao ?? 0), 0);
}

export async function hydrateCreditNotes<T extends CreditNoteRecord>(records: T[]) {
  const allCommitmentIds = Array.from(
    new Set(records.flatMap((record) => normalizeObjectIds(record.commitmentIds)))
  );

  const totalsByCommitmentId = new Map<string, number>();

  if (allCommitmentIds.length) {
    const commitments = await Commitment.find({ _id: { $in: allCommitmentIds } })
      .select("valorOperacao")
      .lean<Array<{ _id: unknown; valorOperacao?: number | null }>>();

    for (const commitment of commitments) {
      totalsByCommitmentId.set(String(commitment._id), Number(commitment.valorOperacao ?? 0));
    }
  }

  return records.map((record) => {
    const commitmentIds = normalizeObjectIds(record.commitmentIds);
    const commitmentTotal = commitmentIds.length
      ? commitmentIds.reduce((sum, id) => sum + (totalsByCommitmentId.get(id) ?? 0), 0)
      : undefined;
    const computed = computeCreditNoteFields({
      valorNC: record.valorNC,
      allocations: record.allocations,
      commitmentTotal
    });

    return {
      ...record,
      saldoNC: computed.saldoNC,
      allocations: computed.allocations ?? record.allocations
    };
  });
}

export async function prepareResourceData({
  resource,
  data,
  userId,
  existing
}: {
  resource: ResourceKey;
  data: Record<string, unknown>;
  userId: string;
  existing?: Record<string, unknown> | null;
}) {
  const next: Record<string, unknown> = {
    ...data,
    updatedBy: userId
  };

  if (!existing) {
    next.createdBy = userId;
  }

  if (resource === "commitments") {
    Object.assign(
      next,
      computeCommitmentFields({
        dataEmissao: next.dataEmissao as Date | string | null | undefined,
        statusEntrega: next.statusEntrega as string | null | undefined
      })
    );
  }

  if (resource === "credit-notes") {
    const commitmentIds = normalizeObjectIds(next.commitmentIds);
    const allocations = Array.isArray(next.allocations)
      ? (next.allocations as Array<{ valorNE?: number | null; valorLiquidado?: number | null }>)
      : Array.isArray(existing?.allocations)
        ? (existing.allocations as Array<{ valorNE?: number | null; valorLiquidado?: number | null }>)
        : undefined;
    const commitmentTotal = commitmentIds.length
      ? await sumCommitmentsByIds(commitmentIds)
      : undefined;

    next.commitmentIds = commitmentIds;

    Object.assign(
      next,
      computeCreditNoteFields({
        valorNC: next.valorNC as number | null | undefined,
        allocations,
        commitmentTotal
      })
    );
  }

  if (resource === "maintenance-needs") {
    next.totalOrcamento = computeMaintenanceTotal({
      budgetItems: next.budgetItems as Array<{ valorTotal?: number | null }>
    });
  }

  if (resource === "documents") {
    next.situacao = computeDocumentStatus({
      prazo: next.prazo as Date | string | null | undefined,
      numeroDiexResposta: next.numeroDiexResposta as string | null | undefined,
      situacao: next.situacao as string | null | undefined
    });
  }

  if (resource === "vehicles") {
    const incomingHistory = Array.isArray(next.history) ? next.history : [];

    if (existing) {
      const existingHistory = Array.isArray(existing.history) ? existing.history : [];
      const newHistory = incomingHistory
        .slice(existingHistory.length)
        .map((item) => ({
          ...(item as Record<string, unknown>),
          createdBy: (item as Record<string, unknown>).createdBy || userId
        }));

      next.history = [...existingHistory, ...newHistory];
    } else {
      next.history = incomingHistory.map((item) => ({
        ...(item as Record<string, unknown>),
        createdBy: (item as Record<string, unknown>).createdBy || userId
      }));
    }
  }

  return next;
}
