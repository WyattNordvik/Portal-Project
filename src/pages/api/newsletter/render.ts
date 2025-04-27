// src/pages/api/newsletter/render.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mjml2html from "mjml"; // ✅ default import, not curly braces

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { mjml } = req.body;
  if (!mjml) return res.status(400).json({ error: "MJML is required" });

  try {
    const { html, errors } = mjml2html(mjml); // ✅ use mjml2html

    if (errors.length > 0) {
      console.error("MJML parsing errors:", errors);
      return res.status(400).json({ error: "Invalid MJML", details: errors });
    }

    return res.status(200).json({ html });
  } catch (err) {
    console.error("MJML Render Error:", err);
    return res.status(500).json({ error: "Render failed" });
  }
}

