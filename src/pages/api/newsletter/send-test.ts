import { NextApiRequest, NextApiResponse } from "next";
import { transporter } from "@/lib/mailer";
import { mjmlToHtml } from "mjml";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { to, subject, mjml } = req.body;

  if (!to || !subject || !mjml) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { html } = mjmlToHtml(mjml);

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@example.com",
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    // If using Ethereal, log the preview URL
    if (process.env.SMTP_HOST?.includes("ethereal")) {
      const ethereal = await import("nodemailer");
      console.log("Preview URL:", ethereal.getTestMessageUrl(info));
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to send" });
  }
}

