// src/pages/api/newsletter/send.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { transporter } from "@/lib/mailer";
import mjml2html from "mjml"; // no /lib/index.cjs here
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { subject, mjml, listId, tagId } = req.body;

  if (!subject || !mjml || (!listId && !tagId)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { html } = mjml2html(mjml);

  // Fetch subscribers
  const where: any = {};
  if (listId) {
    where.subscriptions = { some: { listId, status: "ACTIVE" } };
  }
  if (tagId) {
    where.tags = { some: { tagId } };
  }

  const subscribers = await prisma.subscriber.findMany({
    where,
    select: { email: true },
  });

  if (subscribers.length === 0) {
    return res.status(404).json({ error: "No subscribers found." });
  }

  // Split into batches of 50
  const batches = chunkArray(subscribers, 50);

  // Send emails
  for (const batch of batches) {
    const promises = batch.map((s) =>
      transporter.sendMail({
        from: process.env.EMAIL_FROM || "no-reply@example.com",
        to: s.email,
        subject,
        html,
      })
    );

  let previewLogged= 0;
	
  for (const subscriber of subscribers) {
	  const info = await transporter.sendMail({
		from: process.env.EMAIL_FROM || "no-reply@example.com",
		to: subscriber.email,
		subject,
		html,
	  });

  if (process.env.SMTP_HOST?.includes("ethereal") && previewLogged < 5) {
	const ethereal = await import("nodemailer");
	console.log("Preview URL for", subscriber.email, ":", ethereal.getTestMessageUrl(info));
	previewLogged++;
    }
  }

    await Promise.all(promises);

    // Small delay between batches (optional, protects SMTP server)
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5 sec delay
  }

  return res.status(200).json({ success: true, sent: subscribers.length });
}

