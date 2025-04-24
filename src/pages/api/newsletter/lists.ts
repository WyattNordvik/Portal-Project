import type { NextApiRequest, NextApiResponse } from "next";
import { prisma }                              from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const lists = await prisma.newsletterList.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json(lists);

  } else if (req.method === "POST") {
    const { name, description } = req.body as {
      name?: string;
      description?: string;
    };
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "`name` is required" });
    }
    try {
      const newList = await prisma.newsletterList.create({
        data: { name, description },
      });
      return res.status(201).json(newList);
    } catch (e: any) {
      return res.status(409).json({ error: e.message });
    }

  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

