import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }            from "next-auth/next";
import { authOptions }                 from "@/pages/api/auth/[...nextauth]";
import { prisma }                      from "@/lib/db";

// GET /api/notifications → list (un)read notifications
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const userId = String(session.user.id);
	const notifs = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return res.status(200).json(notifs);
  }

  if (req.method === "POST") {
    // mark as read: body = { ids: string[] }
    const userId = String(session.user.id);
	const { ids } = req.body as { ids: string[] };
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId },
      data: { isRead: true },
    });
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}

