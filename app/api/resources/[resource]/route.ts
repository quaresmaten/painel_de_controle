import { NextResponse } from "next/server";

import { requireAdminUser, requireApprovedUser } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/mongodb";
import { prepareResourceData, resourceModels } from "@/src/lib/resources";
import { serializeDocs, serializeDoc } from "@/src/lib/serialize";
import { isResourceKey, resourceSchemas } from "@/src/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: {
    resource: string;
  };
};

export async function GET(_request: Request, { params }: Context) {
  const resource = params.resource;
  if (!isResourceKey(resource)) {
    return NextResponse.json({ message: "Módulo inválido" }, { status: 404 });
  }

  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  await connectToDatabase();

  const model = resourceModels[resource];
  const records = await model.find({}).sort({ updatedAt: -1 }).limit(500).lean();

  return NextResponse.json({ data: serializeDocs(records) });
}

export async function POST(request: Request, { params }: Context) {
  const resource = params.resource;
  if (!isResourceKey(resource)) {
    return NextResponse.json({ message: "Módulo inválido" }, { status: 404 });
  }

  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Apenas admin pode alterar dados" }, { status: 403 });
  }

  await connectToDatabase();

  const body = await request.json();
  const parsed = resourceSchemas[resource].safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const model = resourceModels[resource];
  const payload = prepareResourceData({
    resource,
    data: parsed.data,
    userId: user.id
  });

  try {
    const created = await model.create(payload);
    return NextResponse.json({ data: serializeDoc(created.toObject()) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao criar registro" },
      { status: 400 }
    );
  }
}
