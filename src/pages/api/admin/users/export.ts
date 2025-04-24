import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions }      from "@/pages/api/auth/[...nextauth]";
import { prisma }           from "@/lib/db";
import { stringify }        from "csv-stringify/sync";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method !== "GET") {
    return res.setHeader("Allow", ["GET"]).status(405).end();
  }

  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
  });

  // Prepare rows: id,email,name,roles
  const records = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    roles: u.roles.map((ur) => ur.role.name).join(";"),
  }));

  const csv = stringify(records, {
    header: true,
    columns: ["id", "email", "name", "roles"],
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="users.csv"`);
  res.send(csv);

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "export_users",
      metadata: { count: users.length },
    },
  });
}

