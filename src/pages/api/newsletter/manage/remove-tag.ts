// src/pages/api/newsletter/manage/remove-tag.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { tagId } = req.body;
  if (!tagId) return res.status(400).json({ error: "Missing tagId" });

  await prisma.subscriberTag.deleteMany({
    where: {
      subscriberId: String(session.user.id),
      tagId,
    },
  });

  res.status(200).json({ success: true });
}

