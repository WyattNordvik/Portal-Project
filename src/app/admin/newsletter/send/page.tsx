"use client";

import { useEffect, useState } from "react";

export default function SendNewsletterPage() {
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [subject, setSubject] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [mjml, setMjml] = useState("");
  const [html, setHtml] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/newsletter/lists")
      .then((r) => r.json())
      .then(setLists)
      .catch(() => setStatus("Failed to load lists"));
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!mjml.trim()) {
        setHtml("");
        return;
      }
      try {
        const res = await fetch("/api/newsletter/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mjml }),
        });
        const data = await res.json();
        if (res.ok) {
          setHtml(data.html);
        } else {
          console.error("Render error:", data.error);
          setHtml("<p style='color:red'>Error rendering preview</p>");
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [mjml]);

  const sendTest = async () => {
    if (!subject || !mjml) return alert("Subject and content required");
    try {
      await fetch("/api/newsletter/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, mjml }),
      });
      alert("Test email sent!");
    } catch {
      alert("Failed to send test email");
    }
  };

  const sendLive = async () => {
    if (!subject || !selectedListId || !mjml) return alert("All fields required");
    if (!confirm("Send newsletter to list?")) return;
    try {
      await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, mjml, listId: selectedListId }),
      });
      alert("Newsletter sent!");
    } catch {
      alert("Failed to send newsletter");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Send Newsletter</h1>

      {/* Form controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Subject Line"
          className="border p-2 flex-1 min-w-[200px]"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <select
          className="border p-2"
          value={selectedListId}
          onChange={(e) => setSelectedListId(e.target.value)}
        >
          <option value="">Select List</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button
          onClick={sendTest}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Send Test
        </button>
        <button
          onClick={sendLive}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Send Live
        </button>
      </div>

      {/* Editor and preview side-by-side */}
      <div className="flex flex-row gap-6">
        {/* MJML Editor */}
        <textarea
          value={mjml}
          onChange={(e) => setMjml(e.target.value)}
          placeholder="Paste your MJML code here..."
          className="border p-3 w-full md:w-1/2 h-[80vh] font-mono text-sm resize-none"
        />

        {/* Live Preview */}
        <div className="border p-3 w-full md:w-1/2 h-[80vh] overflow-auto bg-white">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

      {status && <p className="text-red-600">{status}</p>}
    </div>
  );
}

