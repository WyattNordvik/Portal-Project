
"use client";

import { useEffect, useState } from "react";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  lists: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  joinedAt: string | null;
};
type Tag = { id: string; name: string };

export default function SubscribersPage() {
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [activeListId, setActiveListId] = useState("");
  const [activeTagId, setActiveTagId] = useState("");
  const [status, setStatus] = useState("");

  // Load lists & tags once
  useEffect(() => {
    fetch("/api/newsletter/lists")
      .then((r) => r.json())
      .then(setLists);

    fetch("/api/newsletter/tags")
      .then((r) => r.json())
      .then(setTags);
  }, []);

  // Fetch subscribers whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeListId) params.set("listId", activeListId);
    if (activeTagId) params.set("tagId", activeTagId);

    fetch(`/api/admin/newsletter/subscribers?${params.toString()}`)
      .then((r) => r.json())
      .then(setSubs)
      .catch((e) => setStatus(`Error loading subscribers: ${e}`));
  }, [activeListId, activeTagId]);

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (activeListId) params.set("listId", activeListId);
    if (activeTagId) params.set("tagId", activeTagId);
    window.open(`/api/admin/newsletter/export?${params.toString()}`, "_blank");
  };

  const removeTag = async (subscriberId: string, tagId: string) => {
    if (!confirm("Remove this tag from subscriber?")) return;
    await fetch(`/api/admin/newsletter/subscribers/${subscriberId}/tags/${tagId}`, {
      method: "DELETE",
    });
    location.reload();
  };

  const unsubscribeList = async (subscriberId: string, listId: string) => {
    if (!confirm("Unsubscribe this subscriber from this list?")) return;
    await fetch(`/api/admin/newsletter/subscribers/${subscriberId}/lists/${listId}`, {
      method: "DELETE",
    });
    location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Subscribers</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block mb-1 font-medium">Filter by List</label>
          <select
            className="border p-2"
            value={activeListId}
            onChange={(e) => setActiveListId(e.target.value)}
          >
            <option value="">— All Lists —</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Filter by Tag</label>
          <select
            className="border p-2"
            value={activeTagId}
            onChange={(e) => setActiveTagId(e.target.value)}
          >
            <option value="">— All Tags —</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={exportCsv}
          className="self-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      {/* Status/Error */}
      {status && <p className="text-red-600">{status}</p>}

      {/* Subscribers table */}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Lists</th>
            <th className="p-2">Tags</th>
            <th className="p-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name || "—"}</td>
              <td className="p-2">{s.email}</td>
              <td className="p-2">{s.phone || "—"}</td>
              <td className="p-2">
                {s.lists.map((list) => (
                  <div key={list.id} className="flex items-center gap-1">
                    {list.name}
                    <button
                      className="text-xs text-red-500 hover:underline"
                      onClick={() => unsubscribeList(s.id, list.id)}
                    >
                      [Remove]
                    </button>
                  </div>
                ))}
              </td>
              <td className="p-2">
                {s.tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-1">
                    {tag.name}
                    <button
                      className="text-xs text-red-500 hover:underline"
                      onClick={() => removeTag(s.id, tag.id)}
                    >
                      [Remove]
                    </button>
                  </div>
                ))}
              </td>
              <td className="p-2">
                {s.joinedAt ? new Date(s.joinedAt).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

