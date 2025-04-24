import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }            from "next-auth/next";
import { authOptions }                 from "@/pages/api/auth/[...nextauth]";
import { prisma }                      from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method !== "GET") {
    return res.setHeader("Allow", ["GET"]).status(405).end();
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.status(200).json(logs);
}

