"use client";

import { useEffect, useState } from "react";

type Tag = { id: string; name: string };
type Subscriber = { id: string; email: string; name?: string; tags: Tag[] };

export default function TagsPage() {
  const [tags, setTags]               = useState<Tag[]>([]);
  const [newTag, setNewTag]           = useState("");
  const [subs, setSubs]               = useState<Subscriber[]>([]);
  const [selectedSubId, setSelected]  = useState<string>("");
  const [selectedTagId, setSelectedTag] = useState<string>("");

  // Load tags and subscribers
  useEffect(() => {
    fetch("/api/newsletter/tags")
      .then((r) => r.json())
      .then(setTags);

    fetch("/api/admin/newsletter/subscribers?listId=") // reuse your existing endpoint, passing no listId to get all?
      .then((r) => r.json())
      .then(setSubs);
  }, []);

  // Create tag
  const addTag = async () => {
    if (!newTag.trim()) return;
    const res = await fetch("/api/newsletter/tags", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: newTag.trim() }),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags((t) => [...t, tag]);
      setNewTag("");
    }
  };

  // Delete tag
  const deleteTag = async (id: string) => {
    if (!confirm("Delete tag?")) return;
    await fetch(`/api/newsletter/tags/${id}`, { method: "DELETE" });
    setTags((t) => t.filter((x) => x.id !== id));
    // also remove it locally from each subscriber
    setSubs((s) =>
      s.map((sub) => ({
        ...sub,
        tags: sub.tags.filter((tg) => tg.id !== id),
      }))
    );
  };

  // Assign tag to subscriber
  const assign = async () => {
    if (!selectedSubId || !selectedTagId) return;
    await fetch("/api/newsletter/subscriber-tags", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ subscriberId: selectedSubId, tagId: selectedTagId }),
    });
    // update local
    setSubs((s) =>
      s.map((sub) =>
        sub.id === selectedSubId
          ? {
              ...sub,
              tags: [...sub.tags, tags.find((t) => t.id === selectedTagId)!],
            }
          : sub
      )
    );
  };

  // Remove tag
  const unassign = async (subId: string, tagId: string) => {
    await fetch("/api/newsletter/subscriber-tags", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ subscriberId: subId, tagId }),
    });
    setSubs((s) =>
      s.map((sub) =>
        sub.id === subId
          ? { ...sub, tags: sub.tags.filter((tg) => tg.id !== tagId) }
          : sub
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tag Management</h1>

      {/* Create new */}
      <div className="flex items-center space-x-2">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="New tag name"
          className="border p-2"
        />
        <button onClick={addTag} className="px-3 py-1 bg-green-600 text-white rounded">
          Add Tag
        </button>
      </div>

      {/* Existing tags */}
      <ul className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <li key={t.id} className="bg-gray-200 px-2 py-1 rounded inline-flex items-center">
            {t.name}
            <button
              onClick={() => deleteTag(t.id)}
              className="ml-1 text-red-600 font-bold"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {/* Assign/Unassign to subscribers */}
      <div className="space-y-4">
        <h2 className="font-semibold">Assign Tag to Subscriber</h2>
        <div className="flex space-x-2">
          <select
            className="border p-2"
            value={selectedSubId}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select subscriber</option>
            {subs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.email}
              </option>
            ))}
          </select>
          <select
            className="border p-2"
            value={selectedTagId}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">Select tag</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button onClick={assign} className="px-3 py-1 bg-blue-600 text-white rounded">
            Assign
          </button>
        </div>
      </div>

      {/* Subscribers & their tags */}
      <div>
        <h2 className="font-semibold mb-2">Subscribers</h2>
        <ul className="space-y-2">
          {subs.map((s) => (
            <li key={s.id} className="border p-2 rounded">
              <div className="font-medium">{s.name || s.email}</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {s.tags.map((t) => (
                  <span
                    key={t.id}
                    className="bg-blue-100 px-2 py-1 rounded inline-flex items-center"
                  >
                    {t.name}
                    <button
                      onClick={() => unassign(s.id, t.id)}
                      className="ml-1 text-red-600 font-bold"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

