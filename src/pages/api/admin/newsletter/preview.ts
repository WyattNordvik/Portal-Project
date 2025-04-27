import { compile } from "mjml";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { mjml } = req.body;
  if (!mjml) return res.status(400).json({ error: "No MJML provided" });

  const compiled = compile(mjml, { validationLevel: "strict" });
  if (compiled.errors.length > 0) {
    return res.status(400).json({ error: "Invalid MJML format" });
  }

  return res.status(200).json({ html: compiled.html });
}

