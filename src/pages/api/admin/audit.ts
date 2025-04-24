// src/pages/api/admin/audit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }            from "next-auth/next";
import { authOptions }                 from "@/pages/api/auth/[...nextauth]";
import { prisma }                      from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  // ⬇️ Coerce the ID to string here:
  const userId = String(session.user.id);

  const isAdmin = await prisma.userRole.findFirst({
    where: {
      userId,               // now a string
      role: { name: "admin" },
    },
  });
  if (!isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return res.status(200).json(logs);
}

