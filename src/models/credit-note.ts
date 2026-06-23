import mongoose, { Schema } from "mongoose";

const allocationSchema = new Schema(
  {
    requisicao: { type: String, trim: true },
    valorRequisicao: { type: Number, default: 0 },
    numeroNEGerada: { type: String, trim: true },
    valorNE: { type: Number, default: 0 },
    valorLiquidado: { type: Number, default: 0 },
    valorNaoLiquidado: { type: Number, default: 0 }
  },
  { _id: false }
);

const creditNoteSchema = new Schema(
  {
    ug: { type: String, trim: true },
    numeroNC: { type: String, required: true, trim: true },
    prazo: { type: Date },
    prazoTipo: { type: String, enum: ["date", "imediato"], default: "date" },
    pi: { type: String, trim: true },
    nd: { type: String, trim: true },
    valorNC: { type: Number, default: 0 },
    saldoNC: { type: Number, default: 0 },
    objeto: { type: String, trim: true },
    sugestao: { type: String, trim: true },
    observacoes: { type: String, trim: true },
    solicitarRecolhimento: { type: Boolean, default: false },
    emTela: { type: Boolean, default: false },
    commitmentIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Commitment" }],
      default: []
    },
    allocations: { type: [allocationSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

creditNoteSchema.index({ numeroNC: 1 }, { unique: true });
creditNoteSchema.index({ prazo: 1 });
creditNoteSchema.index({ ug: 1 });

export const CreditNote =
  mongoose.models.CreditNote || mongoose.model("CreditNote", creditNoteSchema);
