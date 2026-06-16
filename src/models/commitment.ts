import mongoose, { Schema } from "mongoose";

const commitmentSchema = new Schema(
  {
    ug: { type: String, trim: true },
    numeroNE: { type: String, required: true, trim: true },
    numeroNC: { type: String, trim: true },
    pi: { type: String, trim: true },
    dataEmissao: { type: Date },
    prazoEntrega: { type: Date },
    diasDesdeEmissao: { type: Number, default: 0 },
    descricao: { type: String, trim: true },
    valorOperacao: { type: Number, default: 0 },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
    empresaTexto: { type: String, trim: true },
    material: { type: String, trim: true },
    formalizacao: { type: String, trim: true },
    notaFiscal: { type: String, trim: true },
    liquidacao: { type: String, trim: true },
    situacao: { type: String, trim: true },
    motivo: { type: String, trim: true },
    statusEntrega: {
      type: String,
      enum: ["entregue", "no_prazo", "atrasado"],
      default: "no_prazo",
      required: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

commitmentSchema.index({ numeroNE: 1 }, { unique: true });
commitmentSchema.index({ numeroNC: 1 });
commitmentSchema.index({ statusEntrega: 1 });

export const Commitment =
  mongoose.models.Commitment || mongoose.model("Commitment", commitmentSchema);
