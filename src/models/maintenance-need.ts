import mongoose, { Schema } from "mongoose";

const budgetItemSchema = new Schema(
  {
    codigo: { type: String, trim: true },
    fonte: { type: String, trim: true },
    descricao: { type: String, trim: true },
    unidade: { type: String, trim: true },
    quantidade: { type: Number, default: 0 },
    valorUnitario: { type: Number, default: 0 },
    valorComBdi: { type: Number, default: 0 },
    valorTotal: { type: Number, default: 0 },
    percentual: { type: Number, default: 0 }
  },
  { _id: false }
);

const maintenanceNeedSchema = new Schema(
  {
    tipo: {
      type: String,
      enum: ["instalacao", "aquisicao"],
      default: "instalacao"
    },
    instalacao: { type: String, required: true, trim: true },
    ambiente: { type: String, trim: true },
    servicoSolicitado: { type: String, required: true, trim: true },
    prioridade: {
      type: String,
      enum: ["baixa", "media", "alta", "critica"],
      default: "media"
    },
    situacao: {
      type: String,
      enum: ["aberta", "em_andamento", "resolvida", "cancelada"],
      default: "aberta"
    },
    credito: { type: String, trim: true },
    numeroOpus: { type: String, trim: true },
    ordemServico: { type: String, trim: true },
    numeroNE: { type: String, trim: true },
    dataInicio: { type: Date },
    dataTermino: { type: Date },
    observacoes: { type: String, trim: true },
    budgetItems: { type: [budgetItemSchema], default: [] },
    totalOrcamento: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

maintenanceNeedSchema.index({ prioridade: 1 });
maintenanceNeedSchema.index({ tipo: 1 });
maintenanceNeedSchema.index({ situacao: 1 });

export const MaintenanceNeed =
  mongoose.models.MaintenanceNeed ||
  mongoose.model("MaintenanceNeed", maintenanceNeedSchema);
