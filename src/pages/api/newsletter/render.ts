import mjml2html from "mjml";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mjml } = req.body;

  if (!mjml) {
    return res.status(400).json({ error: "No MJML provided" });
  }

  try {
    console.log("MJML received:", mjml); // <-- ADD THIS
    const { html, errors } = mjml2html(mjml);

    if (errors.length > 0) {
      console.error("MJML parsing errors:", errors);
      return res.status(400).json({ error: "MJML errors", details: errors });
    }

    return res.status(200).json({ html });
  } catch (e: any) {
    console.error("MJML Render Error:", e);
    return res.status(500).json({ error: "MJML render error", details: e.message });
  }
}

