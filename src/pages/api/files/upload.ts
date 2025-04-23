
// src/pages/api/files/upload.ts
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/s3";

// Disable Next.js default body parser to use formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(400).json({ error: "Form parsing error" });
    }

    const file = Array.isArray((files as any).file)
      ? (files as any).file[0]
      : (files as any).file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    try {
      // Read the file into a buffer
      const data = await fs.promises.readFile(file.filepath);
      // Generate a unique key (e.g. timestamp + original name)
      const key = `uploads/${Date.now()}-${file.originalFilename}`;
      // Upload to S3
      const url = await uploadFile(key, data);

      // Extract userId from form fields
      const userId = fields.userId as string;

      // Save metadata in the database
      const record = await prisma.file.create({
        data: {
          filename: file.originalFilename || key,
          url,
          uploadedBy: userId,
        },
      });

      return res.status(201).json(record);
    } catch (e) {
      console.error("Upload error:", e);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}


