// src/pages/api/admin/newsletter/subscribers/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Auth
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  // 2. Admin check
  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  // 3. Get subscriber ID
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid subscriber id" });
  }

  // 4. Handle DELETE
  if (req.method === "DELETE") {
    try {
      await prisma.subscription.deleteMany({
        where: { subscriberId: id },
      });
      await prisma.subscriber.delete({
        where: { id },
      });
      return res.status(200).json({ message: "Subscriber deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete subscriber" });
    }
  }

  // 5. Handle GET to load subscriber
  if (req.method === "GET") {
    try {
      const subscriber = await prisma.subscriber.findUnique({
        where: { id },
        include: {
          subscriptions: { include: { list: true } },
          tags: { include: { tag: true } },
        },
      });

      if (!subscriber) {
        return res.status(404).json({ error: "Subscriber not found" });
      }

      // Shape response
      return res.status(200).json({
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
        phone: subscriber.phone,
        lists: subscriber.subscriptions.map((s) => ({
          id: s.listId,
          name: s.list.name,
        })),
        tags: subscriber.tags.map((t) => ({
          id: t.tagId,
          name: t.tag.name,
        })),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to load subscriber" });
    }
  }

  // 6. Handle other methods
  res.setHeader("Allow", ["GET", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
