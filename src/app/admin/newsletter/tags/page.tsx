// src/app/admin/newsletter/tags/page.tsx
"use client";

import { useEffect, useState } from "react";

type Tag = { id: string; name: string };
type Subscriber = { id: string; email: string; name?: string; tags: Tag[] };

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");

  // Load tags and subscribers
  useEffect(() => {
    fetch("/api/newsletter/tags")
      .then((r) => r.json())
      .then(setTags);

    fetch("/api/admin/newsletter/subscribers?listId=")
      .then((r) => r.json())
      .then(setSubs);
  }, []);

  // Create new tag
  const addTag = async () => {
    if (!newTag.trim()) return;
    const res = await fetch("/api/newsletter/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag.trim() }),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags((prev) => [...prev, tag]);
      setNewTag("");
    }
  };

  // Delete a tag completely
  const deleteTag = async (id: string) => {
    if (!confirm("Delete tag?")) return;
    await fetch(`/api/newsletter/tags/${id}`, { method: "DELETE" });
    setTags((prev) => prev.filter((t) => t.id !== id));
    setSubs((prev) =>
      prev.map((sub) => ({
        ...sub,
        tags: sub.tags.filter((tag) => tag.id !== id),
      }))
    );
  };

  // Assign tag to subscriber
  const assign = async () => {
    if (!selectedSubId || !selectedTagId) return;
    const res = await fetch("/api/newsletter/subscriber-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriberId: selectedSubId, tagId: selectedTagId }),
    });
    if (res.ok) {
      setSubs((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubId
            ? {
                ...sub,
                tags: [...sub.tags, tags.find((t) => t.id === selectedTagId)!],
              }
            : sub
        )
      );
    }
  };

  // Remove tag from subscriber
  const unassign = async (subId: string, tagId: string) => {
    const res = await fetch("/api/newsletter/subscriber-tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriberId: subId, tagId }),
    });
    if (res.ok) {
      setSubs((prev) =>
        prev.map((sub) =>
          sub.id === subId
            ? { ...sub, tags: sub.tags.filter((tag) => tag.id !== tagId) }
            : sub
        )
      );
    } else {
      alert("Failed to unassign tag");
    }
  };

  // Delete subscriber completely
  const deleteSubscriber = async (subId: string) => {
    if (!confirm("Delete this subscriber?")) return;
    const res = await fetch(`/api/admin/newsletter/subscribers/${subId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSubs((prev) => prev.filter((sub) => sub.id !== subId));
    } else {
      alert("Failed to delete subscriber");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tag Management</h1>

      {/* Create new tag */}
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
        {tags.map((tag) => (
          <li key={tag.id} className="bg-gray-200 px-2 py-1 rounded inline-flex items-center">
            {tag.name}
            <button
              onClick={() => deleteTag(tag.id)}
              className="ml-1 text-red-600 font-bold"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {/* Assign tag to subscriber */}
      <div className="space-y-4">
        <h2 className="font-semibold">Assign Tag to Subscriber</h2>
        <div className="flex space-x-2">
          <select
            className="border p-2"
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
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
            onChange={(e) => setSelectedTagId(e.target.value)}
          >
            <option value="">Select tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
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
        <ul className="space-y-4">
          {subs.map((sub) => (
            <li key={sub.id} className="border p-4 rounded space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">{sub.name || sub.email}</div>
                <button
                  onClick={() => deleteSubscriber(sub.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete Subscriber
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {sub.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium inline-flex items-center"
                  >
                    {tag.name}
                    <button
                      onClick={() => unassign(sub.id, tag.id)}
                      className="ml-2 text-red-600 font-bold"
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

