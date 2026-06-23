import mongoose, { Schema } from "mongoose";

const personnelSchema = new Schema(
  {
    postoGraduacao: { type: String, required: true, trim: true },
    nome: { type: String, required: true, trim: true },
    pelotao: { type: String, trim: true },
    funcao: { type: String, trim: true },
    escalaServico: { type: String, trim: true },
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
    observacoes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

personnelSchema.index({ nome: 1 });
personnelSchema.index({ pelotao: 1 });
personnelSchema.index({ situacao: 1 });

export const Personnel =
  mongoose.models.Personnel || mongoose.model("Personnel", personnelSchema);
