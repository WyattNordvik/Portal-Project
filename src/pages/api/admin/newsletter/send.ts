// src/pages/api/newsletter/send.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/db";
import { mjml2html } from "mjml";
import { sendEmail } from "@/lib/email"; // <- using your existing email sender

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate admin
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  // Validate request body
  const { listId, subject, mjml } = req.body;
  if (!listId || !subject || !mjml) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Compile MJML to HTML
  const { html, errors } = mjml2html(mjml);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid MJML", details: errors });
  }

  // Fetch subscribers
  const subscribers = await prisma.subscription.findMany({
    where: { listId, status: "ACTIVE" },
    include: { subscriber: true },
  });

  if (!subscribers.length) {
    return res.status(400).json({ error: "No subscribers found for this list" });
  }

  // Send email to each subscriber
  for (const sub of subscribers) {
    const email = sub.subscriber.email;
    if (!email) continue;

    // You could personalize the HTML here if you wanted...
    await sendEmail({
      to: email,
      subject,
      html,
    });
  }

  return res.status(200).json({ success: true, sent: subscribers.length });
}

