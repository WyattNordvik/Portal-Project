// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, name, password } = req.body;
  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

