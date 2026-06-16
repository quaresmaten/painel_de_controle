import mongoose, { Schema } from "mongoose";

const supplierSchema = new Schema(
  {
    razaoSocial: { type: String, required: true, trim: true },
    cnpj: { type: String, trim: true },
    email: { type: String, trim: true },
    contato: { type: String, trim: true },
    endereco: { type: String, trim: true },
    cidade: { type: String, trim: true },
    uf: { type: String, trim: true },
    observacoes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

supplierSchema.index({ razaoSocial: 1 });
supplierSchema.index({ cnpj: 1 });

export const Supplier =
  mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);
