// src/pages/api/newsletter/manage/remove-subscription.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { subscriptionId } = req.body;
  if (!subscriptionId) return res.status(400).json({ error: "Missing subscriptionId" });

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
  });

  res.status(200).json({ success: true });
}

