"use client";

import { useState, useEffect } from "react";

export default function SendNewsletterPage() {
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [subject, setSubject] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [mjml, setMjml] = useState("");
  const [html, setHtml] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/newsletter/lists")
      .then((r) => r.json())
      .then(setLists)
      .catch(() => setStatus("Failed to load lists"));
  }, []);

  // Auto update HTML preview
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
        setHtml("<p style='color:red'>Error rendering preview</p>");
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [mjml]);

  const sendTest = async () => {
    if (!subject || !mjml || !testEmail) {
      alert("Subject, MJML content, and test email required");
      return;
    }
    try {
      const res = await fetch("/api/newsletter/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          subject,
          mjml,
        }),
      });
      if (res.ok) {
        alert("Test email sent!");
      } else {
        alert("Failed to send test email");
      }
    } catch {
      alert("Failed to send test email");
    }
  };

  const sendLive = async () => {
    if (!subject || !selectedListId || !mjml) {
      alert("Subject, MJML content, and list selection required");
      return;
    }
    if (!confirm("Are you sure you want to send the newsletter to the list?")) return;

    setSending(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, mjml, listId: selectedListId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Newsletter sent to ${data.sent} subscribers!`);
      } else {
        alert(data.error || "Failed to send newsletter");
      }
    } catch {
      alert("Unexpected error sending newsletter");
    } finally {
      setSending(false);
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
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Test email address"
          className="border p-2 rounded min-w-[200px]"
        />
        <button
          onClick={sendTest}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Send Test
        </button>
        <button
          onClick={sendLive}
          disabled={sending}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {sending ? "Sending..." : "Send Live"}
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

