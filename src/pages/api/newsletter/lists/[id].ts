import type { NextApiRequest, NextApiResponse } from "next";
import { prisma }                              from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) return res.status(400).json({ error: "Missing list ID" });

  if (req.method === "PUT") {
    const { name, description } = req.body as {
      name?: string;
      description?: string;
    };
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "`name` is required" });
    }
    try {
      const updated = await prisma.newsletterList.update({
        where: { id },
        data: { name, description },
      });
      return res.status(200).json(updated);
    } catch (e: any) {
      return res.status(404).json({ error: "List not found" });
    }

  } else if (req.method === "DELETE") {
    try {
      await prisma.newsletterList.delete({ where: { id } });
      return res.status(204).end();
    } catch {
      return res.status(404).json({ error: "List not found" });
    }

  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

