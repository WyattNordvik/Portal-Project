// src/pages/api/files/upload.ts
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/s3";
import { sendEmail } from "@/lib/email";

// Disable Next.js default body parser for file uploads
export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse multipart form data
  const form = formidable({ multiples: false, allowEmptyFiles: false });

  try {
    const { fields, files } = await new Promise<{ fields: Record<string, any>; files: Record<string, any> }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Retrieve the uploaded file
    const uploaded = files.file && (Array.isArray(files.file) ? files.file[0] : files.file);
    if (!uploaded) {
      return res.status(400).json({ error: "No file provided" });
    }
    if (uploaded.size === 0) {
      return res.status(400).json({ error: "File must be larger than 0 bytes" });
    }

    // Read file buffer and upload to S3/Spaces
    const buffer = await fs.promises.readFile(uploaded.filepath);
    const key = `uploads/${Date.now()}-${uploaded.originalFilename}`;
    const url = await uploadFile(key, buffer);

    // Normalize and validate userId
    const rawUserId = fields.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    if (typeof userId !== "string" || !userId) {
      return res.status(400).json({ error: "Missing or invalid userId" });
    }

    // Save file metadata
    const record = await prisma.file.create({
      data: {
        filename: uploaded.originalFilename || key,
        url,
        uploadedBy: userId,
      },
    });

    // Log analytics event for the upload
    await prisma.analyticsEvent.create({
      data: {
        userId,
        action: "file_upload",
        metadata: {
          fileId: record.id,
          filename: record.filename,
        },
      },
    });

	// ... inside the successful upload block, after analytics:
	const allUsers = await prisma.user.findMany({ select: { id: true } });
	const notifMessage = `New file uploaded: ${record.filename}`;

	await Promise.all(
		allUsers.map(({ id: uid }) =>
		prisma.notification.create({
			data: {
				userId: uid,
				type: "file_upload",
				message: notifMessage,
				metadata: { fileId: record.id },
				},
			})
		)
	);	

	const admins = await prisma.userRole.findMany({
		where: { role: { name: "admin" } },
		include: { user: true },
});
for (const { user } of admins) {
  await sendEmail(
    user.email,
    "New File Uploaded",
    `<p>A new file <strong>${record.filename}</strong> was just uploaded.</p>`
  );
}

    return res.status(201).json(record);
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
}
