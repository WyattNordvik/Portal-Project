// src/pages/api/admin/newsletter/export.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }                     from "next-auth/next";
import { authOptions }                          from "@/pages/api/auth/[...nextauth]";
import { prisma }                               from "@/lib/db";
import { stringify }                            from "csv-stringify/sync";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth + admin check (same pattern as users export)
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { listId } = req.query;
  if (typeof listId !== "string") {
    return res.status(400).json({ error: "Missing listId" });
  }

  // Fetch all subscriptions for that list, including subscriber info
  const subs = await prisma.subscription.findMany({
    where: { listId, status: "ACTIVE" },
    include: { subscriber: true },
  });

  // Build CSV records
  const records = subs.map((s) => ({
    email: s.subscriber.email,
    name:  s.subscriber.name || "",
    phone: s.subscriber.phone || "",
    subscribedAt: s.subscribedAt?.toISOString() || "",
  }));

  const csv = stringify(records, {
    header: true,
    columns: ["email", "name", "phone", "subscribedAt"],
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="subscribers-${listId}.csv"`
  );
  res.send(csv);

  // Audit
  await prisma.auditLog.create({
    data: {
      userId,
      action:   "export_subscribers",
      metadata: { listId, count: subs.length },
    },
  });
}

