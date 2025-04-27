import type { NextApiRequest, NextApiResponse } from "next";
import mjml2html from "mjml";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { mjml } = req.body;

  if (!mjml) {
    return res.status(400).json({ error: "Missing MJML content" });
  }

  const { html, errors } = mjml2html(mjml, { validationLevel: "strict" });

  if (errors.length > 0) {
    const detailedErrors = errors.map((e) => ({
      line: e.line,
      message: e.message,
      tagName: e.tagName,
    }));

    return res.status(400).json({
      error: "Invalid MJML",
      details: detailedErrors,
    });
  }

  return res.status(200).json({ html });
}

