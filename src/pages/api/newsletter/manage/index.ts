// src/pages/api/newsletter/manage/index.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = String(session.user.id);

  const subscriber = await prisma.subscriber.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: { where: { status: "ACTIVE" }, include: { list: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

  res.json({
    name: subscriber.name,
    email: subscriber.email,
    subscriptions: subscriber.subscriptions.map((s) => ({
      id: s.id,
      listName: s.list.name,
    })),
    tags: subscriber.tags.map((st) => ({
      id: st.tagId,
      name: st.tag.name,
    })),
  });
}

