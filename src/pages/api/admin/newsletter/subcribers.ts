// src/pages/api/admin/newsletter/subscribers.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }                     from "next-auth/next";
import { authOptions }                          from "@/pages/api/auth/[...nextauth]";
import { prisma }                               from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Optional filters from query
  const { listId, tagId } = req.query as { listId?: string; tagId?: string };

  // Build where clause
  const where: any = {};
  if (listId) where.subscriptions = { some: { listId, status: "ACTIVE" } };
  if (tagId)   where.tags          = { some: { tagId } };

  // Fetch subscribers
  const subs = await prisma.subscriber.findMany({
    where,
    include: {
      subscriptions: { where: { status: "ACTIVE" }, include: { list: true } },
      tags:           { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map to a simpler shape
  const result = subs.map((s) => ({
    id:    s.id,
    email: s.email,
    name:  s.name,
    phone: s.phone,
    lists: s.subscriptions.map((su) => su.list.name),
    tags:  s.tags.map((st) => st.tag.name),
    joinedAt: s.subscriptions[0]?.subscribedAt,
  }));

  res.status(200).json(result);
}

