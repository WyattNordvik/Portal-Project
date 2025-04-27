// /api/admin/newsletter/subscribers.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Auth + admin check
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  // 2) Only allow GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 3) Parse optional filters
  const { listId, tagId } = req.query as { listId?: string; tagId?: string };
  const where: any = {};
  if (listId) where.subscriptions = { some: { listId, status: "ACTIVE" } };
  if (tagId) where.tags = { some: { tagId } };

  // 4) Fetch subscribers with their lists & tags
  const subs = await prisma.subscriber.findMany({
    where,
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { list: true },
      },
      tags: {
        include: { tag: true }, // <- get full tag info (id + name)
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 5) Shape the result
  const result = subs.map((s) => ({
    id: s.id,
    email: s.email,
    name: s.name,
    phone: s.phone,
    lists: s.subscriptions.map((su) => ({
      id: su.list.id,
      name: su.list.name,
    })),
    tags: s.tags.map((st) => ({
      id: st.tag.id,
      name: st.tag.name,
    })),
    joinedAt: s.subscriptions[0]?.subscribedAt || null,
  }));

  return res.status(200).json(result);
}

