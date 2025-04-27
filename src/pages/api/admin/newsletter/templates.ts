import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  if (req.method === "POST") {
    const { name, subject, mjml } = req.body;
    if (!name || !subject || !mjml) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const template = await prisma.newsletterTemplate.create({
      data: { name, subject, mjml },
    });

    return res.status(200).json(template);
  }

  if (req.method === "GET") {
    const templates = await prisma.newsletterTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(templates);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    await prisma.newsletterTemplate.delete({
      where: { id },
    });

    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

