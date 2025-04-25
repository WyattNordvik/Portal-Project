// src/pages/api/admin/newsletter/export.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }                     from "next-auth/next";
import { authOptions }                          from "@/pages/api/auth/[...nextauth]";
import { prisma }                               from "@/lib/db";
import { stringify }                            from "csv-stringify/sync";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth + admin check
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  // Only GET allowed
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { listId, tagId } = req.query as { listId?: string; tagId?: string };

  // Collect CSV records here
  let records: Record<string, any>[] = [];

  if (listId) {
    // Export subscribers of a list
    const subs = await prisma.subscription.findMany({
      where: { listId, status: "ACTIVE" },
      include: { subscriber: true },
    });
    records = subs.map((s) => ({
      email:       s.subscriber.email,
      name:        s.subscriber.name || "",
      phone:       s.subscriber.phone || "",
      subscribedAt: s.subscribedAt?.toISOString() || "",
    }));
  } else if (tagId) {
    // Export subscribers by tag
    const subs = await prisma.subscriber.findMany({
      where: { tags: { some: { tagId } } },
      include: { tags: { include: { tag: true } } },
    });
    records = subs.map((s) => ({
      email: s.email,
      name:  s.name || "",
      phone: s.phone || "",
      tags:  s.tags.map((st) => st.tag.name).join(";"),
    }));
  } else {
    return res.status(400).json({ error: "Missing listId or tagId" });
  }

  // Dynamically determine CSV columns
  const columns = Object.keys(records[0] || {}) as string[];
  const csv     = stringify(records, { header: true, columns });

  // Set appropriate headers for download
  const fileName = listId
    ? `subscribers-list-${listId}.csv`
    : `subscribers-tag-${tagId}.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(csv);

  // Audit the export action
  await prisma.auditLog.create({
    data: {
      userId,
      action:   listId ? "export_subscribers" : "export_tag_subscribers",
      metadata: listId
        ? { listId, count: records.length }
        : { tagId,   count: records.length },
    },
  });
}

