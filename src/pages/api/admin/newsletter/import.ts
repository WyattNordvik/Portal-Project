// src/pages/api/admin/newsletter/import.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }                      from "next-auth/next";
import { authOptions }                           from "@/pages/api/auth/[...nextauth]";
import { prisma }                                from "@/lib/db";
import formidable                                from "formidable";
import fs                                        from "fs";
import { parse }                                 from "csv-parse/sync";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // form parse
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, _fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "File upload error" });
    }
    const file    = files.file as formidable.File;
    const content = await fs.promises.readFile(file.filepath, "utf-8");
    const rows    = parse(content, { columns: true });

    let count = 0;
    for (const row of rows) {
      const { email, name, phone } = row as any;
      // upsert subscriber
      const sub = await prisma.subscriber.upsert({
        where: { email },
        create: { email, name, phone },
        update: { name, phone },
      });
      // activate subscription
      await prisma.subscription.upsert({
        where: {
          subscriberId_listId: {
            subscriberId: sub.id,
            listId: (req.query.listId as string) || "",
          },
        },
        create: {
          subscriberId: sub.id,
          listId: req.query.listId as string,
          status: "ACTIVE",
          subscribedAt: new Date(),
        },
        update: {
          status:      "ACTIVE",
          subscribedAt: new Date(),
        },
      });
      count++;
    }

    // Audit
    await prisma.auditLog.create({
      data: {
        userId,
        action:   "import_subscribers",
        metadata: { listId: req.query.listId, count },
      },
    });

    res.status(201).json({ imported: count });
  });
}

