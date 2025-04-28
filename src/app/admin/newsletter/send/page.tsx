"use client";

import { useEffect, useState } from "react";
import mjml2html from "mjml";
import { toast } from "react-hot-toast";

type Template = { id: string; name: string; subject: string; mjml: string };

export default function SendNewsletterPage() {
  const [subject, setSubject] = useState("");
  const [mjml, setMjml] = useState("");
  const [html, setHtml] = useState("");
  const [to, setTo] = useState("");
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetch("/api/admin/newsletter/templates")
      .then((r) => r.json())
      .then((data) => {
		  console.log("Templates data:", data);
	  setTemplates(data);
	  })
      .catch(() => toast.error("Failed to load templates"));

    fetch("/api/newsletter/lists")
      .then((r) => r.json())
      .then(setLists)
      .catch(() => toast.error("Failed to load lists"));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!mjml.trim()) {
        setHtml("");
        return;
      }
      const res = await fetch("/api/newsletter/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mjml }),
      });
      const data = await res.json();
      if (data.html) {
        setHtml(data.html);
      } else {
        console.error("Render error:", data.error);
        setHtml("<p style='color:red'>Error rendering preview</p>");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [mjml]);

  const sendTest = async () => {
    try {
      const res = await fetch("/api/newsletter/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, mjml }),
      });
      if (res.ok) {
        toast.success("Test email sent!");
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      toast.error("Failed to send test");
    }
  };

  const sendLive = async () => {
    if (!selectedListId) {
      toast.error("Select a list first");
      return;
    }
    if (!confirm("Are you sure you want to send to all subscribers on this list?")) return;
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: selectedListId, subject, mjml }),
      });
      if (res.ok) {
        toast.success("Emails sent!");
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      toast.error("Failed to send");
    }
  };

  const saveTemplate = async () => {
    const name = prompt("Enter a name for this template:");
    if (!name) return;
    try {
      const res = await fetch("/api/admin/newsletter/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, mjml }),
      });
      if (res.ok) {
        const newTemplate = await res.json();
        setTemplates((prev) => [newTemplate, ...prev]);
        toast.success("Template saved!");
      } else {
        throw new Error("Failed to save template");
      }
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  const loadTemplate = (template: Template) => {
    if (!confirm(`Load template "${template.name}"? This will overwrite current content.`)) return;
    setSubject(template.subject);
    setMjml(template.mjml);
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/admin/newsletter/templates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success("Template deleted");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  } catch (err) {
	  toast.error("Failed to delete");
  }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Send Newsletter</h1>

      {/* Controls - Subject, List, Test Email */}
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Select List</label>
          <select
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">— Select List —</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Test email address"
            className="border p-2 flex-1"
          />
          <button onClick={sendTest} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
            Send Test
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={sendLive}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
          >
            Send Live
          </button>

          <button
            onClick={saveTemplate}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
          >
            Save as Template
          </button>
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="grid grid-cols-2 gap-6">
        <textarea
          className="border p-2 w-full h-96 font-mono"
          placeholder="<mjml>...</mjml>"
          value={mjml}
          onChange={(e) => setMjml(e.target.value)}
        />

        <div>
          <div
            className="border p-4 bg-white rounded shadow overflow-auto"
            style={{ minHeight: "400px" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
		
{/* Templates */}
<div className="mt-12">
  <h2 className="text-xl font-semibold mb-4">Templates</h2>

  {/* Grid of Template Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {templates.length > 0 ? (
      templates.map((t) => (
        <div
          key={t.id}
          className="border rounded shadow hover:shadow-lg cursor-pointer overflow-hidden bg-white flex flex-col"
        >
          <div
            className="p-2 flex-1 overflow-auto"
            onClick={() => loadTemplate(t)}
          >
            <div className="text-sm font-semibold mb-2">{t.name}</div>
            <div className="text-xs text-gray-500 mb-2">{t.subject}</div>

            <div
              className="border rounded bg-gray-50 p-2 overflow-hidden text-xs h-32"
              dangerouslySetInnerHTML={{ __html: mjml2html(t.mjml).html }}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTemplate(t.id);
            }}
            className="text-red-600 hover:underline text-xs p-2 text-center border-t"
          >
            Delete
          </button>
        </div>
      ))
    ) : (
      <div className="text-gray-500">No templates saved yet.</div>
    )}
  </div>
</div>


