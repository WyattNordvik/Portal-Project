// src/pages/api/newsletter/tags/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma }                              from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) return res.status(400).json({ error: "Missing tag ID" });

  if (req.method === "DELETE") {
    try {
      await prisma.tag.delete({ where: { id } });
      return res.status(204).end();
    } catch {
      return res.status(404).json({ error: "Tag not found" });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

