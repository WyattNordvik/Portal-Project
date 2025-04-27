// src/pages/api/newsletter/send-test.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { mjmlToHtml } from "mjml";
import { transporter } from "@/lib/mailer"; // assuming you already have a transporter set up

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { to, subject, mjml } = req.body;

  if (!to || !subject || !mjml) {
    return res.status(400).json({ error: "Missing to, subject, or mjml" });
  }

  try {
    // 1. Convert MJML to HTML
    const { html, errors } = mjmlToHtml(mjml);

    if (errors.length) {
      console.error("MJML Errors:", errors);
      return res.status(400).json({ error: "Invalid MJML" });
    }

    // 2. Send email
    await transporter.sendMail({
      to,
      from: `"Your Organization" <no-reply@yourdomain.com>`, // customize this
      subject,
      html,
    });

    return res.status(200).json({ message: "Test email sent!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send test email" });
  }
}

