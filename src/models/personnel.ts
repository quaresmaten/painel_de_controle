import mongoose, { Schema } from "mongoose";

const punishmentSchema = new Schema(
  {
    data: { type: Date },
    motivo: { type: String, trim: true },
    observacoes: { type: String, trim: true }
  },
  { _id: false }
);

const leaveSchema = new Schema(
  {
    dataInicio: { type: Date },
    dataFim: { type: Date },
    motivo: { type: String, trim: true },
    observacoes: { type: String, trim: true }
  },
  { _id: false }
);

const personnelSchema = new Schema(
  {
    postoGraduacao: { type: String, required: true, trim: true },
    nome: { type: String, required: true, trim: true },
    pelotao: { type: String, trim: true },
    funcao: { type: String, trim: true },
    escalaServico: { type: [{ type: String, trim: true }], default: [] },
    avaliacao: { type: String, enum: ["E", "MB", "B", "R", "I"] },
    situacao: {
      type: String,
      enum: [
        "pronto",
        "ferias",
        "dispensa_medica",
        "encostado",
        "adido",
        "missao_externa",
        "outros",
        "missao"
      ],
      default: "pronto",
      required: true
    },
    destinoOuMissao: { type: String, trim: true },
    punicoes: { type: [punishmentSchema], default: [] },
    dispensas: { type: [leaveSchema], default: [] },
    observacoes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

personnelSchema.index({ nome: 1 });
personnelSchema.index({ pelotao: 1 });
personnelSchema.index({ situacao: 1 });
personnelSchema.index({ avaliacao: 1 });

export const Personnel =
  mongoose.models.Personnel || mongoose.model("Personnel", personnelSchema);
