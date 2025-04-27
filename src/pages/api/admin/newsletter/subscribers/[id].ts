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

  // 3. Get the subscriber id
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid subscriber id" });
  }

  // 4. Handle DELETE
  if (req.method === "DELETE") {
    try {
      // 🔥 First delete subscriptions
      await prisma.subscription.deleteMany({
        where: { subscriberId: id },
      });

      // 🔥 Then delete the subscriber
      await prisma.subscriber.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Subscriber deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete subscriber" });
    }
  }

  // 5. Handle other methods
  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

