// src/pages/api/newsletter/tags.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma }                              from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET → list all tags
  if (req.method === "GET") {
    const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    return res.status(200).json(tags);

  // POST → create a new tag
  } else if (req.method === "POST") {
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "`name` is required" });
    }
    try {
      const tag = await prisma.tag.create({ data: { name } });
      return res.status(201).json(tag);
    } catch (e: any) {
      return res.status(409).json({ error: e.message });
    }

  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

