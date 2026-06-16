import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    data: { type: Date },
    responsavel: { type: String, trim: true },
    descricao: { type: String, trim: true },
    personnelIds: [{ type: Schema.Types.ObjectId, ref: "Personnel" }],
    vehicleIds: [{ type: Schema.Types.ObjectId, ref: "Vehicle" }],
    observacoes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

activitySchema.index({ data: 1 });

export const Activity =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);
