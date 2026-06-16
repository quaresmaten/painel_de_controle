import type { Model } from "mongoose";

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

export function prepareResourceData({
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
    Object.assign(
      next,
      computeCreditNoteFields({
        valorNC: next.valorNC as number | null | undefined,
        allocations: next.allocations as Array<{
          valorNE?: number | null;
          valorLiquidado?: number | null;
        }>
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
