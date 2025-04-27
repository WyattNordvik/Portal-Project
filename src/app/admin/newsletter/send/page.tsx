"use client";

import { useEffect, useState } from "react";

export default function SendNewsletterPage() {
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [subject, setSubject] = useState("");
  const [mjml, setMjml] = useState("");
  const [html, setHtml] = useState("");
  const [status, setStatus] = useState("");

  // Load newsletter lists
  useEffect(() => {
    fetch("/api/newsletter/lists")
      .then((r) => r.json())
      .then(setLists);
  }, []);

  // Live MJML Preview
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!mjml.trim()) {
        setHtml("");
        return;
      }

      try {
        const res = await fetch("/api/newsletter/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mjml }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.details?.map((d: any) => d.message).join("\n") || "Invalid MJML");
        }

        const { html } = await res.json();
        setHtml(html);
      } catch (e: any) {
        setHtml(`<div class="text-red-500 p-4">Error: ${e.message}</div>`);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [mjml]);

  const sendNewsletter = async () => {
    if (!selectedListId || !subject.trim() || !mjml.trim()) {
      setStatus("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: selectedListId,
          subject,
          mjml,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send newsletter.");
      }

      setStatus("✅ Newsletter is queued for sending!");
      setSubject("");
      setMjml("");
      setSelectedListId("");
      setHtml("");
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Send Newsletter</h1>

      {/* Controls */}
      <div className="space-y-4">
        <select
          className="border p-2 w-full"
          value={selectedListId}
          onChange={(e) => setSelectedListId(e.target.value)}
        >
          <option value="">— Select Newsletter List —</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Subject line"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border p-2 w-full"
        />

        <button
          onClick={sendNewsletter}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Send Newsletter
        </button>

        {status && <div className="text-red-500">{status}</div>}
      </div>

      {/* Editor + Preview */}
      <div className="flex gap-6 mt-8">
        {/* MJML Editor */}
        <textarea
          placeholder="Paste or write MJML here..."
          value={mjml}
          onChange={(e) => setMjml(e.target.value)}
          className="border p-2 w-1/2 h-[80vh] font-mono resize-none"
        />

        {/* Preview */}
        <div className="border p-4 w-1/2 h-[80vh] overflow-y-auto bg-white">
          <h2 className="text-lg font-semibold mb-2">Preview:</h2>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}

