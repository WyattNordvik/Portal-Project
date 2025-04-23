// src/pages/api/files/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/s3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { id } = req.query as { id: string };
  try {
    const record = await prisma.file.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: "File not found" });

    // Delete from storage
    const key = record.url.split(`/${process.env.SPACES_BUCKET}/`)[1];
    await deleteFile(key);

    // Delete DB record
    await prisma.file.delete({ where: { id } });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete file error:", err);
    return res.status(500).json({ error: "Failed to delete file" });
  }
}
