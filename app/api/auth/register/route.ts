import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/src/lib/mongodb";
import { User } from "@/src/models/user";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatorio"),
  email: z.string().email("E-mail inválido").transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres")
});

export async function POST(request: Request) {
  await connectToDatabase();

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const existing = await User.findOne({ email: parsed.data.email }).lean();
  if (existing) {
    return NextResponse.json(
      { message: "Já existe um cadastro com esse e-mail" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: "viewer",
    status: "pending"
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
