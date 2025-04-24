// src/pages/api/admin/users/export.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }                     from "next-auth/next";
import { authOptions }                          from "@/pages/api/auth/[...nextauth]";
import { prisma }                               from "@/lib/db";
import { stringify }                            from "csv-stringify/sync";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) NextAuth session
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 2) Coerce id to string
  const userId = String(session.user.id);

  // 3) Verify admin via UserRole join table
  const isAdmin = await prisma.userRole.findFirst({
    where: {
      userId,
      role: { name: "admin" },
    },
  });
  if (!isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  // Only GET allowed
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 4) Fetch users + roles
  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
  });

  // 5) Build CSV
  const records = users.map((u) => ({
    id:    u.id,
    email: u.email,
    name:  u.name,
    roles: u.roles.map((ur) => ur.role.name).join(";"),
  }));
  const csv = stringify(records, { header: true, columns: ["id","email","name","roles"] });

  // 6) Send it
  res.setHeader("Content-Type",        "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="users.csv"`);
  res.send(csv);

  // 7) Audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action:   "export_users",
      metadata: { count: users.length },
    },
  });
}

