import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminUser } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/mongodb";
import { serializeDoc } from "@/src/lib/serialize";
import { User } from "@/src/models/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  role: z.enum(["viewer", "admin"]).default("viewer")
});

type Context = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: Context) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Apenas admin" }, { status: 403 });
  }

  if (!Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos" }, { status: 422 });
  }

  await connectToDatabase();

  if (params.id === admin.id) {
    return NextResponse.json(
      { message: "O admin atual não pode alterar a própria aprovação" },
      { status: 400 }
    );
  }

  const update =
    parsed.data.status === "approved"
      ? {
          status: "approved",
          role: parsed.data.role,
          approvedAt: new Date(),
          approvedBy: admin.id
        }
      : {
          status: "rejected",
          role: "viewer",
          approvedAt: undefined,
          approvedBy: undefined
        };

  const user = await User.findByIdAndUpdate(params.id, { $set: update }, { new: true })
    .select("-passwordHash")
    .lean();

  if (!user) {
    return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ data: serializeDoc(user) });
}
