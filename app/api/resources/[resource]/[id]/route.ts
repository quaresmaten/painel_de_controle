import { Types } from "mongoose";
import { NextResponse } from "next/server";

import { requireAdminUser, requireApprovedUser } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/mongodb";
import { hydrateCreditNotes, prepareResourceData, resourceModels } from "@/src/lib/resources";
import { serializeDoc } from "@/src/lib/serialize";
import { isResourceKey, resourceSchemas } from "@/src/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: {
    resource: string;
    id: string;
  };
};

function validateParams(params: Context["params"]) {
  if (!isResourceKey(params.resource)) {
    return { error: NextResponse.json({ message: "Módulo inválido" }, { status: 404 }) };
  }

  if (!Types.ObjectId.isValid(params.id)) {
    return { error: NextResponse.json({ message: "ID inválido" }, { status: 400 }) };
  }

  return { resource: params.resource, id: params.id };
}

export async function GET(_request: Request, { params }: Context) {
  const valid = validateParams(params);
  if ("error" in valid) return valid.error;

  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  await connectToDatabase();

  const model = resourceModels[valid.resource];
  const record = await model.findById(valid.id).lean();

  if (!record) {
    return NextResponse.json({ message: "Registro não encontrado" }, { status: 404 });
  }

  const data =
    valid.resource === "credit-notes" ? (await hydrateCreditNotes([record]))[0] : record;

  return NextResponse.json({ data: serializeDoc(data) });
}

export async function PUT(request: Request, { params }: Context) {
  const valid = validateParams(params);
  if ("error" in valid) return valid.error;

  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Apenas admin pode alterar dados" }, { status: 403 });
  }

  await connectToDatabase();

  const model = resourceModels[valid.resource];
  const existing = await model.findById(valid.id).lean<Record<string, unknown>>();

  if (!existing) {
    return NextResponse.json({ message: "Registro não encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = resourceSchemas[valid.resource].safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const payload = await prepareResourceData({
    resource: valid.resource,
    data: parsed.data,
    userId: user.id,
    existing
  });

  try {
    const updated = await model
      .findByIdAndUpdate(valid.id, { $set: payload }, { new: true, runValidators: true })
      .lean();

    return NextResponse.json({ data: serializeDoc(updated) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao atualizar registro" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const valid = validateParams(params);
  if ("error" in valid) return valid.error;

  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Apenas admin pode alterar dados" }, { status: 403 });
  }

  await connectToDatabase();

  const model = resourceModels[valid.resource];
  const deleted = await model.findByIdAndDelete(valid.id).lean();

  if (!deleted) {
    return NextResponse.json({ message: "Registro não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
