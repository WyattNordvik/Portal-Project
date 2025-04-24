// src/pages/api/newsletter/lists.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma }                              from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // return all lists
    const lists = await prisma.newsletterList.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json(lists);

  } else if (req.method === "POST") {
    // create a new list
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "A valid `name` is required" });
    }

    // enforce uniqueness at DB level will throw if duplicate
    try {
      const newList = await prisma.newsletterList.create({
        data: { name },
      });
      return res.status(201).json(newList);
    } catch (e: any) {
      // e.g. unique constraint violation
      return res.status(409).json({ error: e.message });
    }

  } else {
    // all other methods not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

