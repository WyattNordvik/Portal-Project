// src/pages/api/newsletter/manage/unsubscribe-all.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = String(session.user.id);

  // Unsubscribe from all lists
  await prisma.subscription.updateMany({
    where: { subscriber: { userId }, status: "ACTIVE" },
    data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
  });

  // Remove all tags
  await prisma.subscriberTag.deleteMany({
    where: { subscriber: { userId } },
  });

  res.status(200).json({ success: true });
}

