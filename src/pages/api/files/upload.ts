
// src/pages/api/files/upload.ts
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/s3";

// Disable Next.js default body parser
export const config = { api: { bodyParser: false } };

type FormFields = { userId?: string };

type FormFiles = { file?: formidable.File | formidable.File[] };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiple: false, allowEmptyFiles: false });

  try {
    // Parse form with a Promise to integrate with async/await
    const { fields, files } = await new Promise<{ fields: FormFields; files: FormFiles }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields: fields as FormFields, files: files as FormFiles });
      });
    });

    const uploaded = files.file && (Array.isArray(files.file) ? files.file[0] : files.file);
    if (!uploaded) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Check file size
    if (uploaded.size === 0) {
      return res.status(400).json({ error: "File must be larger than 0 bytes" });
    }

    // Read file data
    const data = await fs.promises.readFile(uploaded.filepath);
    const key = `uploads/${Date.now()}-${uploaded.originalFilename}`;
    const url = await uploadFile(key, data);

    // Save metadata
    const rawUserId = fields.userId;
	const userId = 
		Array.isArray(rawUserId) ? rawUserId[0] : rawUserId ?? "";
	if (!userId) {
		return res.status(400).json({ error: "Missing userId" });
	}
    const record = await prisma.file.create({
      data: {
        filename: uploaded.originalFilename || key,
        url,
        uploadedBy: userId,
      },
	await prisma.analyticsEvent.create({
		data: {
		userId,
		action: "file_upload",
		metadata: { fileId: record.id, filename: record.filename },
	  },
    });

    return res.status(201).json(record);
  } catch (err: any) {
    console.error("Form parse error:", err);
    const message = err.message || "Upload failed";
    return res.status(400).json({ error: message });
  }
}

