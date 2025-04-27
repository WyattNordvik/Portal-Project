// src/pages/api/admin/newsletter/subscribers/[subscriberId].ts
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

  const { id } = req.query as { id: string };

  if (req.method === "DELETE") {
    try {
      await prisma.subscriber.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Subscriber deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete subscriber" });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

