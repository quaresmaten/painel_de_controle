import mongoose, { Schema } from "mongoose";

const payableSchema = new Schema(
  {
    ug: { type: String, trim: true },
    cgcFex: { type: String, trim: true },
    pi: { type: String, trim: true },
    nd: { type: String, trim: true },
    numeroNE: { type: String, required: true, trim: true },
    dataEmissao: { type: Date },
    dias: { type: Number, default: 0 },
    descricao: { type: String, trim: true },
    valorALiquidar: { type: Number, default: 0 },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
    empresaTexto: { type: String, trim: true },
    material: { type: String, trim: true },
    formalizacao: { type: String, trim: true },
    liquidacao: { type: String, trim: true },
    situacao: { type: String, trim: true },
    status: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

payableSchema.index({ numeroNE: 1 }, { unique: true });
payableSchema.index({ status: 1 });

export const Payable =
  mongoose.models.Payable || mongoose.model("Payable", payableSchema);
