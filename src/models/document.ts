import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
  {
    numeroDiex: { type: String, required: true, trim: true },
    prazo: { type: Date },
    responsavel: { type: String, trim: true },
    numeroDiexResposta: { type: String, trim: true },
    assunto: { type: String, trim: true },
    situacao: {
      type: String,
      enum: ["pendente", "respondido", "atrasado"],
      default: "pendente",
      required: true
    },
    observacoes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

documentSchema.index({ numeroDiex: 1 }, { unique: true });
documentSchema.index({ prazo: 1 });
documentSchema.index({ situacao: 1 });

export const ControlledDocument =
  mongoose.models.ControlledDocument ||
  mongoose.model("ControlledDocument", documentSchema);
