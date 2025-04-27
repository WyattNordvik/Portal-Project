import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { sendEmail } from "@/lib/email"; 
import { compile } from "mjml";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  const { subject, mjml } = req.body;
  if (!subject || !mjml) return res.status(400).json({ error: "Missing fields" });

  const compiled = compile(mjml, { validationLevel: "strict" });
  if (compiled.errors.length > 0) {
    return res.status(400).json({ error: "Invalid MJML format" });
  }

  const html = compiled.html;

  await sendEmail({
    to: session.user.email,
    subject,
    html,
  });

  return res.status(200).json({ message: "Test email sent" });
}

