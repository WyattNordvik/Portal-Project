"use client";

import { useState } from "react";

export default function SendNewsletterPage() {
  const [subject, setSubject] = useState("");
  const [mjml, setMjml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [sending, setSending] = useState(false);

  const generatePreview = async () => {
    const res = await fetch("/api/newsletter/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mjml }),
    });
    const data = await res.json();
    setPreviewHtml(data.html);
  };

  const sendTestEmail = async () => {
    setSending(true);
    await fetch("/api/newsletter/send-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, mjml }),
    });
    setSending(false);
    alert("Test email sent!");
  };

  const sendNewsletter = async () => {
    if (!confirm("Are you sure you want to send this newsletter?")) return;
    setSending(true);
    await fetch("/api/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, mjml }),
    });
    setSending(false);
    alert("Newsletter sent!");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Send Newsletter</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Subject</label>
          <input
            className="border p-2 w-full"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter the email subject..."
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">MJML Content</label>
          <textarea
            className="border p-2 w-full h-64 font-mono"
            value={mjml}
            onChange={(e) => setMjml(e.target.value)}
            placeholder="Paste your MJML markup here..."
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={generatePreview}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate Preview
          </button>
          <button
            onClick={sendTestEmail}
            disabled={sending}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Send Test
          </button>
          <button
            onClick={sendNewsletter}
            disabled={sending}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Send Newsletter
          </button>
        </div>

        {previewHtml && (
          <div className="border p-4 rounded bg-white">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        )}
      </div>
    </div>
  );
}

