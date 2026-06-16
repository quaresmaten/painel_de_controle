import mongoose, { Schema } from "mongoose";

const vehicleHistorySchema = new Schema(
  {
    data: { type: Date, default: Date.now },
    tipo: { type: String, trim: true },
    descricao: { type: String, trim: true },
    local: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { _id: false }
);

const vehicleSchema = new Schema(
  {
    marcaModelo: { type: String, required: true, trim: true },
    placaOuIdentificacao: { type: String, trim: true },
    disponibilidade: {
      type: String,
      enum: ["disponivel", "indisponivel"],
      default: "disponivel",
      required: true
    },
    tipoPneu: { type: String, trim: true },
    localAtual: { type: String, trim: true },
    situacaoAtual: { type: String, trim: true },
    observacoes: { type: String, trim: true },
    history: { type: [vehicleHistorySchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

vehicleSchema.index({ disponibilidade: 1 });
vehicleSchema.index({ placaOuIdentificacao: 1 });

export const Vehicle =
  mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
