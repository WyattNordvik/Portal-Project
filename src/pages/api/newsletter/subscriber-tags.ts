// src/pages/api/newsletter/subscriber-tags.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma }                              from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subscriberId, tagId } = req.body as {
    subscriberId?: string;
    tagId?: string;
  };

  if (req.method === "POST") {
    if (!subscriberId || !tagId) {
      return res.status(400).json({ error: "subscriberId & tagId required" });
    }
    try {
      await prisma.subscriberTag.create({
        data: { subscriberId, tagId },
      });
      return res.status(201).end();
    } catch (e: any) {
      return res.status(409).json({ error: e.message });
    }

  } else if (req.method === "DELETE") {
    if (!subscriberId || !tagId) {
      return res.status(400).json({ error: "subscriberId & tagId required" });
    }
    await prisma.subscriberTag.delete({
      where: { subscriberId_tagId: { subscriberId, tagId } },
    });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

