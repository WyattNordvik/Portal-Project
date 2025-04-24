// src/pages/api/newsletter/lists.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET makes sense here
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Fetch all newsletter lists
  const lists = await prisma.newsletterList.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  res.status(200).json(lists);
}

