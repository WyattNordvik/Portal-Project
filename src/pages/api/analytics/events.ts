// src/pages/api/analytics/events.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const events = await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.status(200).json(events);
  } catch (err) {
    console.error("Fetch analytics events error:", err);
    return res.status(500).json({ error: "Failed to fetch analytics events" });
  }
}
