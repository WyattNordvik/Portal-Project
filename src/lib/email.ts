// src/lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:     process.env.SMTP_HOST,
  port:     Number(process.env.SMTP_PORT),
  secure:   process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from:    process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });

  console.log("Mail sent:", info.messageId);
  // For Ethereal, log the preview URL:
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log("Preview URL:", preview);
  }
}

