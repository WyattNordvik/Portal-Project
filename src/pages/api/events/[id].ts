// src/pages/api/events/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }   from "next-auth/next";
import { authOptions }        from "@/pages/api/auth/[...nextauth]";
import { prisma }             from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Protect
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  const { id } = req.query as { id: string };

  // Update
  if (req.method === "PUT") {
    const { title, description, start, end } = req.body;
    const updated = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        start: new Date(start),
        end: new Date(end),
      },
    });
    return res.status(200).json(updated);
  }

  // Delete
  if (req.method === "DELETE") {
    await prisma.event.delete({ where: { id } });
    return res.status(204).end();
  }

  // Disallow others
  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

