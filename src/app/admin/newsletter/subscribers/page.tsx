"use client";
import { useEffect, useState } from "react";

export default function SubscribersPage() {
  const [lists, setLists]       = useState<{id:string;name:string}[]>([]);
  const [activeListId, setActive] = useState("");
  const [status, setStatus]     = useState("");

  useEffect(() => {
    fetch("/api/newsletter/lists")
      .then(r => r.json())
      .then(setLists);
  }, []);

  // Export handler
  const exportCsv = () => {
    if (!activeListId) return;
    window.open(`/api/admin/newsletter/export?listId=${activeListId}`, "_blank");
  };

  // Import handler
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeListId) return setStatus("Select a list first");
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("listId", activeListId);
    const res = await fetch("/api/admin/newsletter/import", { method:"POST", body: form });
    const json = await res.json();
    if (res.ok) setStatus(`Imported ${json.imported}`);
    else       setStatus(`Error: ${json.error}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subscribers</h1>

      <label className="block mb-4">
        Choose list:
        <select
          className="mt-1 border p-2"
          value={activeListId}
          onChange={(e) => setActive(e.target.value)}
        >
          <option value="">-- select --</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </label>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Export CSV
        </button>
        <label className="px-4 py-2 bg-yellow-500 text-black rounded cursor-pointer">
          Import CSV
          <input type="file" accept=".csv" onChange={onFile} className="hidden" />
        </label>
      </div>

      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}

