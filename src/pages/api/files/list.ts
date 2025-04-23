// src/pages/api/files/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const files = await prisma.file.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        url: true,
        uploadedBy: true,
        createdAt: true,
      },
    });
    return res.status(200).json(files);
  } catch (err) {
    console.error("List files error:", err);
    return res.status(500).json({ error: "Failed to fetch files" });
  }
}

