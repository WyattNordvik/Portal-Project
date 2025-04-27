// src/pages/api/newsletter/send.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/db";
import { mjml2html } from "mjml";
import { sendEmail } from "@/lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  const { listId, subject, mjml, testEmail } = req.body;
  if (!subject || !mjml) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { html, errors } = mjml2html(mjml);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid MJML", details: errors });
  }

  if (testEmail) {
    // Send only to the test email address
    await sendEmail({
      to: testEmail,
      subject,
      html,
    });

    return res.status(200).json({ success: true, test: true });
  }

  // Otherwise, proceed to batch sending to the list (same batching code from before)

  const subscriptions = await prisma.subscription.findMany({
    where: { listId, status: "ACTIVE" },
    include: { subscriber: true },
  });

  if (!subscriptions.length) {
    return res.status(400).json({ error: "No subscribers found" });
  }

  const batchSize = 20;
  const delayMs = 2000;

  for (let i = 0; i < subscriptions.length; i += batchSize) {
    const batch = subscriptions.slice(i, i + batchSize);
    await Promise.all(
      batch.map((sub) => {
        if (!sub.subscriber?.email) return;
        return sendEmail({
          to: sub.subscriber.email,
          subject,
          html,
        });
      })
    );

    if (i + batchSize < subscriptions.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return res.status(200).json({ success: true, sent: subscriptions.length });
}

