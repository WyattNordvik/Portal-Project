import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions }      from "@/pages/api/auth/[...nextauth]";
import { prisma }           from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  const { id } = req.query as { id: string };
  const { action, tagRelationId } = req.body;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (action === "remove") {
    await prisma.subscriberTag.delete({ where: { id: tagRelationId } });
    return res.status(200).json({ success: true });
  }

  return res.status(400).json({ error: "Invalid action" });
}

