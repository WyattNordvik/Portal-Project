import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { compile } from "mjml";
import { sendEmail } from "@/lib/email"; // you already have this from your SMTP setup
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();
  const userId = String(session.user.id);

  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).end();

  const { listId, subject, mjml } = req.body;
  if (!listId || !subject || !mjml) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const subscribers = await prisma.subscription.findMany({
    where: {
      listId,
      status: "ACTIVE",
    },
    include: { subscriber: true },
  });

  if (subscribers.length === 0) {
    return res.status(400).json({ error: "No active subscribers for this list" });
  }

  const compiled = compile(mjml, { validationLevel: "strict" });
  if (compiled.errors.length > 0) {
    return res.status(400).json({ error: "Invalid MJML format" });
  }

  const html = compiled.html;

  // Batching emails 50 at a time
  const batchSize = 50;
  const batches = Math.ceil(subscribers.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const batch = subscribers.slice(i * batchSize, (i + 1) * batchSize);
    await Promise.all(
      batch.map(({ subscriber }) =>
        sendEmail({
          to: subscriber.email,
          subject,
          html,
        })
      )
    );
  }

  return res.status(200).json({ message: "Newsletter sent" });
}

