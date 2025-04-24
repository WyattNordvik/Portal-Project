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
  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method !== "POST") {
    return res.setHeader("Allow", ["POST"]).status(405).end();
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(400).json({ error: "Upload error" });
    const file = (files.file as formidable.File);
    const content = await fs.promises.readFile(file.filepath, "utf-8");
    const records = parse(content, { columns: true });

    const created: any[] = [];
    for (const row of records) {
      // Expect columns: email,name,role1;role2
      const { email, name, roles } = row as any;
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: "", // or generate a random password & email it
        },
      });
      for (const roleName of (roles as string).split(";")) {
        const role = await prisma.role.findFirstOrThrow({ where: { name: roleName } });
        await prisma.userRole.create({
          data: { userId: user.id, roleId: role.id },
        });
      }
      created.push(user);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action:   "bulk_import",
        metadata: { count: created.length },
      },
    });

    res.status(201).json({ imported: created.length });
  });
}

