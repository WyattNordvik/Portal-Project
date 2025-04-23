// src/pages/api/analytics/log.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, action, metadata } = req.body as {
    userId: string;
    action: string;
    metadata?: any;
  };

  if (!userId || !action) {
    return res.status(400).json({ error: "Missing userId or action" });
  }

  try {
    const event = await prisma.analyticsEvent.create({
      data: { userId, action, metadata },
    });
    return res.status(201).json(event);
  } catch (err) {
    console.error("Analytics log error:", err);
    return res.status(500).json({ error: "Failed to log event" });
  }
}

