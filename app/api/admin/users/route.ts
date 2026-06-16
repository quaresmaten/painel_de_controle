import { NextResponse } from "next/server";

import { requireAdminUser } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/mongodb";
import { serializeDocs } from "@/src/lib/serialize";
import { User } from "@/src/models/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Apenas admin" }, { status: 403 });
  }

  await connectToDatabase();

  const users = await User.find({ _id: { $ne: admin.id } })
    .select("-passwordHash")
    .sort({ status: 1, createdAt: -1 })
    .lean();

  return NextResponse.json({ data: serializeDocs(users) });
}
